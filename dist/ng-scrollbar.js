'use strict';
angular.module('ngScrollbar', []).directive('ngScrollbar', [
  '$parse',
  '$window',
  function ($parse, $window) {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      link: function (scope, element, attrs) {
        var mainElm, transculdedContainer, tools, thumb, thumbLine, track;
        var win = angular.element($window);
        var dragger = { top: 0 }, page = { top: 0 };
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
          var deltaY = event.wheelDeltaY !== undefined ? event.wheelDeltaY / 20 : event.wheelDelta !== undefined ? event.wheelDelta / 20 : -event.detail * 2;
          dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - deltaY));
          redraw();
          if (!!event.preventDefault) {
            event.preventDefault();
          } else {
            return false;
          }
        };
        var lastOffsetY;
        var thumbDrag = function (event, offsetX, offsetY) {
          var newTop = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
          dragger.top = newTop;
          event.stopPropagation();
        };
        var dragHandler = function (event) {
          var newOffsetY = event.pageY - thumb[0].scrollTop - lastOffsetY;
          var newOffsetX = 0;
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };
        var buildScrollbar = function () {
          mainElm = angular.element(element.children()[0]);
          transculdedContainer = angular.element(mainElm.children()[0]);
          tools = angular.element(mainElm.children()[1]);
          thumb = angular.element(angular.element(tools.children()[0]).children()[0]);
          thumbLine = angular.element(thumb.children()[0]);
          track = angular.element(angular.element(tools.children()[0]).children()[1]);
          page.height = element[0].offsetHeight;
          page.scrollHeight = transculdedContainer[0].scrollHeight;
          if (page.height < page.scrollHeight) {
            scope.showYScrollbar = true;
            dragger.height = Math.round(page.height / page.scrollHeight * page.height);
            dragger.trackHeight = page.height;
            calcStyles();
            element.css({ overflow: 'hidden' });
            mainElm.css(scrollboxStyle);
            transculdedContainer.css(pageStyle);
            thumb.css(draggerStyle);
            thumbLine.css(draggerLineStyle);
            track.bind('click', trackClick);
            var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
            transculdedContainer[0].addEventListener(wheelEvent, wheelHandler, false);
            thumb.bind('mousedown', function (event) {
              lastOffsetY = event.pageY - thumb[0].offsetTop;
              win.bind('mouseup', function () {
                win.unbind('mousemove', dragHandler);
                event.stopPropagation();
              });
              win.bind('mousemove', dragHandler);
              event.preventDefault();
            });
          } else {
            scope.showYScrollbar = false;
          }
        };
        var rebuildTimer;
        var rebuild = function (e, data) {
          if (rebuildTimer != null) {
            clearTimeout(rebuildTimer);
          }
          var rollToBottom = !!data && !!data.rollToBottom;
          rebuildTimer = setTimeout(function () {
            page.height = null;
            buildScrollbar(rollToBottom);
            if (!scope.$$phase) {
              scope.$digest();
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