const startSeconds = 10;
Site = {
  shuffleArray: function (array) {
    array.forEach(function (element, i) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    });
    return array;
  },

  controller: function($scope, $window, $http, $location) {
    let items = [];
    let player;
    let query = $location.search();
    let appInfo = $location.search();

    if (query.DeviceID && query.Device) {
      mixpanel.identify(`${query.Device}-${query.DeviceID}`);
    }

    appInfo['AppVersion'] = $scope.appVersion;
    mixpanel.register(appInfo);

  	$scope.items = [];
    $scope.onStageId = null;
    $scope.dataVersion = '0.0';
    $scope.appVersion = '1.91';

    function initPlayer() {
      player = new YT.Player('player', {
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          origin: 'https://navedr.github.io',
        },
        videoId: $scope.onStageId,
        startSeconds: startSeconds,
        events: {
          'onReady': (event) => event.target.playVideo()
        }
      });
			mixpanel.track("YouTube player initialized", {VideoId: $scope.onStageId});
    }

    function init () {
			mixpanel.track("App Loaded");
      Loader.showLoadingBox();

      $http({
        cache: true,
        method: 'GET',
        url: 'data.json'
      }).then(function (response) {
      	items = response.data.items;
        $scope.items = Site.shuffleArray(items);
        $scope.dataVersion = response.data.version;
				mixpanel.register_once({
					"DataVersion": $scope.dataVersion
				});
				mixpanel.track('Received Video List', {Count: $scope.items.length});
        Loader.hideLoadingBox();
        $scope.onStageId = $scope.items[0].videoId;
        initPlayer();
      });
    }

    $scope.loadVideo = function (item) {
      if ($scope.onStageId !== item.videoId) {
				mixpanel.track("Video Selected", {Title: item.title, VideoId: item.videoId});
				$scope.onStageId = item.videoId;
				player.loadVideoById({videoId: item.videoId, startSeconds: startSeconds});
				Site.shuffleArray($scope.items);
      }
      return false;
    };
    
    $scope.filterList = function (e) {
    	$scope.items = e.currentTarget.value ? items.filter(i => i.title.toLowerCase().includes(e.currentTarget.value.toLowerCase())) : items;
		};

    $window.onYouTubeIframeAPIReady = init;
  }
};

let app = angular.module('main', [])
  .controller('Home', ['$scope', '$window', '$http', '$location', Site.controller]);
