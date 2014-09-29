'use strict';
angular.module('ngScrollbar', []).directive('ngScrollbar', [
  '$parse',
  '$window',
  function ($parse, $window) {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: { 'showYScrollbar': '=?isBarShown' },
      link: function (scope, element, attrs) {
        var mainElm, transculdedContainer, tools, thumb, thumbLine, track;
        var flags = { bottom: attrs.hasOwnProperty('bottom') };
        var win = angular.element($window);
        // Elements
        var dragger = { top: 0 }, page = { top: 0 };
        // Styles
        var scrollboxStyle, draggerStyle, draggerLineStyle, pageStyle;
        var calcStyles = function () {
          scrollboxStyle = {
            position: 'relative',
            overflow: 'hidden',
            'max-width': '100%',
            height: '100%'
          };
          if (page.height) {
            scrollboxStyle.height = page.height + 'px';
          }
          draggerStyle = {
            position: 'absolute',
            height: dragger.height + 'px',
            top: dragger.top + 'px'
          };
          draggerLineStyle = {
            position: 'relative',
            'line-height': dragger.height + 'px'
          };
          pageStyle = {
            position: 'relative',
            top: page.top + 'px',
            overflow: 'hidden'
          };
        };
        var redraw = function () {
          thumb.css('top', dragger.top + 'px');
          var draggerOffset = dragger.top / page.height;
          page.top = -Math.round(page.scrollHeight * draggerOffset);
          transculdedContainer.css('top', page.top + 'px');
        };
        var trackClick = function (event) {
          var offsetY = event.hasOwnProperty('offsetY') ? event.offsetY : event.layerY;
          var newTop = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
          dragger.top = newTop;
          redraw();
          event.stopPropagation();
        };
        var wheelHandler = function (event) {
          var wheelDivider = 20;
          // so it can be changed easily
          var deltaY = event.wheelDeltaY !== undefined ? event.wheelDeltaY / wheelDivider : event.wheelDelta !== undefined ? event.wheelDelta / wheelDivider : -event.detail * (wheelDivider / 10);
          dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - deltaY));
          redraw();
          if (!!event.preventDefault) {
            event.preventDefault();
          } else {
            return false;
          }
        };
        var lastOffsetY = 0;
        var thumbDrag = function (event, offsetX, offsetY) {
          dragger.top = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
          event.stopPropagation();
        };
        var dragHandler = function (event) {
          var newOffsetX = 0;
          var newOffsetY = event.pageY - thumb[0].scrollTop - lastOffsetY;
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };
        var _mouseUp = function (event) {
          win.off('mousemove', dragHandler);
          win.off('mouseup', _mouseUp);
          event.stopPropagation();
        };
        var _touchDragHandler = function (event) {
          var newOffsetX = 0;
          var newOffsetY = event.originalEvent.changedTouches[0].pageY - thumb[0].scrollTop - lastOffsetY;
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };
        var _touchEnd = function (event) {
          win.off('touchmove', _touchDragHandler);
          win.off('touchend', _touchEnd);
          event.stopPropagation();
        };
        var buildScrollbar = function (rollToBottom) {
          // Getting top position of a parent element to place scroll correctly
          var parentOffsetTop = element[0].parentElement.offsetTop;
          var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
          rollToBottom = flags.bottom || rollToBottom;
          mainElm = angular.element(element.children()[0]);
          transculdedContainer = angular.element(mainElm.children()[0]);
          tools = angular.element(mainElm.children()[1]);
          thumb = angular.element(angular.element(tools.children()[0]).children()[0]);
          thumbLine = angular.element(thumb.children()[0]);
          track = angular.element(angular.element(tools.children()[0]).children()[1]);
          // Check if scroll bar is needed
          page.height = element[0].offsetHeight - parentOffsetTop;
          if (page.height < 0) {
            page.height = element[0].offsetHeight;
          }
          page.scrollHeight = transculdedContainer[0].scrollHeight;
          if (page.height < page.scrollHeight) {
            scope.showYScrollbar = true;
            scope.$emit('scrollbar.show');
            // Calculate the dragger height
            dragger.height = Math.round(page.height / page.scrollHeight * page.height);
            dragger.trackHeight = page.height;
            // update the transcluded content style and clear the parent's
            calcStyles();
            element.css({ overflow: 'hidden' });
            mainElm.css(scrollboxStyle);
            transculdedContainer.css(pageStyle);
            thumb.css(draggerStyle);
            thumbLine.css(draggerLineStyle);
            // Bind scroll bar events
            track.bind('click', trackClick);
            // Handl mousewheel
            transculdedContainer[0].addEventListener(wheelEvent, wheelHandler, false);
            // Drag the scroller with the mouse
            thumb.on('mousedown', function (event) {
              lastOffsetY = event.pageY - thumb[0].offsetTop;
              win.on('mouseup', _mouseUp);
              win.on('mousemove', dragHandler);
              event.preventDefault();
            });
            // Drag the scroller by touch
            thumb.on('touchstart', function (event) {
              lastOffsetY = event.originalEvent.changedTouches[0].pageY - thumb[0].offsetTop;
              win.on('touchend', _touchEnd);
              win.on('touchmove', _touchDragHandler);
              event.preventDefault();
            });
            if (rollToBottom) {
              flags.bottom = false;
              dragger.top = parseInt(page.height, 10) - parseInt(dragger.height, 10);
            } else {
              dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10)));
            }
            redraw();
          } else {
            scope.showYScrollbar = false;
            scope.$emit('scrollbar.hide');
            thumb.off('mousedown');
            transculdedContainer[0].removeEventListener(wheelEvent, wheelHandler, false);
            transculdedContainer.attr('style', 'position:relative;top:0');
            // little hack to remove other inline styles
            mainElm.css({ height: '100%' });
          }
        };
        var rebuildTimer;
        var rebuild = function (e, data) {
          /* jshint -W116 */
          if (rebuildTimer != null) {
            clearTimeout(rebuildTimer);
          }
          /* jshint +W116 */
          var rollToBottom = !!data && !!data.rollToBottom;
          rebuildTimer = setTimeout(function () {
            page.height = null;
            buildScrollbar(rollToBottom);
            if (!scope.$$phase) {
              scope.$digest();
            }
            // update parent for flag update
            if (!scope.$parent.$$phase) {
              scope.$parent.$digest();
            }
          }, 72);
        };
        buildScrollbar();
        if (!!attrs.rebuildOn) {
          attrs.rebuildOn.split(' ').forEach(function (eventName) {
            scope.$on(eventName, rebuild);
          });
        }
        if (attrs.hasOwnProperty('rebuildOnResize')) {
          win.on('resize', rebuild);
        }
      },
      template: '<div>' + '<div class="ngsb-wrap">' + '<div class="ngsb-container" ng-transclude></div>' + '<div class="ngsb-scrollbar" style="position: absolute; display: block;" ng-show="showYScrollbar">' + '<div class="ngsb-thumb-container">' + '<div class="ngsb-thumb-pos" oncontextmenu="return false;">' + '<div class="ngsb-thumb" ></div>' + '</div>' + '<div class="ngsb-track"></div>' + '</div>' + '</div>' + '</div>' + '</div>'
    };
  }
]);