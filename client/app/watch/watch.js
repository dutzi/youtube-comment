'use strict';

angular.module('youtubeCommentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('watch', {
        url: '/watch',
        templateUrl: 'app/watch/watch.html',
        controller: 'WatchCtrl'
      });
  });