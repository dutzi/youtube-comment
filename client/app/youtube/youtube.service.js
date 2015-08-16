'use strict';

angular.module('youtubeCommentApp').service('youtube', function (
	$http
) {
	const KEY = 'AIzaSyCnvekvymQwGgtRuntaqAF_jzuzwJHvNkM';
	const baseUrl = 'https://www.googleapis.com/youtube/v3/';

	return {
		getComments(videoId) {
			return $http({
				url: `${baseUrl}commentThreads`,
				params: {
					part: 'snippet',
					videoId: videoId,
					key: KEY
				}
			});
		}
	}
});
