'use strict';

angular.module('youtubeCommentApp').service('youtube', function (
	$http
) {
	const KEY = 'AIzaSyCnvekvymQwGgtRuntaqAF_jzuzwJHvNkM';
	const baseUrl = 'https://www.googleapis.com/youtube/v3/';

	// TODO - Handle paging

	return {
		getComments(videoId) {
			return $http({
				url: `${baseUrl}commentThreads`,
				params: {
					part: 'snippet,replies',
					maxResults: 100,
					videoId: videoId,
					key: KEY
				}
			});
		},
		postComment(options) {
			return $http({
				method: 'POST',
				url: `${baseUrl}commentThreads`,
				params: {
					part: 'snippet',
					key: KEY
				},
				data: {
					snippet: {
						videoId: options.videoId,
						channelId: options.channelId,
						topLevelComment: {
							snippet: {
								textOriginal: options.text
							}
						}
					}
				}
			});
		}
	}
});
