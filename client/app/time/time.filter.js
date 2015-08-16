'use strict';

angular.module('youtubeCommentApp').filter('time', function () {
	return function (time) {
		var hour = Math.floor(time / 3600);
		var min = Math.floor(time / 60) % 60;
		var sec = time % 60;

		return ((hour)?hour + ':':'') + 
			((min < 10) ? '0' + min : min) + ':' +
			((sec < 10) ? '0' + sec : sec);
	};
});
