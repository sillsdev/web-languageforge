'use strict';

angular.module('translate.services')
  .service('translateDocumentApi', ['apiService', function (api) {
    this.updateDocumentSet = api.method('translate_documentSetUpdate');
    this.listDocumentSetsDto = api.method('translate_documentSetListDto');
    this.removeDocumentSet = api.method('translate_documentSetRemove');
  }])
  .service('translateDocumentService', [function () {
    var LINE_INDEX = 0;

    var Delta = Quill.import('delta');

    this.Data = DocumentData;

    function DocumentData(docType, label) {
      docType = docType || '';
      label = label || '';
      this.docType = docType;
      this.label = label;

      //noinspection JSUnusedGlobalSymbols
      this.modulesConfig = {};
      this.html = '';
      this.editor = {};
      this.inputSystem = {};
      this.segment = new Segment();
      this.suggestions = [];
    }

    DocumentData.prototype.hasSuggestion = function hasSuggestion() {
      return this.suggestions && this.suggestions.length > 0;
    };

    DocumentData.prototype.updateSegmentLearntData =
      function updateSegmentLearntData(segmentIndex, documentSetId) {
        this.updateSegmentState(segmentIndex);
        this.segment.text = this.getSegment(segmentIndex);
        this.segment.setLearntText();
        this.segment.learnt.documentSetId = documentSetId;
        this.setPreviousLearntRange(segmentIndex);
        this.updateSegmentBlockEndIndex();
      };

    DocumentData.prototype.updateSegmentState = function updateSegmentState(segmentIndex) {
      var formats;
      if (this.editor.hasNoSelectionAtCursor()) {
        formats = this.editor.getFormat();
      } else {
        var index = this.getSegmentBlockStartIndex(segmentIndex);
        formats = this.editor.getFormat(index);
      }

      this.segment.updateState(formats);
    };

    DocumentData.prototype.setPreviousLearntRange = function setPreviousLearntRange(segmentIndex) {
      var range = this.editor.getSelection();
      if (!range) {
        range = {
          index: this.getSegmentBlockStartIndex(segmentIndex),
          length: 0
        };
      }

      this.segment.learnt.previousRange = range;
    };

    DocumentData.prototype.getSegmentBlockStartIndex =
      function getSegmentBlockStartIndex(segmentIndex) {
        var editorIndex = 0;
        angular.forEach(this.getSegments(), function (segment, index) {
          if (index >= segmentIndex) return;

          editorIndex += segment.length + '\n'.length;
        });

        return editorIndex;
      };

    DocumentData.prototype.updateSegmentBlockEndIndex = function (range) {
      if (angular.isUndefined(range)) range = this.editor.getSelection();

      if (Quill.hasNoSelectionAtCursor(range)) {
        var block = this.editor.getLine(range.index);
        var line = block[LINE_INDEX];
        this.segment.blockEndIndex = this.editor.getIndex(line) + line.length() - 1;
      }
    };

    DocumentData.prototype.formatSegmentStateStatus = function (value, range) {
      formatSegmentState.call(this, 'status', value, range);
    };

    DocumentData.prototype.formatSegmentStateMachineHasLearnt = function (value, range) {
      formatSegmentState.call(this, 'machineHasLearnt', value, range);
    };

    function formatSegmentState(name, value, range) {
      if (angular.isUndefined(range)) range = this.editor.getSelection();

      if (Quill.hasNoSelectionAtCursor(range)) {
        var block = this.editor.getLine(range.index);
        var blockStartIndex = this.editor.getIndex(block[LINE_INDEX]);
        var hasNoState = this.segment.hasNoState();
        var stateValue = {};
        stateValue[name] = value;
        this.segment.state[name] = value;
        setTimeout(function () {
          if (hasNoState) {
            this.editor.formatLine(blockStartIndex, 1, { state: stateValue }, Quill.sources.USER);
          } else {
            this.editor.formatLine(blockStartIndex, 1, stateValue, Quill.sources.USER);
          }
        }.bind(this), 1);
      }
    }

    DocumentData.prototype.createDeltaSegmentStateMachineHasLearnt =
      function (value, index, state, length)
    {
      return createDeltaSegmentState.call(this, 'machineHasLearnt', value, index, state, length);
    };

    function createDeltaSegmentState(name, value, index, state, length) {
      if (angular.isUndefined(length)) length = 1;

      var stateValue = {};
      if (angular.isDefined(state)) stateValue = angular.copy(state);
      stateValue[name] = value;
      var formats = { state: stateValue };

      return new Delta().retain(index).retain(length, formats);
    }

    /**
     * @param {number} index
     * @returns {string}
     */
    DocumentData.prototype.getSegment = function getSegment(index) {
      if (this.editor.isTextEmpty() || index < 0) return '';

      if (index > this.getLastSegmentIndex()) {
        index = this.getLastSegmentIndex();
      }

      return this.getSegments()[index];
    };

    /**
     * @returns {number}
     */
    DocumentData.prototype.getSegmentIndex = function getSegmentIndex() {
      if (this.editor.hasNoSelectionAtCursor()) {
        var range = this.editor.getSelection();
        var segmentIndex = 0;
        var nextSegmentIndex = 0;
        angular.forEach(this.getSegments(), function (segment) {
          nextSegmentIndex += segment.length + '\n'.length;
          if (range.index < nextSegmentIndex) return;

          segmentIndex++;
        });

        return segmentIndex;
      } else {
        return this.getLastSegmentIndex();
      }
    };

    /**
     * @returns {number}
     */
    DocumentData.prototype.getLastSegmentIndex = function getLastSegmentIndex() {
      return this.getNumberOfSegments() - 1;
    };

    /**
     * @returns {number}
     */
    DocumentData.prototype.getNumberOfSegments = function getNumberOfSegments() {
      return this.getSegments().length;
    };

    /**
     * @returns {Array|*}
     */
    DocumentData.prototype.getSegments = function getSegments() {
      return Quill.removeTrailingCarriageReturn(this.editor.getText()).split('\n');
    };

    function Segment(text) {
      text = text || '';
      this.text = text;
      this.learnt = {
        text: '',
        documentSetId: '',
        previousRange: {}
      };
      this.state = {};
      this.blockEndIndex = -1;

    }

    Segment.prototype.setLearntText = function setLearntText() {
      this.learnt.text = (this.state.machineHasLearnt) ? this.text : '';
    };

    Segment.prototype.hasLearntText = function hasLearntText(text) {
      return this.learnt.text.includes(text);
    };

    Segment.prototype.updateState = function updateState(formats) {
      if (angular.isDefined(formats.state)) {
        if (angular.isDefined(formats.state.status)) {
          formats.state.status = Number(formats.state.status);
        }

        if (angular.isDefined(formats.state.machineHasLearnt) &&
          typeof formats.state.machineHasLearnt === 'string'
        ) {
          formats.state.machineHasLearnt =
            (formats.state.machineHasLearnt.toLowerCase() === 'true');
        }

        this.state = formats.state;
      } else {
        this.state = {};
      }
    };

    Segment.prototype.hasNoState = function hasNoState() {
      return angular.isUndefined(this.state.status) &&
        angular.isUndefined(this.state.machineHasLearnt);
    };

  }])

  ;
