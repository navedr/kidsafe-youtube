const startSeconds = 10;

Array.prototype.move = function(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

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

    $scope.items = [];
    $scope.onStageItem = null;
    $scope.dataVersion = '0.0';
    $scope.appVersion = '1.0';

    if (query.DeviceID && query.Device) {
      mixpanel.identify(`${query.Device}-${query.DeviceID}`);
    }

    mixpanel.register({
      'App Version': $scope.appVersion
    });

    function initPlayer() {
      player = new YT.Player('player', {
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          origin: 'https://navedr.github.io',
        },
        videoId: $scope.onStageItem.videoId,
        startSeconds: startSeconds,
        events: {
          'onReady': (event) => event.target.playVideo()
        }
      });
			mixpanel.track("YouTube player initialized", {VideoId: $scope.onStageItem.videoId});
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
					"Data Version": $scope.dataVersion
				});
				mixpanel.track('Received Video List', {Count: $scope.items.length});
        Loader.hideLoadingBox();
        $scope.onStageItem = $scope.items[0];
        initPlayer();
      });
    }

    $scope.loadVideo = function (item) {
      if ($scope.onStageItem !== item) {
				mixpanel.track("Video Selected", {Title: item.title, VideoId: item.videoId});
				$scope.onStageItem = item;
				player.loadVideoById({videoId: item.videoId, startSeconds: startSeconds});
				let oldIndex = $scope.items.indexOf(item);
				Site.shuffleArray($scope.items);
				$scope.items.move($scope.items.indexOf(item), oldIndex);
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
