'use strict';

angular.module('lexicon.configuration', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'palaso.ui.picklistEditor'])
  .controller('ConfigCtrl', ['$scope', 'silNoticeService', 'lexProjectService', 'sessionService', '$filter', '$modal', 
                             function($scope, notice, lexProjectService, ss, $filter, $modal) {
    lexProjectService.setBreadcrumbs('configuration', $filter('translate')('Dictionary Configuration'));
    $scope.configDirty = angular.copy(ss.session.projectSettings.config);
    
    $scope.inputSystems = {};
    $scope.selects = {
      'special': {
        'optionsOrder': ['none', 'ipaTranscription', 'voice', 'scriptRegionVariant'],
        'options': {
          'none': $filter('translate')('none'),
          'ipaTranscription': $filter('translate')('IPA transcription'),
          'voice': $filter('translate')('Voice'),
          'scriptRegionVariant': $filter('translate')('Script / Region / Variant')
        }
      },
      'purpose': {
        'optionsOrder': ['etic', 'emic'],
        'options': {
          'etic': $filter('translate')('Etic (raw phonetic transcription)'),
          'emic': $filter('translate')('Emic (uses the phonology of the language)')
        }
      },
      'script': {
        'options': InputSystems.scripts()
      },
      'region': {
        'options': InputSystems.regions()
      }
    };
    
    $scope.currentInputSystemTag = '';
    $scope.selectInputSystem = function selectInputSystem(inputSystemTag) {
      $scope.currentInputSystemTag = inputSystemTag;
    };
    
    setupView();
    
    function sortInputSystemsList() {
      return $filter('orderBy')($filter('orderAsArray')($scope.configDirty.inputSystems, 'tag'), 'name');
    };
    
    function setupView() {
      if (angular.isDefined($scope.configDirty.inputSystems)) {
        $scope.inputSystems = $scope.configDirty.inputSystems;
        for (var tag in $scope.inputSystems) {
          var script = InputSystems.getScript(tag);
          var privateUse = InputSystems.getPrivateUse(tag);
          $scope.inputSystems[tag].name = InputSystems.getName($scope.inputSystems[tag].languageName, tag);
          $scope.inputSystems[tag].code = InputSystems.getCode(tag);
          $scope.inputSystems[tag].purpose = '';
          $scope.inputSystems[tag].script = '';
          $scope.inputSystems[tag].region = '';
          $scope.inputSystems[tag].variant = '';
          switch(script) {
            case '':
              $scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[0];
              break;
            case 'fonipa':
              $scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[1];
              $scope.inputSystems[tag].purpose = privateUse;
              break;
            case 'Zxxx':
              if (privateUse == 'audio') {
                $scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[2];
                break;
              }
            default:
              $scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[3];
              $scope.inputSystems[tag].script = script;
              $scope.inputSystems[tag].region = InputSystems.getRegion(tag);
              $scope.inputSystems[tag].variant = privateUse;
          }
        };
        $scope.inputSystemsList = sortInputSystemsList();
        
        // select the first items
        $scope.selectInputSystem($scope.inputSystemsList[0].tag);
        $scope.currentTaskName = 'dashboard';
        
        // for FieldConfigCtrl
        $scope.fieldConfig = {
          'fixed' : {
            'entry'   : $scope.configDirty.entry.fields,  
            'senses'  : $scope.configDirty.entry.fields.senses.fields,  
            'examples': $scope.configDirty.entry.fields.senses.fields.examples.fields
          },
          'custom'  : {
            'entry'   : $scope.configDirty.entry.fields.customFields.fields,  
            'senses'  : $scope.configDirty.entry.fields.senses.fields.customFields.fields,  
            'examples': $scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields,  
          }
        };
      }
    };
    
    $scope.configurationApply = function() {
      lexProjectService.updateConfiguration($scope.configDirty, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $filter('translate')('Dictionary configuration updated successfully'));
          $scope.configForm.$setPristine();
          $scope.projectSettings.config = angular.copy($scope.configDirty);
          setupView();
        }
      });
    };
    
  // InputSystemsConfigCtrl
    $scope.newExists = function(code, special) {
      var tag = code;
      switch (special) {
        
        // IPA transcription
        case $scope.selects.special.optionsOrder[1]:    
          tag += '-fonipa';
          break;
          
        // Voice
        case $scope.selects.special.optionsOrder[2]:    
          tag += '-Zxxx-x-audio';
          break;
          
        // Script / Region / Variant
        case $scope.selects.special.optionsOrder[3]:    
          tag += '-unspecified';
          break;
      }
      return (tag in $scope.inputSystems);
    };
    $scope.addInputSystem = function addInputSystem(code, languageName, special) {
      var tag = 'xxNewTagxx';
      var script = '';
      $scope.inputSystems[tag] = {};
      $scope.inputSystems[tag].languageName = languageName;
      $scope.inputSystems[tag].abbreviation = code;
      $scope.inputSystems[tag].script = '';
      switch (special) {
        
        // IPA transcription
        case $scope.selects.special.optionsOrder[1]:    
          script = 'fonipa';
          $scope.inputSystems[tag].abbreviation = code + 'ipa';
          break;
          
        // Voice
        case $scope.selects.special.optionsOrder[2]:    
          script = 'Zxxx';
          $scope.inputSystems[tag].abbreviation = code + 'audio';
          break;
          
        // Script / Region / Variant
        case $scope.selects.special.optionsOrder[3]:    
          script = 'unspecified';
          $scope.inputSystems[tag].script = script;
          $scope.inputSystems[tag].abbreviation = code + '-';
          break;
      }
      $scope.inputSystems[tag].code = code;
      $scope.inputSystems[tag].special = special;
      $scope.inputSystems[tag].purpose = '';
      $scope.inputSystems[tag].region = '';
      $scope.inputSystems[tag].variant = '';
      $scope.currentInputSystemTag = tag;
    };
    $scope.removeInputSystem = function removeInputSystem(currentInputSystemTag) {
      delete $scope.inputSystems[currentInputSystemTag];
      $scope.inputSystemsList = sortInputSystemsList();
      $scope.configForm.$setDirty();
      
      // select the first items
      $scope.selectInputSystem($scope.inputSystemsList[0].tag);
    };
    
    $scope.openNewLanguageModal = function openNewLanguageModal() {
      var modalInstance = $modal.open({
        templateUrl: '/angular-app/languageforge/lexicon/views/select-new-language.html',
        controller: function($scope, $modalInstance) {
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.add = function () {
            $modalInstance.close($scope.selected);
          };
          
        }
      });
      
      modalInstance.result.then(function(selected) {
        $scope.addInputSystem(selected.code, selected.language.name, $scope.selects.special.optionsOrder[0]);
      });
      
    };
    
    $scope.$watchCollection('inputSystems[currentInputSystemTag]', function(newValue) {
      if (newValue != undefined) {
        var tag = $scope.currentInputSystemTag;
        var newTag = $scope.inputSystems[tag].code;
        switch($scope.inputSystems[tag].special) {
          
          // IPA transcription
          case $scope.selects.special.optionsOrder[1]:
            newTag += '-fonipa';
            newTag += ($scope.inputSystems[tag].purpose) ? '-x-' + $scope.inputSystems[tag].purpose : '';
            break;
            
          // Voice
          case $scope.selects.special.optionsOrder[2]:    
            newTag += '-Zxxx-x-audio';
            break;
            
          // Script / Region / Variant
          case $scope.selects.special.optionsOrder[3]:    
            if (! $scope.inputSystems[tag].script && ! $scope.inputSystems[tag].region)  {
              $scope.inputSystems[tag].script = 'unspecified';
            }
            newTag += ($scope.inputSystems[tag].script) ? '-' + $scope.inputSystems[tag].script : '';
            newTag += ($scope.inputSystems[tag].region) ? '-' + $scope.inputSystems[tag].region : '';
            newTag += ($scope.inputSystems[tag].variant) ? '-x-' + $scope.inputSystems[tag].variant : '';
            break;
        }
        $scope.inputSystems[tag].name = InputSystems.getName($scope.inputSystems[tag].languageName, newTag);
        if (tag != newTag) {
          if (! (newTag in $scope.inputSystems)) {
            $scope.inputSystems[tag].tag = newTag;
            $scope.inputSystems[newTag] = $scope.inputSystems[tag];
            $scope.configForm.$setDirty();
          }
          delete $scope.inputSystems[tag];
          $scope.selectInputSystem(newTag);
        }
        $scope.inputSystemsList = sortInputSystemsList();
      }
    });
  
  }])
  .controller('FieldConfigCtrl', ['$scope', '$modal', function($scope, $modal) {
    $scope.currentField = {
      'name': '',
      'inputSystems': {
        'fieldOrder': [],
        'selecteds': {}
      }
    };
    
    $scope.selectField = function selectField(group, level, fieldName) {
      var inputSystems;
      if ($scope.currentField.name !== fieldName) {
        $scope.currentField.group = group;
        $scope.currentField.level = level;
        $scope.currentField.name = fieldName;
        inputSystems = $scope.fieldConfig[group][level][fieldName].inputSystems;
        
        $scope.currentField.inputSystems.selecteds = {};
        angular.forEach(inputSystems, function(tag) {
          $scope.currentField.inputSystems.selecteds[tag] = true;
        });
        
        // if the field uses input systems, add the selected systems first then the unselected systems
        if (inputSystems) {
          $scope.currentField.inputSystems.fieldOrder = inputSystems;
          angular.forEach($scope.configDirty.inputSystems, function(inputSystem, tag) {
            if(! (tag in $scope.currentField.inputSystems.selecteds)) {
              $scope.currentField.inputSystems.fieldOrder.push(tag);
            }
          });
        }
      }
    };
    $scope.selectField('fixed', 'entry', 'lexeme');
    
    $scope.moveUp = function moveUp(currentTag) {
      var group = $scope.currentField.group,
        level = $scope.currentField.level,
        name = $scope.currentField.name,
        currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1];
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
      $scope.fieldConfig[group][level][name].inputSystems = [];
      angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
        if ($scope.currentField.inputSystems.selecteds[tag]) {
          $scope.fieldConfig[group][level][name].inputSystems.push(tag);
        }
      });
      $scope.configForm.$setDirty();
    };
    $scope.moveDown = function moveDown(currentTag) {
      var group = $scope.currentField.group,
        level = $scope.currentField.level,
        name = $scope.currentField.name,
        currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1];
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
      $scope.fieldConfig[group][level][name].inputSystems = [];
      angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
        if ($scope.currentField.inputSystems.selecteds[tag]) {
          $scope.fieldConfig[group][level][name].inputSystems.push(tag);
        }
      });
      $scope.configForm.$setDirty();
    };
    
    $scope.fieldConfigItemExists = function fieldConfigItemExists(itemName) {
      return itemName in $scope.fieldConfig[$scope.currentField.group][$scope.currentField.level][$scope.currentField.name];
    };
    
    $scope.fieldIsCustom = function fieldIsCustom(fieldName) {
      return fieldName.search('customField_') === 0;
    };
    
    $scope.openNewCustomFieldModal = function openNewCustomFieldModal() {
      var modalInstance = $modal.open({
        templateUrl: '/angular-app/languageforge/lexicon/views/new-custom-field.html',
        controller: ['$scope', '$filter', '$modalInstance', function($scope, $filter,  $modalInstance) {
          $scope.selects = {};
          $scope.selects.level = {
            'optionsOrder': ['none', 'senses', 'examples'],
            'options': {
              'none'    : $filter('translate')('Entry Level'),
              'senses'  : $filter('translate')('Sense Level'),
              'examples': $filter('translate')('Example Level')
            }
          };
          $scope.selects.type = {
              'optionsOrder': ['multitext', 'multitextlines', 'optionlist', 'multioptionlist', 'reference', 'picture', 'date', 'number'],
              'options': {
                'multitext'       : $filter('translate')('Single-line Text'),
                'multitextlines'  : $filter('translate')('Multi-paragraph Text'),
                'optionlist'      : $filter('translate')('Option List'),
                'multioptionlist' : $filter('translate')('Multi-option List'),
                'reference'       : $filter('translate')('Entry Reference'),
                'picture'         : $filter('translate')('Picture'),
                'date'            : $filter('translate')('Date'),
                'number'          : $filter('translate')('Number')
              }
            };
          $scope.newCustomField = {
            'name': ''
          };
          $scope.add = function add() {
            console.log('addCustomField ', $scope.newCustomField);
            $modalInstance.close($scope.newCustomField);
          };
          
          $scope.$watch('newCustomField.name', function(newValue, oldValue) {
            if (angular.isDefined(newValue) && newValue !== oldValue) {
              
              // replace spaces with underscore 
              $scope.newCustomField.code = newValue.replace(/ /g, '_');
            }
          });
          
        }]
      });
      
      modalInstance.result.then(function(newCustomField) {
        var newCustomData = {}, 
          newCustomKey = 'customField_' + newCustomField.code;
        newCustomData.label = newCustomField.name;   
        newCustomData.type = newCustomField.type;
        switch (newCustomField.type) {
          case 'multitext':
            newCustomData.displayMultiline = false;
            newCustomData.width = 20;
            newCustomData.inputSystems = [];
            break;
          case 'multitextlines':
            newCustomData.type = 'multitext';
            newCustomData.displayMultiline = true;
            newCustomData.width = 20;
            newCustomData.inputSystems = [];
            break;
        }
        
        switch (newCustomField.level) {
          case 'examples':
            $scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[newCustomKey] = newCustomData;
            if (! (newCustomKey in $scope.configDirty.entry.fields.senses.fields.examples.fieldOrder)) {
              $scope.configDirty.entry.fields.senses.fields.examples.fieldOrder.push(newCustomKey);
            }
            break;
          case 'senses':
            $scope.configDirty.entry.fields.senses.fields.customFields.fields[newCustomKey] = newCustomData;
            if (! (newCustomKey in $scope.configDirty.entry.fields.senses.fieldOrder)) {
              $scope.configDirty.entry.fields.senses.fieldOrder.push(newCustomKey);
            }
            break;
            
          // 'none'
          default: 
            $scope.configDirty.entry.fields.customFields.fields[newCustomKey] = newCustomData;
            if (! (newCustomKey in $scope.configDirty.entry.fieldOrder)) {
              $scope.configDirty.entry.fieldOrder.push(newCustomKey);
            }
        }
        $scope.configForm.$setDirty();
      });
    };
    
    $scope.removeSelectedCustomField = function removeSelectedCustomField() {
      var group = $scope.currentField.group,
        level = $scope.currentField.level,
        name = $scope.currentField.name,
        i;
      if ($scope.fieldIsCustom(name)) {
        delete $scope.fieldConfig[group][level][name];
        
        // remove field name from fieldOrder
        i = $scope.configDirty.entry.fields.senses.fields.examples.fieldOrder.indexOf(name);
        if (i > -1) {
          $scope.configDirty.entry.fields.senses.fields.examples.fieldOrder.splice(i, 1);
        }
        i = $scope.configDirty.entry.fields.senses.fieldOrder.indexOf(name);
        if (i > -1) {
          $scope.configDirty.entry.fields.senses.fieldOrder.splice(i, 1);
        }
        i = $scope.configDirty.entry.fieldOrder.indexOf(name);
        if (i > -1) {
          $scope.configDirty.entry.fieldOrder.splice(i, 1);
        }
        
        $scope.configForm.$setDirty();
        $scope.selectField('fixed', 'entry', 'lexeme');
      }
    };
    
    $scope.editInputSystems = {
      'collapsed': true,
      'done': function() {
        this.collapsed = true;
      }
    };
    
    $scope.$watchCollection('currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var group = $scope.currentField.group,
          level = $scope.currentField.level,
          name = $scope.currentField.name;
        if (angular.isDefined($scope.fieldConfig[group][level][name].inputSystems)) {
          $scope.fieldConfig[group][level][name].inputSystems = [];
          angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
            if ($scope.currentField.inputSystems.selecteds[tag]) {
              $scope.fieldConfig[group][level][name].inputSystems.push(tag);
            }
          });
        }
      }
    });
    
  }])
  .controller('TaskConfigCtrl', ['$scope', '$filter', function($scope, $filter) {
    $scope.selects.timeRange = {
      'optionsOrder': ['30days', '90days', '1year', 'all'],
      'options': {
        '30days': $filter('translate')('Up to 30 days'),
        '90days': $filter('translate')('Up to 90 days'),
        '1year': $filter('translate')('Up to 1 year'),
        'all': $filter('translate')('All')
      }
    };
    $scope.selects.language = {
      'options': {
        'en': $filter('translate')('English'),
        'es': $filter('translate')('Spanish'),
        'fr': $filter('translate')('French'),
        'hi': $filter('translate')('Hindi'),
        'id': $filter('translate')('Indonesian'),
        'km': $filter('translate')('Central Khmer'),
        'ne': $filter('translate')('Nepali'),
        'ru': $filter('translate')('Russian'),
        'th': $filter('translate')('Thai'),
        'ur': $filter('translate')('Urdu'),
        'zh-CN': $filter('translate')('Chinese')
      }
    };
    
    $scope.selectTask = function(taskName) {
      $scope.currentTaskName = taskName;
    };
  
  }])
  .controller('OptionListCtrl', ['$scope', function($scope) {
    $scope.optionLists = {
      pos:{
        id: 'pos',
        name: 'Part of Speech',
        items: $scope.configDirty.entry.fields.senses.fields.partOfSpeech.values,
        defaultKey: 'noun'
      }
    };
    $scope.currentListId = 'pos';
    
    $scope.selectList = function(listId) {
      $scope.currentListId = listId;
    };
    
    $scope.$watch('optionLists.pos.items', function(newval, oldval) {
      if (angular.isDefined(newval) && newval != oldval) {
        $scope.configForm.$setDirty();
      }
    }, true);
    
  }])
  ;
