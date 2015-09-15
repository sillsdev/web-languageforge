<?php

use Api\Model\Shared\Rights\SystemRoles;

use Api\Model\Languageforge\Lexicon\Dto\LexProjectDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\UserModel;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexProjectDto extends UnitTestCase
{
    public function testEncode_Project_DtoCorrect()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $project->interfaceLanguageCode = 'en';
        $project->projectCode = 'lf';
        $project->featured = true;

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = LexProjectDto::encode($projectId, $userId);

        // test for a few default values
        $this->assertEqual($dto['project']['interfaceLanguageCode'], 'en');
        $this->assertEqual($dto['project']['projectCode'], 'lf');
        $this->assertTrue($dto['project']['featured']);
    }

}
