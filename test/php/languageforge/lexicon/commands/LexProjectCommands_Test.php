<?php

use Api\Model\Languageforge\Lexicon\Command\LexProjectCommands;
use Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestLexProjectCommands extends UnitTestCase
{
    public function testUpdateConfig_ConfigPersists()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $config = json_decode(json_encode(LexBaseViewDto::encode($projectId, $userId)['config']), true);

        $this->assertTrue($config['tasks']['addMeanings']['visible']);
        $this->assertEqual($config['entry']['fields']['lexeme']['inputSystems'][0], 'th');

        $config['tasks']['addMeanings']['visible'] = false;
        $config['entry']['fields']['lexeme']['inputSystems'] = array('my', 'th');

        LexProjectCommands::updateConfig($projectId, $config);

        $project2 = new LexProjectModel($projectId);

        // test for a few default values
        $this->assertEqual($project2->inputSystems['en']->tag, 'en');
        $this->assertTrue($project2->config->tasks['dbe']->visible);
        $this->assertEqual($project2->config->entry->fields['lexeme']->label, 'Word');

        // test for updated values
        $this->assertFalse($project2->config->tasks['addMeanings']->visible);
        $this->assertEqual($project2->config->entry->fields['lexeme']->inputSystems[0], 'my');
        $this->assertEqual($project2->config->entry->fields['lexeme']->inputSystems[1], 'th');
    }

    public function testCreateCustomFieldsViews_ProjectDoesNotExist_NoAction()
    {
        $result = LexProjectCommands::updateCustomFieldViews('non-existent-projectCode', []);

        $this->assertFalse($result);
    }

    public function testCreateCustomFieldsViews_CreateTwoCustomFieldViews_TwoCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        // setup: 1 example custom field (existing), 1 in senses (to delete), 1 in entry (to create)
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $customFieldNameExisting = 'customField_examples_testOptionList';
        $viewFieldConfig = new LexViewFieldConfig();
        $viewFieldConfig->type = 'ReferenceAtom';
        $viewFieldConfig->show = false;
        $project->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameExisting] = $viewFieldConfig;
        $customFieldNameToCreate = 'customField_entry_testMultiText';
        $customFieldSpecs = array(
            array(
                'fieldName' => $customFieldNameToCreate,
                'fieldType' => 'MultiString'
            ),
            array(
                'fieldName' => $customFieldNameExisting,
                'fieldType' => $viewFieldConfig->type
            )
        );
        $mangerRoleViewFieldCount = $project->config->roleViews[LexRoles::MANAGER]->fields->count();
        $customFieldNameToDelete = 'customField_senses_testOptionList';
        $viewFieldConfig = new LexViewFieldConfig();
        $viewFieldConfig->type = 'ReferenceAtom';
        $project->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameToDelete] = $viewFieldConfig;
        $projectId = $project->write();
        $this->assertFalse($project->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameExisting]->show);

        // execute
        $result = LexProjectCommands::updateCustomFieldViews($project->projectCode, $customFieldSpecs);

        // verify
        $this->assertEqual($result, $projectId);
        $project2 = new LexProjectModel($projectId);
        $this->assertEqual($project2->config->roleViews[LexRoles::MANAGER]->fields->count(),
            $mangerRoleViewFieldCount + 1);
        $this->assertFalse(array_key_exists($customFieldNameToDelete, $project2->config->roleViews[LexRoles::MANAGER]->fields));
        $customFieldCreated = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameToCreate];
        $this->assertTrue(is_a($customFieldCreated, 'Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig'));
        $customFieldExisting = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameExisting];
        $this->assertTrue(is_a($customFieldExisting, 'Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig'));
        $this->assertFalse($customFieldExisting->show);
    }

    public function testCreateCustomFieldsViews_CreateTwoCustomFieldViewsViaRunClass_TwoCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        // setup: 1 custom field to delete (senses), 2 to create (entry and example)
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $customFieldName = 'customField_senses_testOptionList';
        $viewFieldConfig = new LexViewFieldConfig();
        $viewFieldConfig->type = 'ReferenceAtom';
        $project->config->roleViews[LexRoles::MANAGER]->fields[$customFieldName] = $viewFieldConfig;
        $projectId = $project->write();
        $customFieldSpecs = array(
            array(
                'fieldName' => 'customField_entry_testMultiText',
                'fieldType' => 'MultiString'
            ),
            array(
                'fieldName' => 'customField_examples_testOptionList',
                'fieldType' => 'ReferenceAtom'
            )
        );

        // execute
        $runClassParameters = array(
            'className' => 'Api\Model\Languageforge\Lexicon\Command\LexProjectCommands',
            'methodName' => 'updateCustomFieldViews',
            'parameters' => array(
                $project->projectCode,
                $customFieldSpecs
            ),
            'isTest' => true
        );
        $runClassParameterFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'testCustomFieldsViews.json';
        file_put_contents($runClassParameterFilePath, json_encode($runClassParameters));
        $command = 'php ' . APPPATH . 'Api/Library/Shared/CLI/RunClass.php < ' . $runClassParameterFilePath;
        $output = shell_exec($command);
        unlink($runClassParameterFilePath);
        $result = json_decode($output);

        // verify
        $this->assertEqual($result, $projectId);
        $project2 = new LexProjectModel($projectId);
        $this->assertFalse(array_key_exists($customFieldName, $project2->config->roleViews[LexRoles::MANAGER]->fields));
        $customFieldName = $customFieldSpecs[0]['fieldName'];
        $customField0 = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField0, 'Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig'));
        $customFieldName = $customFieldSpecs[1]['fieldName'];
        $customField1 = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField1, 'Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig'));
    }
}
