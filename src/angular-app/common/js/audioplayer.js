angular.module('palaso.ui.audioplayer', [])
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
			$compileProvider.aHrefSanitizationWhitelist(newWhitelist);
		}
	}])
	// Audio player
	.directive('audioplayer', function() {
		return {
			restrict : 'E',
			replace : true,
			template : '<div class="audioplayer"><a ng-href="{{constructedurl}}" download="{{m3ufilename}}"><i class="icon-volume-up"></i></a><a ng-href="/audio/{{filename}}"><i class="icon-download"></i></a></div>',
			scope : {
				filename: "=",
			},
			controller: ["$scope", function($scope) {
				$scope.makeBase64Url = function(filename) {
					var relativeUrl = '/audio/' + filename;

					// Use trick from http://stackoverflow.com/q/470832 to
					// retrieve an absolute URL (including server & protocol).
					// This doesn't work in IE 6, but who cares? It works in
					// IE 7+ and all other browsers.
					var a = document.createElement('a');
					a.href = relativeUrl;
					var absoluteUrl = a.href;
					a.remove();

					// Construct data: URL to produce the correct .m3u
					var b64Url = window.btoa(absoluteUrl);
					$scope.m3ufilename = filename.replace('mp3', 'm3u');
					$scope.constructedurl = "data:audio/x-mpegurl;charset=utf-8;base64," + b64Url;
				}
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('filename', function(newval) {
					if (newval) {
						scope.makeBase64Url(newval);
					}
				});
			}
		};
  })
  ;
