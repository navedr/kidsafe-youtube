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

  controller: function($scope, $sce, $http) {
    $scope.items = [];
    $scope.onStageUrl = null;
    $scope.dataVersion = '0.0';

    $scope.setOnStageUrl = function (videoId) {
      $scope.onStageUrl = $sce.trustAsResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&amp;rel=0&amp;showinfo=0&amp;playsinline=1&amp;disablekb=1&amp;modestbranding=1`);
      return false;
    };

    $http({
      cache: true,
      method: 'GET',
      url: 'data.json'
    }).then(function (response) {
      $scope.items = Site.shuffleArray(response.data.items);
      $scope.dataVersion = response.data.version;
      $scope.setOnStageUrl($scope.items[0].snippet.resourceId.videoId);
    });
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