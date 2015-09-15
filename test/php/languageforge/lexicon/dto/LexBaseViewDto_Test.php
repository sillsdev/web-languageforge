<?php

use Api\Model\Shared\Rights\SystemRoles;

use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\UserProfileModel;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexBaseViewDto extends UnitTestCase
{
    public function testEncode_Project_DtoCorrect()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserProfileModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->interfaceLanguageCode = 'th';
        $user->write();
        $project->write();

        $dto = LexBaseViewDto::encode($projectId, $userId);

        // test for a few default values
        $this->assertEqual($dto['config']['inputSystems']['en']['tag'], 'en');
        $this->assertTrue($dto['config']['tasks']['dbe']['visible']);
        $this->assertEqual($dto['config']['entry']['type'], 'fields', 'dto config is not valid');
        $this->assertEqual($dto['config']['entry']['fields']['lexeme']['label'], 'Word');
        $this->assertEqual($dto['config']['entry']['fields']['lexeme']['label'], 'Word');
        $this->assertEqual($dto['config']['entry']['fields']['senses']['fields']['partOfSpeech']['label'], 'Part of Speech');
        $this->assertTrue($dto['config']['roleViews']['contributor']['fields']['lexeme']['show']);
        $this->assertTrue($dto['config']['roleViews']['contributor']['showTasks']['dbe']);
        // todo re-enable this after userLanguageCode feature is mature
        //$this->assertEqual($dto['interfaceConfig']['userLanguageCode'], 'th');
        $this->assertEqual($dto['interfaceConfig']['selectLanguages']['options']['en'], 'English');
    }

}
