# ng-scrollbar
A custom scrollbar written in pure AngularJS.

Tired of using jquery for a stupid scrollbar? well, this directive is just for you. 


## Usage

1. Add ng-scrollbar.min.js to you main file (index.html)

  you can download this by:
  * using bower and running `bower install ng-scrollbar`
  * Download the [production version][min] or the [development version][max].
  
  [min]: https://raw.github.com/asafdav/ng-scrollbar/master/dist/angular-ng-scrollbar.min.js
  [max]: https://raw.github.com/asafdav/ng-scrollbar/master/dist/angular-ng-scrollbar.js
  
  In your web page:
  
  ```html
  <script src="angular.js"></script>
  <script src="dist/ng-scrollbar.min.js"></script>
  <link rel="stylesheet" href="dist/ng-scrollbar.min.css" >
```

2. Set `ngScrollbar` as a dependency in your module
  ```javascript
  var myapp = angular.module('myapp', ['ngScrollbar'])
  ```

3. Add ng-scrollbar directive to the wanted element, example:
  ```html
  <div class="scrollme" ng-scrollbar> .... </div>
  ```

## Rebuild the scrollbar 
In case you need to rebuild the scorllbar, you may tell ng-scrollbar to rebuild it for you by broadcasting an event. 
  ```html
  <div class="scrollme" ng-scrollbar rebuild-on="rebuild:me" > .... </div>
  ```
  
  ```javascript
  // rebuild the scrollbar
  $scope.$broadcast('rebuild:me');
  ```  
  
## Examples
See the example in the respository.
