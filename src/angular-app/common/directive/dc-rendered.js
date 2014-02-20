angular.module('palaso.ui.dc.rendered', [])
  // Palaso UI Rendered Definition
  .directive('dcRendered', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/common/directive/dc-rendered.html',
			scope : {
				config : "=",
				model : "=",
			},
			controller: ['$scope', function($scope) {
				$scope.definition = {
					'label': '[word goes here]',
					'rendered': '(nicely-rendered HTML goes here)'
				};

				$scope.getLexemeForm = function(entry) {
					var result = '[unknown word]';
					// entry.lexeme has one property, but we don't know its name.
					// We could look in the config, but this is actually simpler.
					angular.forEach(entry.lexeme, function(word, wsid) {
						result = word || result; // We're ignoring wsid, but we might use it later
					});
					return result;
				};

				$scope.posAbbrevs = {
					// This will eventually come from the config
					'noun': 'N',
					'verb': 'V',
					'adjective': 'Adj',
					'adverb': 'Adv',
				};

				$scope.render = function(entry) {
					if (entry == "Lorem ipsum") {
						$scope.definition.rendered = (
							"1) Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
							"2) Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
							"3) Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
							"4) Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
					} else {
						$scope.definition.label = $scope.getLexemeForm($scope.model);
						var defParts = [];
						var useNumbers = (entry.senses.length > 1);
						var nextNum = 1;
						angular.forEach(entry.senses, function(sense) {
							if (useNumbers) {
								defParts.push(nextNum.toString() + ") ");
								nextNum++;
							};
							if (sense.partOfSpeech) {
								var abbrev = $scope.posAbbrevs[sense.partOfSpeech];
								defParts.push(abbrev ? (abbrev + ' ') : '');
							};
							// Might be nice to order the definitions in some way, like primary analysis
							// language first, then other languages after in a consistent order. But until
							// there's a way to specify primary analysis languages in config, we'll just
							// go through the definitions in whatever order forEach() produces them.
							angular.forEach(sense.definition, function(def, wsid) {
								defParts.push(def + ' ');
							});
						});
						$scope.definition.rendered = defParts.join("") || "[No definition exists yet: add one!]";
					}
				};

				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the definition
					if (!$scope.model) {
						$scope.model = {};
						if ($scope.definition && $scope.definition.writingsystems) {
							for (var i=0; i<$scope.definition.writingsystems.length; i++) {
								$scope.model[$scope.definition.writingsystems[i]] = "";
							}
						}
					}
					console.log('model is', $scope.model);
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('model', function(model) {
					console.log('model watch was triggered');
					scope.makeValidModel();
					// scope.render("Lorem ipsum"); // For testing
					scope.render(model); // For production
				});
				scope.$watch('definition', function(definition) {
				})
			}
		};
  }])
  ;
