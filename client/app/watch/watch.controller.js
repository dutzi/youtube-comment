'use strict';

angular.module('youtubeCommentApp').controller('WatchCtrl', function (
	$scope, 
	$location,
	$q,
	$interval,
	$timeout,
	$http,
	youtube
) {
	var $ = document.querySelector.bind(document);

	var player;
	var playerReady = $q.defer();

	$scope.seperatorTop = 384;
	$scope.windowHeight = window.innerHeight;
	$scope.segmentDuration = 30;

	$scope.video = {
		id     : $location.search().v || 'fUwnA4-cfiA',
		width  : 640,
		height : 360
	};

	function getTime(time) {
		var hours = 0;

		return time.match(/(?:(\d+)h|)(\d+)m(\d+)s/)
			.filter((_, index) => index >= 2)
			.map((d) => parseInt(d))
			.reverse()
			.reduce((prev, current, index) => {
				return prev + current * Math.pow(60, index);
			});
	}

	function getSegment(time) {
		return $scope.segments[Math.floor(time / $scope.segmentDuration)];
	}
	
	$q.all([
		youtube.getComments($scope.video.id),
		playerReady.promise
	]).then(function (data) {
		$scope.comments = data = data[0].data.items;

		// TODO - use regexp
		// 
		var timeRx = '<a href=\"http://www.youtube.com/watch?v=' + 
			$scope.video.id + '&amp;t=';

		for (var i = 0; i < data.length; i++) {
			var text = data[i].snippet.topLevelComment.snippet.textDisplay;
			if (text.indexOf(timeRx) > -1) {
				var time = text.substr(text.indexOf(timeRx) + timeRx.length);
				time = time.substr(0, time.indexOf('"'));

				getSegment(getTime(time)).push(data[i]);
			}
		}

		console.log($scope.comments);
		console.log($scope.segments);
	});

	function initSegments() {
		$scope.segments = new Array(Math.floor(player.getDuration() /
			$scope.segmentDuration) + 1);

		// 300 is a segments fixed width, as set in `watch.scss`
		// 
		var pixelsPerSecond = 300 / $scope.segmentDuration;
		$scope.progressBarWidth = pixelsPerSecond * player.getDuration();

		for (var i = 0; i < $scope.segments.length; i++) {
			$scope.segments[i] = [];
		}
	}

	/******************************/
	/******** Progress Bar ********/
	/******************************/

	var videoUpdateInterval;

	function addPlaybackEventListeners() {
		videoUpdateInterval = $interval(function () {

			$scope.video.loadProgress = player.getVideoBytesLoaded() /
				player.getVideoBytesTotal() * 100;

			if (!$scope.isScrubbing) {
				$scope.video.playProgress = player.getCurrentTime() /
					player.getDuration() * 100;
			}

			if ($scope.isHoveringProgressBar) {
				updateProgressBarHoverPosition();
			}

		}, 100);
	}

	function removePlaybackEventListeners() {
		$interval.cancel(videoUpdateInterval);
	}

	function onPlayerStateChange(e) {
		switch(e.data) {
			// Playing
			case 1:
			break;

			// Ended or Paused
			case 0:
			case 2:

			break;
		}
	}

	var pageX;
	function updateProgressBarHoverPosition() {
		var absX = $('.segments').scrollLeft + pageX,
		    playProgressWidth = $('.play-progress').offsetWidth;

		if (absX > playProgressWidth) {
			$scope.progressBarHoverStyle = {
				left: playProgressWidth + 'px',
				width: absX - playProgressWidth + 'px'
			}
		} else {
			$scope.progressBarHoverStyle = {
				left: absX + 'px',
				width: playProgressWidth - absX + 'px'
			}
		}

		$scope.timelineControlsStyle = {
			left: pageX + 'px'
		}

		$scope.hoveredTime = Math.floor(absX / $scope.progressBarWidth *
			player.getDuration());
	}

	$scope.onProgressMouseDown = function(e) {
		var wasPausedBeforeScrubbing = player.getPlayerState() === 2;
		$scope.isScrubbing = true;
		player.pauseVideo();
		document.body.classList.add('noselect');

		function seekByPageX(pageX) {
			var absX = $('.segments').scrollLeft + pageX,
			    percentage = absX / $scope.progressBarWidth;

			player.seekTo(percentage * player.getDuration());

			$scope.video.playProgress = percentage * 100;
		}

		function onMouseUp(e) {
			$scope.isScrubbing = false;
			if (!wasPausedBeforeScrubbing) player.playVideo();
			$scope.$digest();

			seekByPageX(e.pageX);

			document.body.classList.remove('noselect');
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('mousemove', onMouseMove);
		}

		function onMouseMove(e) {
			seekByPageX(e.pageX);
		}

		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mousemove', onMouseMove);
	}

	$scope.onProgressMouseMove = function(e) {
		pageX = e.pageX;
		updateProgressBarHoverPosition();
	}

	$scope.onProgressMouseOver = function(e) {
		pageX = e.pageX;
		$scope.isHoveringProgressBar = true;
	}

	$scope.onProgressMouseOut = function(e) {
		pageX = e.pageX;
		$scope.isHoveringProgressBar = false;
	}

	window.onYouTubeIframeAPIReady = function() {
		window.player = player = new YT.Player('player', {
			height: '390',
			width: '640',
			videoId: $scope.video.id,
			playerVars: {
				autoplay: 1,
				showinfo: 0
			},
			events: {
				onReady       : function () {
					onResize();
					initSegments();
					addPlaybackEventListeners();
					playerReady.resolve();
				},
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

	$scope.onAddCommentClick = function () {
		$scope.shouldHideTimelineControls = true;
		$timeout(function () {
			$scope.shouldHideTimelineControls = false;
		}, 10);
	};

	$http.post('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyCnvekvymQwGgtRuntaqAF_jzuzwJHvNkM', {
		snippet: {
			channelId: 'UCYAEvz0DhNrn4V35kxNXH3w',
			videoId: 'fUwnA4-cfiA',
			topLevelComment: {
				snippet: {
					textOriginal: 'Test API post comment'
				}
			}
		}
	}).then(function (res) {
		console.log(res);
	}, function (err) {
		console.log(err);
	});
});
