'use strict';

angular.module(
		'sfchecks.robintest',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.jqte', 'ui.bootstrap', 'palaso.ui.selection', 'palaso.ui.notice' ]
	)
	.config(['$compileProvider', function($compileProvider) {
		// Angular uses a whitelist to determine what URLs are allowed in
		// <a href="{{somevalue}}"> elements. By default, data: URLs are not
		// allowed. We don't want to just allow any data: URL as that could
		// introduce a security hole, so we will base64-encode a URL fragment
		// like "http://server.name/audio/" and use that specific fragment as
		// the *only* kind of data: URLs to allow.
		var href = document.location.href;
		var startAt = href.indexOf('://');
		var firstSlash = href.indexOf('/', startAt + 3);
		var firstUrlPart = href.substring(0, firstSlash); // protocol://server.name
		var allowedUrl = firstUrlPart + '/audio/';
		var encoded = window.btoa(allowedUrl);
		if (encoded[encoded.length-1] == '=') {
			// Last three bytes of B64-encoded string might not match if any
			// padding characters exist, so trim back to the first full block
			// that is guaranteed to match.
			encoded = encoded.substring(0, encoded.length-3);
		}

		var oldWhitelist = $compileProvider.aHrefSanitizationWhitelist();
		// Only add this if we haven't added it already
		if (oldWhitelist.source.indexOf(encoded) == -1) {
			var newWhitelist = RegExp(oldWhitelist.source + '|^\\s*data:audio/x-mpegurl;charset=utf-8;base64,' + encoded);
			console.log('Adding data URLs to whitelist. New whitelist:', newWhitelist);
			$compileProvider.aHrefSanitizationWhitelist(newWhitelist);
		}
	}])
	.controller('RobinTestCtrl', ['$scope',
	                              function($scope) {
		$scope.mp3basename = 'B01___05_Matthew_______N2JAMBSW.mp3';
		$scope.specialurl = '';
		$scope.findit = function() {
			var url = '/audio/' + $scope.mp3basename;
			var a = document.createElement('a');
			a.href = url; // This forces the URL to become an absolute URL
			var b64 = window.btoa(a.href);
			a.remove();
			console.log('Base64 encode:', b64);
			var href = "data:audio/x-mpegurl;charset=utf-8;base64," + b64;
			$scope.specialurl = href;
			console.log(href);
		}
		$scope.findit();
	}])
	;
