<?php

use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\dto\LexBaseViewDto;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\LiftMergeRule;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;
use models\UserModel;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

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
}
