<?php

use Api\Model\Languageforge\Lexicon\Command\LexProjectCommands;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Languageforge\Lexicon\LexiconRoles;
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

        $project2 = new LexiconProjectModel($projectId);

        // test for a few default values
        $this->assertEqual($project2->inputSystems['en']->tag, 'en');
        $this->assertTrue($project2->config->tasks['dbe']->visible);
        $this->assertEqual($project2->config->entry->fields['lexeme']->label, 'Word');

        // test for updated values
        $this->assertFalse($project2->config->tasks['addMeanings']->visible);
        $this->assertEqual($project2->config->entry->fields['lexeme']->inputSystems[0], 'my');
        $this->assertEqual($project2->config->entry->fields['lexeme']->inputSystems[1], 'th');
    }

    public function testCreateCustomFieldsViews_ProjectDoesntExist_NoAction()
    {
        $result = LexProjectCommands::createCustomFieldsViews('non-existent-projectCode', []);

        $this->assertFalse($result);
    }

    public function testCreateCustomFieldsViews_CreateTwoCustomFieldViews_TwoCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $customFields = array(
            array(
                'name' => 'customField_entry_testMultiPara',
                'specType' => 'OwningAtom'
            ),
            array(
                'name' => 'customField_examples_testOptionList',
                'specType' => 'ReferenceAtom'
            )
        );

        $result = LexProjectCommands::createCustomFieldsViews($project->projectCode, $customFields);

        $this->assertEqual($result, $projectId);
        $project2 = new LexiconProjectModel($projectId);
        $customFieldName = $customFields[0]['name'];
        $customField0 = $project2->config->roleViews[LexiconRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField0, 'Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig'));
        $customFieldName = $customFields[1]['name'];
        $customField1 = $project2->config->roleViews[LexiconRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField1, 'Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig'));
    }

    public function testCreateCustomFieldsViews_CreateTwoCustomFieldViewsViaRunClass_TwoCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $customFields = array(
            array(
                'name' => 'customField_entry_testMultiPara',
                'specType' => 'OwningAtom'
            ),
            array(
                'name' => 'customField_examples_testOptionList',
                'specType' => 'ReferenceAtom'
            )
        );

        $runClassParameters = array(
            'className' => 'Api\Model\Languageforge\Lexicon\Command\LexProjectCommands',
            'methodName' => 'createCustomFieldsViews',
            'parameters' => array(
                $project->projectCode,
                $customFields
            ),
            'isTest' => true
        );
        $runClassParameterFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'testCustomFieldsViews.json';
        file_put_contents($runClassParameterFilePath, json_encode($runClassParameters));
        $webPath = '/var/www/virtual/languageforge.org/htdocs/';
        $command = 'php ' . $webPath . 'Api/Library/Shared/CLI/RunClass.php < ' . $runClassParameterFilePath;
        $output = shell_exec($command);
        unlink($runClassParameterFilePath);
        $result = json_decode($output);

        $this->assertEqual($result, $projectId);
        $project2 = new LexiconProjectModel($projectId);
        $customFieldName = $customFields[0]['name'];
        $customField0 = $project2->config->roleViews[LexiconRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField0, 'Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig'));
        $customFieldName = $customFields[1]['name'];
        $customField1 = $project2->config->roleViews[LexiconRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField1, 'Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig'));
    }
}
