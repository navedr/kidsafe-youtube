var v = new Date().getTime();
Loader = {
    loading_open: false,
    showLoadingBox: function () {
        this.loading_open = true;
        $.blockUI({
            message: '<div class="loading-box">Loading&nbsp;&nbsp;<img style="vertical-align:middle" src="assets/images/facebook-loader.gif" /></div>',
            css: {
                left: '45%',
                backgroundColor: 'Transparent',
                border: "0"
            }
        });
    },

    blockSectionForProcessing: function (id, msghtml) {
        this.showLoader($(id), msghtml);
    },

    unblockSection: function (id) {
        this.hideLoader($(id));
    },

    showProgressBar: function (id, message) {
        this.blockSectionForProcessing(id, '<div class="loading-box">' + message + '&nbsp;&nbsp;<img style="vertical-align:middle" src="assets/images/facebook-loader.gif" /></div>');
    },

    hideProgressBar: function (id) {
        this.unblockSection(id);
    },

    showProgressLoader: function ($el, msg) {
        this.showLoader($el, '<div class="loading-box">' + msg + '&nbsp;&nbsp;<img style="vertical-align:middle" src="assets/images/facebook-loader.gif" /></div>');
    },

    showLoader: function ($el, msg) {
        $el.block({
            message: msg,
            css: {
                fadeIn: 0,
                left: '45%',
                backgroundColor: 'Transparent',
                border: "0"
            },
            centerY: false
        });
    },

    hideLoader: function ($el) {
        $el.unblock();
    }
};