<?php

use Api\Model\Languageforge\Lexicon\Command\LexProjectCommands;
use Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class LexProjectCommandsTest extends TestCase
{
    public function testUpdateConfig_ConfigPersists()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $config = json_decode(json_encode(LexBaseViewDto::encode($projectId, $userId)['config']), true);

        $this->assertTrue($config['tasks']['addMeanings']['visible']);
        $this->assertEquals('th', $config['entry']['fields']['lexeme']['inputSystems'][0]);

        $config['tasks']['addMeanings']['visible'] = false;
        $config['entry']['fields']['lexeme']['inputSystems'] = array('my', 'th');

        LexProjectCommands::updateConfig($projectId, $config);

        $project2 = new LexProjectModel($projectId);

        // test for a few default values
        $this->assertEquals('en', $project2->inputSystems['en']->tag);
        $this->assertTrue($project2->config->tasks['dbe']->visible);
        $this->assertEquals('Word', $project2->config->entry->fields['lexeme']->label);

        // test for updated values
        $this->assertFalse($project2->config->tasks['addMeanings']->visible);
        $this->assertEquals('my', $project2->config->entry->fields['lexeme']->inputSystems[0]);
        $this->assertEquals('th', $project2->config->entry->fields['lexeme']->inputSystems[1]);
    }

    public function testUpdateProject_ReadOnlyProperties_PropertiesNotChanged()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $hackerId = $environ->createUser('Hacker', 'Hacker', 'hacker@example.com');
        $hacker = new UserModel($hackerId);
        $hacker->role = SystemRoles::USER;
        $hacker->write();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::MANAGER);
        $project->ownerRef = $user->id->asString();
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $hackedData = 'hacked';
        $params = ProjectCommands::readProject($projectId);
        $params['projectName'] = 'new project name';
        $params['id'] = $hackedData;
        $params['ownerRef'] = $hacker->id->asString();
        $params['users'][$hacker->id->asString()]['role'] = ProjectRoles::MANAGER;
        $params['projectCode'] = $hackedData;
        $params['siteName'] = $hackedData;
        $params['appName'] = $hackedData;
        $params['userProperties']['userProfilePickLists']['city']['name'] = $hackedData;
        LexProjectCommands::updateProject($projectId, $userId, $params);

        $updatedProject = ProjectCommands::readProject($projectId);
        $this->assertEquals('new project name', $updatedProject['projectName']);
        $this->assertNotEquals($hackedData, $updatedProject['id']);
        $this->assertNotEquals($hacker->id->asString(), $updatedProject['ownerRef']);
        $this->assertFalse(isset($updatedProject['users'][$hacker->id->asString()]));
        $this->assertNotEquals($hackedData, $updatedProject['projectCode']);
        $this->assertNotEquals($hackedData, $updatedProject['siteName']);
        $this->assertNotEquals($hackedData, $updatedProject['appName']);
        $this->assertNotEquals($hackedData, $updatedProject['userProperties']['userProfilePickLists']['city']['name']);
    }

    public function testCreateCustomFieldsViews_ProjectDoesNotExist_NoAction()
    {
        $result = LexProjectCommands::updateCustomFieldViews('non-existent-projectCode', []);

        $this->assertFalse($result);
    }

    public function testCreateCustomFieldsViews_CreateTwoCustomFieldViews_TwoCreated()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        // setup: 1 example custom field (existing), 1 in senses (to delete), 1 in entry (to create)
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEquals($projectId, $result);
        $project2 = new LexProjectModel($projectId);
        $this->assertEquals($mangerRoleViewFieldCount + 1,
            $project2->config->roleViews[LexRoles::MANAGER]->fields->count());
        $this->assertArrayNotHasKey($customFieldNameToDelete, $project2->config->roleViews[LexRoles::MANAGER]->fields);
        $customFieldCreated = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameToCreate];
        $this->assertTrue(is_a($customFieldCreated, 'Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig'));
        $customFieldExisting = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldNameExisting];
        $this->assertTrue(is_a($customFieldExisting, 'Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig'));
        $this->assertFalse($customFieldExisting->show);
    }

    public function testCreateCustomFieldsViews_CreateTwoCustomFieldViewsViaRunClass_TwoCreated()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        // setup: 1 custom field to delete (senses), 2 to create (entry and example)
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEquals($projectId, $result);
        $project2 = new LexProjectModel($projectId);
        $this->assertArrayNotHasKey($customFieldName, $project2->config->roleViews[LexRoles::MANAGER]->fields);
        $customFieldName = $customFieldSpecs[0]['fieldName'];
        $customField0 = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField0, 'Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig'));
        $customFieldName = $customFieldSpecs[1]['fieldName'];
        $customField1 = $project2->config->roleViews[LexRoles::MANAGER]->fields[$customFieldName];
        $this->assertTrue(is_a($customField1, 'Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig'));
    }
}
