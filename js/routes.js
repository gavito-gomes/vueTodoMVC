/*global app, Router */

(function (app, Router) {

	'use strict';

	var router = new Router();

	router.configure({
		notfound: function () {
			window.location.hash = '';
		}
	});

	router.init();

})(app, Router);
