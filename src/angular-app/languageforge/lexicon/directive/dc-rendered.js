angular.module('palaso.ui.dc.rendered', [])
  // Palaso UI Rendered Definition
  .directive('dcRendered', [function() {
		return {
			restrict: 'E',
			templateUrl: '/angular-app/languageforge/lexicon/directive/dc-rendered.html',
			scope: {
				config: "=",
				model: "=",
				hideIfEmpty: "=?"
			},
			controller: ['$scope', function($scope) {
				$scope.definition = {
					'label': '',
					'rendered': ''
				};
				if (angular.isUndefined($scope.hideIfEmpty)) { $scope.hideIfEmpty = false; };

				$scope.getLexemeForm = function(entry) {
					var result = '';
					// entry.lexeme has one property, but we don't know its name.
					// We could look in the config, but this is actually simpler.
					angular.forEach(entry.lexeme, function(word, wsid) {
						result = word.value || result; // We're ignoring wsid, but we might use it later
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
					$scope.definition.label = $scope.getLexemeForm($scope.model);
					var defParts = [];
					var useNumbers = (entry.senses && entry.senses.length > 1);
					var nextNum = 1;
					angular.forEach(entry.senses, function(sense) {
						if (useNumbers) {
							defParts.push(nextNum.toString() + ") ");
							nextNum++;
						};
						if (sense.partOfSpeech) {
							var abbrev = $scope.posAbbrevs[sense.partOfSpeech.value];
							defParts.push(abbrev ? (abbrev + ' ') : '');
						};
						// Might be nice to order the definitions in some way, like primary analysis
						// language first, then other languages after in a consistent order. But until
						// there's a way to specify primary analysis languages in config, we'll just
						// go through the definitions in whatever order forEach() produces them.
						angular.forEach(sense.definition, function(def, wsid) {
							defParts.push(def.value + ' ');
						});
					});
					$scope.definition.rendered = defParts.join("") || "[No definition exists yet: add one!]";
				};

				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the definition
					if (!$scope.model) {
						$scope.model = {};
						if ($scope.definition && $scope.definition.inputSystems) {
							for (var i=0; i<$scope.definition.inputSystems.length; i++) {
								if (!$scope.model[$scope.definition.inputSystems[i]]) {
									$scope.model[$scope.definition.inputSystems[i]] = {};
								};
								$scope.model[$scope.definition.inputSystems[i]].value = "";
							}
						}
					}
				};
			}],
			link: function(scope, element, attrs, controller) {
				scope.$watch('model', function(model) {
					scope.makeValidModel();
					scope.render(model);
				});
				scope.$watch('definition', function(definition) {
				})
			}
		};
  }])
  ;
