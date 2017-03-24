angular.module('translate.services')
  .service('translateDocumentApi', ['jsonRpc', function (jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.updateDocumentSet = function updateDocumentSet(documentSet, callback) {
      jsonRpc.call('translate_documentSetUpdate', [documentSet], callback);
    };

    this.listDocumentSetsDto = function listDocumentSetsDto(callback) {
      jsonRpc.call('translate_documentSetListDto', [], callback);
    };

    this.removeDocumentSet = function removeDocumentSet(documentSetId, callback) {
      jsonRpc.call('translate_documentSetRemove', [documentSetId], callback);
    };

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
      function setSegmentLearntData(segmentIndex, documentSetId)
    {
      this.segment.text = this.getSegment(segmentIndex);
      this.segment.learnt.text = this.segment.getLearntText();
      this.segment.learnt.documentSetId = documentSetId;
      this.segment.learnt.previousRange = this.editor.getSelection();
      this.updateSegmentState();
      this.updateSegmentBlockEndIndex();
    };

    DocumentData.prototype.updateSegmentState = function updateSegmentState() {
      if (this.editor.hasNoSelectionAtCursor()) {
        this.segment.updateState(this.editor.getFormat());
      }
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
      if (!this.editor.getText() || index < 0) return '';

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

    Segment.prototype.getLearntText = function getLearntText() {
      return this.state.machineHasLearnt ? this.text : '';
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
      }
    };

    Segment.prototype.hasNoState = function hasNoState() {
      return angular.isUndefined(this.state.status) &&
        angular.isUndefined(this.state.machineHasLearnt);
    };

  }])

  ;
