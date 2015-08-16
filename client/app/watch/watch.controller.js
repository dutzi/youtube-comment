'use strict';

angular.module('youtubeCommentApp').controller('WatchCtrl', function (
	$scope, 
	$location,
	youtube
) {

	var player;

	$scope.seperatorTop = 384;
	
	$scope.video = {
		id     : $location.search().v || 'fUwnA4-cfiA',
		width  : 640,
		height : 360
	};
	
	youtube.getComments($scope.video.id).then(function (data) {
		console.log(data);
	});

	function onPlayerReady() {
		onResize();
	}

	function onPlayerStateChange() {

	}

	window.onYouTubeIframeAPIReady = function() {
		player = new YT.Player('player', {
			height: '390',
			width: '640',
			videoId: $scope.video.id,
			playerVars: {
				autoplay: 1,
				showinfo: 0
			},
			events: {
				onReady       : onPlayerReady,
				onStateChange : onPlayerStateChange
			}
		});
		onResize();
	}

	function onResize() {
		$scope.video.height = $scope.seperatorTop - 24;
		$scope.video.width = $scope.video.height * 16 / 9;
		player.setSize($scope.video.width, $scope.video.height);
	}

	$scope.onResizeMouseDown = function(e) {
		var startY = e.offsetY;
		$scope.isResizing = true;

		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			$scope.isResizing = false;

			$scope.$digest();
		}

		function onMouseMove(e) {
			$scope.seperatorTop = Math.max(e.pageY - startY, 150);
			onResize();

			$scope.$digest();
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
});
