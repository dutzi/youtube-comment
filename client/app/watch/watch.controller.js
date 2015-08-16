'use strict';

angular.module('youtubeCommentApp').controller('WatchCtrl', function (
	$scope, 
	$location,
	youtube
) {

	var player;

	$scope.seperatorTop = 384;
	$scope.windowHeight = window.innerHeight;
	$scope.segmentDuration = 30;

	$scope.video = {
		id     : $location.search().v || 'fUwnA4-cfiA',
		width  : 640,
		height : 360
	};
	
	youtube.getComments($scope.video.id).then(function (data) {
		console.log(data);
	});

	function initSegments() {
		$scope.segments = new Array(Math.floor(player.getDuration() /
			$scope.segmentDuration));
	}

	function onPlayerReady() {
		onResize();
		initSegments();
		$scope.$digest();
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
		$scope.windowHeight = window.innerHeight;
		$scope.$digest();
	}

	window.addEventListener('resize', onResize);

	$scope.onResizeMouseDown = function(e) {
		var startY = e.offsetY;
		$scope.isResizing = true;

		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			document.body.classList.remove('noselect');
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
		document.body.classList.add('noselect');
	}
});
