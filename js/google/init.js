Site = {
  shuffleArray: function (array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  },

  controller: function($scope, $sce, service) {
    $scope.items = [];
    $scope.onStageUrl = null;

    $scope.setOnStageUrl = function (videoId) {
      $scope.onStageUrl = $sce.trustAsResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&playsinline=1&disablekb=1&modestbranding=1`);
      return false;
    };

    service.fetchData()
      .then(function () {
        $scope.items = service.data.items;
        Site.shuffleArray($scope.items);
        $scope.setOnStageUrl($scope.items[0].snippet.resourceId.videoId);
      });
  },

  service: function ($http) {
    let service = {};

    service.data = {
      items: null
    };

    service.fetchData = function () {
      return $http({
        cache: true,
        method: 'GET',
        url: 'data.json'
      }).then(function (response) {
        service.data.items = response.data;
      });
    };

    return service;
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
  .controller('Home', Site.controller)
  .factory('service', ['$http', Site.service]);