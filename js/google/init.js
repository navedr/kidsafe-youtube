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
        $scope.items = Site.shuffleArray(response.data.items);
        $scope.dataVersion = response.data.version;

        Loader.hideLoadingBox();
        $scope.onStageId = $scope.items[0].snippet.resourceId.videoId;
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
      }
      return false;
    };

    function onPlayerReady(event) {
      event.target.playVideo();
    }

    function onPlayerStateChange(event) {

    }

    $window.onYouTubeIframeAPIReady = init;
  }
};

function fetchFromYoutube() {
  const playlistId = (location.hash) ? location.hash.replace('#', '') : 'PL5LU_Jq_F0d3LrQzHEGD37X6a1IHe87EH';
  const request = gapi.client.youtube.playlistItems.list({
    'maxResults': '50',
    'part': 'snippet,contentDetails',
    'playlistId': playlistId
  });

  request.execute(function (response) {
    response.items = response.items.filter(item => !!item.snippet.thumbnails);
  });
  return false;
}

let app = angular.module('main', [])
  .controller('Home', Site.controller);
