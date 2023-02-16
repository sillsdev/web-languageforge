<?php

use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class LexBaseViewDtoTest extends TestCase
{
    public function testEncode_Project_DtoCorrect()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->interfaceLanguageCode = "th";
        $user->write();
        $project->write();

        $dto = LexBaseViewDto::encode($projectId, $userId);

        // test for a few default values
        $this->assertEquals("en", $dto["config"]["inputSystems"]["en"]["tag"]);
        $this->assertTrue($dto["config"]["tasks"]["dbe"]["visible"]);
        $this->assertEquals("fields", $dto["config"]["entry"]["type"], "dto config is not valid");
        $this->assertEquals("Lexeme", $dto["config"]["entry"]["fields"]["lexeme"]["label"]);
        $this->assertEquals("Lexeme", $dto["config"]["entry"]["fields"]["lexeme"]["label"]);
        $this->assertEquals(
            "Part of Speech",
            $dto["config"]["entry"]["fields"]["senses"]["fields"]["partOfSpeech"]["label"]
        );
        $this->assertTrue($dto["config"]["roleViews"]["contributor"]["fields"]["lexeme"]["show"]);
        $this->assertTrue($dto["config"]["roleViews"]["contributor"]["showTasks"]["dbe"]);
        $this->assertEquals("th", $dto["interfaceConfig"]["languageCode"]);
        $this->assertEquals("English", $dto["interfaceConfig"]["selectLanguages"]["options"]["en"]["option"]);
    }
}
