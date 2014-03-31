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
        var win, mainElm, transculdedContainer, tools, thumb, thumbLine, track;
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
          // TBD
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };
        var buildScrollbar = function () {
          win = angular.element($window);
          mainElm = angular.element(element.children()[0]);
          transculdedContainer = angular.element(mainElm.children()[0]);
          tools = angular.element(mainElm.children()[1]);
          thumb = angular.element(angular.element(tools.children()[0]).children()[0]);
          thumbLine = angular.element(thumb.children()[0]);
          track = angular.element(angular.element(tools.children()[0]).children()[1]);
          // Check if scroll bar is needed
          page.height = element[0].offsetHeight;
          page.scrollHeight = transculdedContainer[0].scrollHeight;
          if (page.height < page.scrollHeight) {
            scope.showYScrollbar = true;
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
            var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
            transculdedContainer[0].addEventListener(wheelEvent, wheelHandler, false);
            // Drag the scroller
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
        buildScrollbar();
        if (!!attrs.rebuildOn) {
          scope.$on(attrs.rebuildOn, function () {
            page.height = null;
            buildScrollbar();
          });
        }
      },
      template: '<div>' + '<div class="ngsb-wrap">' + '<div class="ngsb-container" ng-transclude></div>' + '<div class="ngsb-scrollbar" style="position: absolute; display: block;" ng-show="showYScrollbar">' + '<div class="ngsb-thumb-container">' + '<div class="ngsb-thumb-pos" oncontextmenu="return false;">' + '<div class="ngsb-thumb" ></div>' + '</div>' + '<div class="ngsb-track"></div>' + '</div>' + '</div>' + '</div>' + '</div>'
    };
  }
]);