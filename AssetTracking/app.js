'use strict';

// declare modules
angular.module('Authentication', []);
angular.module('myAsset', []);
angular.module('consultant', []);

angular.module('BasicHttpAuthExample', [
    'Authentication',
    'myAsset',
    'ngRoute',
    'ngCookies'
])

.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/login', {
            controller: 'loginCtrl',
            templateUrl: 'Views/login.html?'
        })

        .when('/angular', {
            controller: 'assetCtrl',
            templateUrl: 'Views/angular.html'
        })

        .when('/consultants', {
                    controller: 'assetCtrl',
                    templateUrl: 'Views/consultants.html'
                })

        .otherwise({ redirectTo: '/login' });
}])

.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }]);

