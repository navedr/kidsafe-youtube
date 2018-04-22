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

  controller: function($scope, $window, $sce, $http) {
    let items = [];
  	$scope.items = [];
    $scope.onStageId = null;
    $scope.dataVersion = '0.0';
    let player;

    function init () {
      Loader.showLoadingBox();

      $http({
        cache: true,
        method: 'GET',
        url: 'data.json'
      }).then(function (response) {
      	items = response.data.items;
        $scope.items = Site.shuffleArray(items);
        $scope.dataVersion = response.data.version;

        Loader.hideLoadingBox();
        $scope.onStageId = $scope.items[0].videoId;
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
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      });
    }

    $scope.loadVideo = function (videoId) {
      if ($scope.onStageId !== videoId) {
				$scope.onStageId = videoId;
				player.loadVideoById(videoId);
				Site.shuffleArray($scope.items);
      }
      return false;
    };
    
    $scope.filterList = function ($event) {
    	$scope.items = $event.currentTarget.value ? items.filter(i => i.title.toLowerCase().includes($event.currentTarget.value.toLowerCase())) : items;
		};

    function onPlayerReady(event) {
      event.target.playVideo();
    }

    function onPlayerStateChange(event) {

    }
		
    $window.onYouTubeIframeAPIReady = init;
  }
};

let app = angular.module('main', [])
  .controller('Home', ['$scope', '$window', '$sce', '$http', Site.controller]);
