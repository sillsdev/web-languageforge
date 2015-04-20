  'use strict';

describe('Project Settings', function() {
  var scope, controller;
  beforeEach(function() {
    module('sfchecks.projectSettings');
  });
  
  describe('Members Tab', function() { });
  describe('Question Templates Tab', function() {
    var mockTemplates = [
        {id: '1', title: 'Tell me more', description: '...about this text'},
        {id: '2', title: 'Which person is speaking?', description: 'in this text'},
        {id: '3', title: 'Who died?', description: 'the butcher or the baker?'},
    ];
    var qtServiceMock = { 
        list: function(callback) { callback({ok: true, data:{entries:mockTemplates}}); },
        update: function(template, callback) { callback({ok: true});}
    };
    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      
      scope.project = {id: '12345'};
  
      // Set up the controller with that fresh scope
      controller = $controller('ProjectSettingsQTemplateCtrl', {
        $scope: scope,
        questionTemplateService: qtServiceMock
      });
    }));

    it('can list templates', function() {
      expect(scope.templates.length).toBe(0);
      scope.queryTemplates();
      expect(scope.templates.length).toBe(3);
    });
    
    it('can add templates', function() {
      scope.editedTemplate.title = 'What color is her hair?';
      scope.editedTemplate.description = 'In the story, what color is her hair?';
      spyOn(qtServiceMock, 'update').and.callThrough();
      scope.editTemplate();
      expect(qtServiceMock.update).toHaveBeenCalled();
    });
  });
  describe('Archived Texts Tab', function() { });
  describe('Project Properties Tab', function() { });
  describe('Project Setup Tab', function() { });
  describe('Communication Settings Tab', function() { });
});