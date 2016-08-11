//Imports
require('./createLureController');
require('./gservice');
require('./queryCtrl');

var app = angular.module('lureFestivalApp', ['createLureController', 'queryCtrl', 'geolocation', 'gservice', 'ngRoute']);