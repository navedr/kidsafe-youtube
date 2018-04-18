function loadjscssfile(filename, filetype) {
	if (filetype == "js") {
		var fileref = document.createElement('script');
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", filename);
	} else if (filetype == "css") {
		var fileref = document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}
	if (typeof fileref != "undefined") {
		document.getElementsByTagName("head")[0].appendChild(fileref)
	}
}
var cssFiles = ['bootstrap/css/bootstrap.min.css', 'jquery-ui/css/jquery-ui.min.css', 'css/introjs.min.css', 'css/validation.css', 'css/fancy.form.css',
                'css/helper.css', 'font-awesome/css/font-awesome.min.css', 'css/topbar.css'];
var jsFiles = ['jquery/jquery.form.min.js', 'js/intro.min.js', 'bootstrap/js/bootstrap.min.js', 'js/underscore-min.js', 'js/jquery.blockUI.js'];

for (var x in cssFiles) {
	loadjscssfile(ampersandPath + cssFiles[x], 'css');
}
for (var x in jsFiles) {
	loadjscssfile(ampersandPath + jsFiles[x], 'js');
}