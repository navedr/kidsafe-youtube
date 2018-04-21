const OAUTH2_CLIENT_ID = '495095514496-mbl0qi0kdnldmrjs2mdh3ftujim9nugk.apps.googleusercontent.com';
const OAUTH2_SCOPES = [
	'https://www.googleapis.com/auth/youtube'
];

googleApiClientReady = function () {
	gapi.auth.init(function () {
		window.setTimeout(checkAuth, 1);
	});
};

function checkAuth() {
	gapi.auth.authorize({
		client_id: OAUTH2_CLIENT_ID,
		scope: OAUTH2_SCOPES,
		immediate: true
	}, handleAuthResult);
}

function handleAuthResult(authResult) {
	if (authResult && !authResult.error) {
		$('.pre-auth').hide();
		$('.post-auth').show();
		loadAPIClientInterfaces();
	} else {
		$('.post-auth').hide();
		$('.pre-auth').show();
		$('#login-link').click(function () {
			gapi.auth.authorize({
				client_id: OAUTH2_CLIENT_ID,
				scope: OAUTH2_SCOPES,
				immediate: false
			}, handleAuthResult);
			return false;
		});
	}
}

function loadAPIClientInterfaces() {
	gapi.client.load('youtube', 'v3', function () {
		handleAPILoaded();
	});
}

function handleAPILoaded() {
	const playlistId = (location.hash) ? location.hash.replace('#', '') : 'PL5LU_Jq_F0d3LrQzHEGD37X6a1IHe87EH';
	const request = gapi.client.youtube.playlistItems.list({
		'maxResults': '50',
		'part': 'snippet,contentDetails',
		'playlistId': playlistId
	});

	request.execute(function (response) {
		const json = {
			version: "1.0",
			updated: new Date().toDateString(),
			items: response.items.filter(item => !!item.snippet.thumbnails).map(item => {
				return {
					videoId: item.snippet.resourceId.videoId,
					thumbnailUrl: item.snippet.thumbnails.medium.url,
					title: item.snippet.title
				}
			})
		};
		$("#json").val(JSON.stringify(json, null, 2));
	});
}
