/* global browser, element, by*/
'use strict';
describe('Module: ngScrollbar', function() {
    describe('Thumb events', function() {
        it('should have an offset greater than zero on dragging thumb', function() {
            browser.get('http://localhost:8080/test/e2e.html');
            var thumb = element(by.css('.ngsb-thumb'));
            var thumbPosition = element(by.css('.ngsb-thumb-pos'));

            thumbPosition.getCssValue('top')
                .then(function(data) {
                    expect(data).toEqual('0px');
                });

            browser
                .actions()
                .mouseMove(thumb)
                .dragAndDrop(thumb, {
                    x: 0,
                    y: 100
                })
                .perform();

            thumbPosition.getCssValue('top')
                .then(function(data) {
                    expect(Number(data.slice(0, -2)) > 0).toBe(true);
                });
        });
    });

    describe('Container events', function() {
        it('should have an offset less than zero on dragging thumb', function() {
            browser.get('http://localhost:8080/test/e2e.html');
            var thumb = element(by.css('.ngsb-thumb'));
            var container = element(by.css('.ngsb-container'));

            container.getCssValue('top')
                .then(function(data) {
                    expect(data).toEqual('0px');
                });

            browser
                .actions()
                .mouseMove(thumb)
                .dragAndDrop(thumb, {
                    x: 0,
                    y: 100
                })
                .perform();

            container.getCssValue('top')
                .then(function(data) {
                    expect(Number(data.slice(0, -2)) < 0).toBe(true);
                });
        });
    });
});