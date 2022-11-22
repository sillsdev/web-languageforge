<?php

use Api\Model\Languageforge\Lexicon\Command\LexCommentCommands;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ActivityListDtoTest extends TestCase
{
    // Tests for Language Forge-specific activities

    /** @throws Exception */
    public function testGetActivityForUser_UpdateEntry_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("th", "apple");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "apple");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("fr", "pomme");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "eat an apple");
        $sense1->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("fr", "manger une pomme");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params["senses"][0]["examples"][0]["sentence"]["en"]["value"] = "also eat an apple";
        $params["senses"][1]["examples"] = [];

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        $this->assertEquals(ActivityModel::UPDATE_ENTRY, $activityRecord["action"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $content = $activityRecord["content"];
        $this->assertEquals(SF_TESTPROJECT, $content["project"]);
        $this->assertEquals("apple", $content["entry"]);
        $this->assertEquals("user1", $content["user"]); // TODO: Shouldn't this be "User One" instead? E.g., human-readable name here rather than username? (Same comment applies in all parts of other tests where we check $content['user']). - 2018-06 RM
        $this->assertArrayHasKey("changes", $content);
        $changes = $content["changes"];
        $this->assertCount(3, $changes);

        $this->assertContains(
            [
                "changeType" => ActivityListDto::EDITED_FIELD,
                "fieldName" => LexConfig::EXAMPLE_SENTENCE,
                "fieldLabel" => ["label" => "Sentence", "sense" => 1, "example" => 1],
                "inputSystemTag" => "en",
                "oldValue" => "eat an apple",
                "newValue" => "also eat an apple",
            ],
            $changes
        );

        $this->assertContains(
            [
                "changeType" => ActivityListDto::EDITED_FIELD, // TODO: Should this become "deleted_field" instead?
                "fieldName" => LexConfig::EXAMPLE_SENTENCE,
                "fieldLabel" => ["label" => "Sentence", "sense" => 2, "example" => 1],
                "inputSystemTag" => "fr",
                "oldValue" => "manger une pomme",
                "newValue" => "",
            ],
            $changes
        );

        $this->assertContains(
            [
                "changeType" => ActivityListDto::DELETED_FIELD,
                "fieldName" => LexConfig::EXAMPLES_LIST,
                "fieldLabel" => ["label" => "Example", "sense" => 2, "example" => 1],
                "oldValue" => "",
                "newValue" => "",
            ],
            $changes
        );
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddExample_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("th", "apple");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "apple");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("fr", "pomme");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "eat an apple");
        $sense1->examples[] = $example1;
        $entryId = $entry->write();

        $example2Guid = \Api\Model\Languageforge\Lexicon\Guid::create();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params["senses"][1]["examples"] = [
            [
                "guid" => $example2Guid,
                "sentence" => ["fr" => ["value" => "manger une pomme"]],
            ],
        ];

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        $this->assertEquals(ActivityModel::UPDATE_ENTRY, $activityRecord["action"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $content = $activityRecord["content"];
        $this->assertEquals(SF_TESTPROJECT, $content["project"]);
        $this->assertEquals("apple", $content["entry"]);
        $this->assertEquals("user1", $content["user"]);
        $this->assertArrayHasKey("changes", $content);
        $changes = $content["changes"];
        $this->assertCount(2, $changes);
        $change = $changes[0];

        $this->assertEquals(ActivityListDto::ADDED_FIELD, $change["changeType"]);
        $this->assertEquals(LexConfig::EXAMPLES_LIST, $change["fieldName"]);
        $this->assertEquals(["label" => "Example", "sense" => 2, "example" => 1], $change["fieldLabel"]);
        // Adding a whole example doesn't store its contents in the activity log
        // TODO: Decide whether it should do so
        $this->assertArrayNotHasKey("inputSystemTag", $change);
        $this->assertEquals("", $change["oldValue"]);
        $this->assertEquals("", $change["newValue"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddExampleSentence_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("th", "apple");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "apple");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("fr", "pomme");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "eat an apple");
        $sense1->examples[] = $example1;
        $example2 = new LexExample();
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params["senses"][1]["examples"] = [
            [
                "guid" => $example2->guid,
                "sentence" => ["fr" => ["value" => "manger une pomme"]],
            ],
        ];

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        $this->assertEquals(ActivityModel::UPDATE_ENTRY, $activityRecord["action"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $content = $activityRecord["content"];
        $this->assertEquals(SF_TESTPROJECT, $content["project"]);
        $this->assertEquals("apple", $content["entry"]);
        $this->assertEquals("user1", $content["user"]);
        $this->assertArrayHasKey("changes", $content);
        $changes = $content["changes"];
        $this->assertCount(1, $changes);
        $change = $changes[0];

        $this->assertEquals(ActivityListDto::EDITED_FIELD, $change["changeType"]);
        $this->assertEquals(LexConfig::EXAMPLE_SENTENCE, $change["fieldName"]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $change["fieldLabel"]);
        // Adding a single MultiText field in an example does store its contents in the activity log
        // TODO: Decide whether it should do so
        $this->assertEquals("fr", $change["inputSystemTag"]);
        $this->assertEquals("", $change["oldValue"]);
        $this->assertEquals("manger une pomme", $change["newValue"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        LexCommentCommands::updateComment($projectId, $userId, $data);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        $this->assertEquals(ActivityModel::ADD_LEX_COMMENT, $activityRecord["action"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_PlusOneEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $data);
        LexCommentCommands::plusOneComment($projectId, $userId, $commentId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(2, $activity);
        // We're only interested in the LEX_COMMENT_INCREASE_SCORE activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord["action"] != ActivityModel::LEX_COMMENT_INCREASE_SCORE) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::LEX_COMMENT_INCREASE_SCORE, $activityRecord["action"]);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_UpdateEntryCommentStatus_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $data);
        LexCommentCommands::updateCommentStatus($projectId, $commentId, LexCommentModel::STATUS_TODO);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(2, $activity);
        // We're only interested in the UPDATE_LEX_COMMENT_STATUS activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord["action"] != ActivityModel::UPDATE_LEX_COMMENT_STATUS) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::UPDATE_LEX_COMMENT_STATUS, $activityRecord["action"]);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals(LexCommentModel::STATUS_TODO, $actual[ActivityModel::LEX_COMMENT_STATUS]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_DeleteEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $data);
        LexCommentCommands::deleteComment($projectId, $userId, $commentId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(2, $activity);
        // We're only interested in the DELETE_LEX_COMMENT activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord["action"] != ActivityModel::DELETE_LEX_COMMENT) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::DELETE_LEX_COMMENT, $activityRecord["action"]);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddReplyToEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $data);

        $replyData = [
            "id" => "",
            "content" => "my first reply",
        ];
        LexCommentCommands::updateReply($projectId, $userId, $commentId, $replyData);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(2, $activity);
        // We're only interested in the ADD_LEX_REPLY activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord["action"] != ActivityModel::ADD_LEX_REPLY) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::ADD_LEX_REPLY, $activityRecord["action"]);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $expected["replyContent"] = $replyData["content"];
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["replyContent"], $actual[ActivityModel::LEX_REPLY]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_UpdateReplyToEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $data);

        $replyData = [
            "id" => "",
            "content" => "my first reply",
        ];
        $replyId = LexCommentCommands::updateReply($projectId, $userId, $commentId, $replyData);

        $updatedReplyData = [
            "id" => $replyId,
            "content" => "edited the first reply",
        ];
        $updatedReplyId = LexCommentCommands::updateReply($projectId, $userId, $commentId, $updatedReplyData);
        $this->assertEquals($replyId, $updatedReplyId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(3, $activity);
        // We're only interested in the UPDATE_LEX_REPLY activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord["action"] != ActivityModel::UPDATE_LEX_REPLY) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::UPDATE_LEX_REPLY, $activityRecord["action"]);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $expected["replyContent"] = $updatedReplyData["content"];
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["replyContent"], $actual[ActivityModel::LEX_REPLY]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }

    /** @throws Exception */
    public function testGetActivityForUser_DeleteReplyToEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser("user1", "User One", "user1@email.com");
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("en", "bank");
        $sense1 = new LexSense();
        $sense1->definition->form("en", "the sides of a river");
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form("en", "a place to store money");
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form("en", "money in the bank");
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form("en", "a run on the bank");
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            "field" => "sentence",
            "fieldNameForDisplay" => "Sentence",
            "fieldValue" => "a run on the bank",
            "inputSystem" => "en",
            "word" => "bank",
            "meaning" => "a place to store money",
        ];
        $data = [
            "id" => "",
            "entryRef" => $entryId,
            "content" => "Comment on the sentence",
            "regarding" => $regarding,
            "contextGuid" => " sense#" . $sense2->guid . " example#" . $example1->guid . " sentence.en",
            "isRegardingPicture" => false,
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $data);

        $replyData = [
            "id" => "",
            "content" => "my first reply",
        ];
        $replyId = LexCommentCommands::updateReply($projectId, $userId, $commentId, $replyData);
        LexCommentCommands::deleteReply($projectId, $userId, $commentId, $replyId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto["activity"];
        $this->assertCount(3, $activity);
        // We're only interested in the DELETE_LEX_REPLY activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord["action"] != ActivityModel::DELETE_LEX_REPLY) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::DELETE_LEX_REPLY, $activityRecord["action"]);
        $this->assertEquals($projectId, $activityRecord["projectRef"]["id"]);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord["projectRef"]["type"]);
        $this->assertEquals($entryId, $activityRecord["entryRef"]);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey("content", $activityRecord);
        $actual = $activityRecord["content"];
        $expected = $data;
        $expected["replyContent"] = $replyData["content"];
        $this->assertEquals(SF_TESTPROJECT, $actual["project"]);
        $this->assertEquals("user1", $actual["user"]);
        $this->assertEquals($expected["content"], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected["replyContent"], $actual[ActivityModel::LEX_REPLY]);
        $this->assertEquals($expected["contextGuid"], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected["regarding"]["fieldValue"], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(["label" => "Sentence", "sense" => 2, "example" => 1], $actual["fieldLabel"]);
    }
}
