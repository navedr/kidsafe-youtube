Site = {
  data: null,
  template: null,
  init: function () {
    this.bindEvents();
    this.loadData();
  },

  loadData: function () {
    Ajax.getJson('data.json', null, $.proxy(function (data) {
      this.data = data;
      this.template = doT.template(Templates.get('list.html'));
      this.shuffleArray(this.data);
      $('#list').html(this.template({items: this.data}));
      this.loadVideo(this.data[0].snippet.resourceId.videoId);
    }, this), false, true);
  },

  bindEvents: function () {
    $(document).on('click', '#list > a', $.proxy(function (e) {
      let id = $(e.currentTarget).data('id');
      this.loadVideo(id);
      jQuery('html, body').animate({scrollTop:0},0);
      return false;
    }, this));
  },

  loadVideo: function (videoId) {
    $('#player').attr('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&controls=0&showinfo=0&playsinline=1`);
  },

  shuffleArray: function (array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
};

function init() {
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

$(document).ready(function () {
  Site.init();
});