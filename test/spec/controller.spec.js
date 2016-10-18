'use strict';

describe('Module: ngScrollbar', function () {
  beforeEach(module('ngScrollbar'));

  var $controller, $document, $httpBackend;

  beforeEach(inject(function(_$controller_, _$document_, _$httpBackend_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $document = _$document_;
    }));

  beforeEach(function(){
    $httpBackend.expectGET('../dist/ng-scrollbar.html').respond(200);
  });

  describe('method: chooseTheme', function(){
    var controller, $scope;
    beforeEach(function(){
      $scope = {};
      controller = $controller('MainCtrl', {$scope: $scope});
    });

    it('should provide default if no theme', function(){
      $scope.chooseTheme('');
      expect($scope.theme).toEqual('default');
    });

    it('should provide default if wrong theme', function(){
      $scope.chooseTheme('foobar');
      expect($scope.theme).toEqual('default');
    });

    it('should provide the theme if right theme inserted', function(){
      $scope.chooseTheme('mac');
      expect($scope.theme).toEqual('mac');
    });
  });

  describe('method: choosePath', function(){
    var controller, $scope;
    beforeEach(function(){
      $scope = {};
      controller = $controller('MainCtrl', {$scope: $scope});
    });

    it('should provide ../dist/ if no path', function(){
      $scope.choosePath(null);
      expect($scope.path).toEqual('../dist/');
    });

    it('should provide path + / if wrong path', function(){
      $scope.choosePath('foobar');
      expect($scope.path).toEqual('foobar/');
    });

    it('should provide the theme if right theme inserted', function(){
      $scope.choosePath('da/path/');
      expect($scope.path).toEqual('da/path/');
    });
  });

  describe('method: appendStyleSheet', function(){
    var controller, $scope;
    beforeEach(function(){
      $scope = {};
      controller = $controller('MainCtrl', {$scope: $scope});
    });
    
    it('should append the css to head', function(){
      var nodeArray = [];

      for(var key in $document.find('link')){
        nodeArray.push($document.find('link')[key]);
      }

      function isRightNode(element){
        var wanted = angular.element('<link href="../dist/ng-scrollbar.min.css" rel="stylesheet">')[0];

        return element.href === wanted.href && element.rel === wanted.rel && element.parentNode.nodeName === 'HEAD';
      }

      expect(
        nodeArray.some(function(element){return isRightNode(element);})).toBe(true);
    });
  });
});
