<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\ProjectModel;
use PHPUnit\Framework\TestCase;

class ActivityCommandsTest extends TestCase
{
    /** @throws Exception */
    public function testGetActivityForProject_ProjectWhereUsersCannotSeeEachOthersResponses_DtoAsExpected()
    {
        $sampleData = $this->createActivityTestEnvironment(false);

        $dto = ActivityListDto::getActivityForUser($sampleData['project']->siteName, $sampleData['user1Id']);

        $this->assertContains($sampleData['a1'], $dto['unread']);     // Text added to project
        $this->assertContains($sampleData['a2'], $dto['unread']);     // Add user1 to project
        $this->assertContains($sampleData['a3'], $dto['unread']);     // Add user2 to project
        $this->assertContains($sampleData['a4'], $dto['unread']);     // Add user3 to project
        $this->assertContains($sampleData['a5'], $dto['unread']);     // Create question
        $this->assertNotContains($sampleData['a6'], $dto['unread']);  // User3 answers the question
        $this->assertNotContains($sampleData['a7'], $dto['unread']);  // User1 comments on user3's answer (not visible because user3's answer is not visible)
        $this->assertNotContains($sampleData['a8'], $dto['unread']);  // User2 comments on user3's answer
        $this->assertNotContains($sampleData['a9'], $dto['unread']);  // Update user3's answer
        $this->assertNotContains($sampleData['a10'], $dto['unread']); // Update first comment

        $this->assertActivityDtoAsExpected($sampleData, $dto);

        $dto2 = ActivityListDto::getActivityForUser($sampleData['project']->siteName, $sampleData['user3Id']);

        $this->assertContains($sampleData['a1'], $dto2['unread']);     // Text added to project
        $this->assertContains($sampleData['a2'], $dto2['unread']);     // Add user1 to project
        $this->assertContains($sampleData['a3'], $dto2['unread']);     // Add user2 to project
        $this->assertContains($sampleData['a4'], $dto2['unread']);     // Add user3 to project
        $this->assertContains($sampleData['a5'], $dto2['unread']);     // Create question
        $this->assertContains($sampleData['a6'], $dto2['unread']);     // User3 answers the question
        $this->assertNotContains($sampleData['a7'], $dto2['unread']);  // User1 comments on user3's answer
        $this->assertNotContains($sampleData['a8'], $dto2['unread']);  // User2 comments on user3's answer
        $this->assertContains($sampleData['a9'], $dto2['unread']);     // Update user3's answer
        $this->assertNotContains($sampleData['a10'], $dto2['unread']); // Update first comment

        $this->assertActivityDtoAsExpected($sampleData, $dto2);
    }

    /** @throws Exception */
    public function testGetActivityForProject_ProjectWhereUsersCanSeeEachOthersResponses_DtoAsExpected()
    {
        $sampleData = $this->createActivityTestEnvironment(true);

        $dto = ActivityListDto::getActivityForUser($sampleData['project']->siteName, $sampleData['user1Id']);

        $this->assertContains($sampleData['a1'], $dto['unread']);  // Text added to project
        $this->assertContains($sampleData['a2'], $dto['unread']);  // Add user1 to project
        $this->assertContains($sampleData['a3'], $dto['unread']);  // Add user2 to project
        $this->assertContains($sampleData['a4'], $dto['unread']);  // Add user3 to project
        $this->assertContains($sampleData['a5'], $dto['unread']);  // Create question
        $this->assertContains($sampleData['a6'], $dto['unread']);  // User3 answers the question
        $this->assertContains($sampleData['a7'], $dto['unread']);  // User1 comments on user3's answer
        $this->assertContains($sampleData['a8'], $dto['unread']);  // User2 comments on user3's answer
        $this->assertContains($sampleData['a9'], $dto['unread']);  // Update user3's answer
        $this->assertContains($sampleData['a10'], $dto['unread']); // Update first comment

        $this->assertActivityDtoAsExpected($sampleData, $dto);

        $dto2 = ActivityListDto::getActivityForUser($sampleData['project']->siteName, $sampleData['user3Id']);

        $this->assertContains($sampleData['a1'], $dto2['unread']);  // Text added to project
        $this->assertContains($sampleData['a2'], $dto2['unread']);  // Add user1 to project
        $this->assertContains($sampleData['a3'], $dto2['unread']);  // Add user2 to project
        $this->assertContains($sampleData['a4'], $dto2['unread']);  // Add user3 to project
        $this->assertContains($sampleData['a5'], $dto2['unread']);  // Create question
        $this->assertContains($sampleData['a6'], $dto2['unread']);  // User3 answers the question
        $this->assertContains($sampleData['a7'], $dto2['unread']);  // User1 comments on user3's answer
        $this->assertContains($sampleData['a8'], $dto2['unread']);  // User2 comments on user3's answer
        $this->assertContains($sampleData['a9'], $dto2['unread']);  // Update user3's answer
        $this->assertContains($sampleData['a10'], $dto2['unread']); // Update first comment

        $this->assertActivityDtoAsExpected($sampleData, $dto2);
    }

    /**
     * @param bool $canUsersSeeEachOthersResponses
     * @return array
     * @throws Exception
     */
    private function createActivityTestEnvironment($canUsersSeeEachOthersResponses = true)
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $sfproject = new SfchecksProjectModel($project->id->asString());
        $sfproject->usersSeeEachOthersResponses = $canUsersSeeEachOthersResponses;
        $sfproject->write();

        list($user1Id, $user2Id, $user3Id, $a2, $a3, $a4) = $this->createSampleUsers($environ, $project);

        // We create a text, a question, and an answer, with two comments. Then we update the answer and the first comment.
        // All activity-log entries are also captured so that calling code can check them.
        list($text, $textId, $a1) = $this->createSampleText($project, 'Text 1', 'text content', $user1Id);

        list($question, $questionId, $a5) = $this->createSampleQuestion($project, $textId, 'the question', 'question description', $user1Id);
        list($answer, $answerId, $a6) = $this->createSampleAnswer($project, $user3Id, $question, $questionId, 'first answer', 'text highlight');
        list($comment1, $comment1Id, $a7) = $this->addComment($project, $user1Id, $questionId, $answerId, 'first comment');
        list($comment2, $comment2Id, $a8) = $this->addComment($project, $user2Id, $questionId, $answerId, 'second comment');
        list($answer_updated, $a9) = $this->updateAnswer($project, $questionId, $answerId, 'first answer revised');
        list($comment1_updated, $a10) = $this->updateComment($project, $questionId, $answerId, $comment1Id, 'first comment revised');

        // All of the variables above are used in the unit tests, so return them all as a single large array.
        // We'll use a keyed array so that calling code doesn't have to deal with more than twenty (!) positional return values.
        return [
            'environ' => $environ,
            'project' => $project,
            'text' => $text,
            'textId' => $textId,
            'user1Id' => $user1Id,
            'user2Id' => $user2Id,
            'user3Id' => $user3Id,
            'question' => $question,
            'questionId' => $questionId,
            'answer' => $answer,
            'answerId' => $answerId,
            'comment1' => $comment1,
            'comment1Id' => $comment1Id,
            'comment2' => $comment2,
            'comment2Id' => $comment2Id,
            'answer_updated' => $answer_updated,
            'comment1_updated' => $comment1_updated,
            'a1' => $a1,
            'a2' => $a2,
            'a3' => $a3,
            'a4' => $a4,
            'a5' => $a5,
            'a6' => $a6,
            'a7' => $a7,
            'a8' => $a8,
            'a9' => $a9,
            'a10' => $a10
        ];
    }

    /**
     * @param ProjectModel $project
     * @param string $title
     * @param string $content
     * @param string $userId
     * @return array
     * @throws Exception
     */
    private function createSampleText($project, $title, $content, $userId): array
    {
        $text = new TextModel($project);
        $text->title = $title;
        $text->content = $content;
        $textId = $text->write();
        $a1 = ActivityCommands::addText($project, $textId, $text, $userId);
        return [$text, $textId, $a1];
    }

    /**
     * @param MongoTestEnvironment $environ
     * @param ProjectModel $project
     * @param string $username
     * @return string
     * @throws Exception
     */
    private function createSampleUser($environ, $project, $username): string
    {
        $userId = $environ->createUser($username, $username, $username . '@example.com');
        ProjectCommands::updateUserRole($project->id->asString(), $userId);
        return $userId;
    }

    /**
     * @param MongoTestEnvironment$environ
     * @param ProjectModel $project
     * @return array
     * @throws Exception
     */
    private function createSampleUsers($environ, $project): array
    {
        $user1Id = $this->createSampleUser($environ, $project, 'user1');
        $user2Id = $this->createSampleUser($environ, $project, 'user2');
        $user3Id = $this->createSampleUser($environ, $project, 'user3');
        $a2 = ActivityCommands::addUserToProject($project, $user1Id);
        $a3 = ActivityCommands::addUserToProject($project, $user2Id);
        $a4 = ActivityCommands::addUserToProject($project, $user3Id);
        return [$user1Id, $user2Id, $user3Id, $a2, $a3, $a4];
    }

    /**
     * @param ProjectModel $project
     * @param string $textId
     * @param string $title
     * @param string $description
     * @param string $userId
     * @return array
     * @throws Exception
     */
    private function createSampleQuestion($project, $textId, $title, $description, $userId): array
    {
        $question = new QuestionModel($project);
        $question->title = $title;
        $question->description = $description;
        $question->textRef->id = $textId;
        $questionId = $question->write();
        $a5 = ActivityCommands::addQuestion($project, $questionId, $question, $userId);
        return [$question, $questionId, $a5];
    }

    /**
     * @param ProjectModel $project
     * @param string $user3Id
     * @param QuestionModel $question
     * @param string $questionId
     * @param string $content
     * @param string $textHighlight
     * @return array
     * @throws Exception
     */
    private function createSampleAnswer($project, $user3Id, $question, $questionId, $content, $textHighlight = null): array
    {
        $answer = new AnswerModel();
        $answer->content = $content;
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        if (isset($textHighlight)) {
            $answer->textHighlight = $textHighlight;
        }
        $answerId = $question->writeAnswer($answer);
        $a6 = ActivityCommands::addAnswer($project, $questionId, $answer);
        return [$answer, $answerId, $a6];
    }

    /**
     * @param ProjectModel $project
     * @param string $userId
     * @param string $questionId
     * @param string $answerId
     * @param string $commentText
     * @return array
     * @throws Exception
     */
    private function addComment($project, $userId, $questionId, $answerId, $commentText): array
    {
        $comment = new CommentModel();
        $comment->content = $commentText;
        $comment->userRef->id = $userId;
        $commentId = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment);
        $activity = ActivityCommands::addCommentOnQuestion($project, $questionId, $answerId, $comment);
        return [$comment, $commentId, $activity];
    }

    /**
     * @param ProjectModel $project
     * @param string $questionId
     * @param string $answerId
     * @param string $newContent
     * @return array
     * @throws Exception
     */
    private function updateAnswer($project, $questionId, $answerId, $newContent): array
    {
        $question = new QuestionModel($project, $questionId);
        $answer_updated = $question->readAnswer($answerId);
        $answer_updated->content = $newContent;
        $question->writeAnswer($answer_updated);
        $a9 = ActivityCommands::updateAnswer($project, $questionId, $answer_updated);
        return [$answer_updated, $a9];
    }

    /**
     * @param ProjectModel $project
     * @param string $questionId
     * @param string $answerId
     * @param string $comment1Id
     * @param string $newContent
     * @return array
     * @throws Exception
     */
    private function updateComment($project, $questionId, $answerId, $comment1Id, $newContent): array
    {
        $question = new QuestionModel($project, $questionId);
        $comment1_updated = $question->readComment($answerId, $comment1Id);
        $comment1_updated->content = $newContent;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1_updated);
        $a10 = ActivityCommands::updateCommentOnQuestion($project, $questionId, $answerId, $comment1_updated);
        return [$comment1_updated, $a10];
    }

    /**
     * @param array $sampleData
     * @param array $dto
     */
    private function assertActivityDtoAsExpected($sampleData, $dto)
    {
        $project = $sampleData['project'];
        $expectedProjectRef = [
            'id' => $project->id->asString(),
            'type' => 'sfchecks'
        ];

        $this->assertEquals('add_text', $dto['activity'][$sampleData['a1']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a1']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a1']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a1']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a1']]['content']['text']);

        $this->assertEquals('add_user_to_project', $dto['activity'][$sampleData['a2']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a2']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a2']]['content']['project']);
        $this->assertEquals($sampleData['user1Id'], $dto['activity'][$sampleData['a2']]['userRef']['id']);
        $this->assertEquals('user1', $dto['activity'][$sampleData['a2']]['userRef']['username']);
        $this->assertEquals('user1.png', $dto['activity'][$sampleData['a2']]['userRef']['avatar_ref']);
        $this->assertEquals('user1', $dto['activity'][$sampleData['a2']]['content']['user']);

        $this->assertEquals('add_user_to_project', $dto['activity'][$sampleData['a3']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a3']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a3']]['content']['project']);
        $this->assertEquals($sampleData['user2Id'], $dto['activity'][$sampleData['a3']]['userRef']['id']);
        $this->assertEquals('user2', $dto['activity'][$sampleData['a3']]['userRef']['username']);
        $this->assertEquals('user2.png', $dto['activity'][$sampleData['a3']]['userRef']['avatar_ref']);
        $this->assertEquals('user2', $dto['activity'][$sampleData['a3']]['content']['user']);

        $this->assertEquals('add_user_to_project', $dto['activity'][$sampleData['a4']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a4']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a4']]['content']['project']);
        $this->assertEquals($sampleData['user3Id'], $dto['activity'][$sampleData['a4']]['userRef']['id']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a4']]['userRef']['username']);
        $this->assertEquals('user3.png', $dto['activity'][$sampleData['a4']]['userRef']['avatar_ref']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a4']]['content']['user']);

        $this->assertEquals('add_question', $dto['activity'][$sampleData['a5']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a5']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a5']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a5']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a5']]['content']['text']);
        $this->assertEquals($sampleData['questionId'], $dto['activity'][$sampleData['a5']]['questionRef']);
        $this->assertEquals($sampleData['question']->title, $dto['activity'][$sampleData['a5']]['content']['question']);

        $this->assertEquals('add_answer', $dto['activity'][$sampleData['a6']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a6']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a6']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a6']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a6']]['content']['text']);
        $this->assertEquals($sampleData['questionId'], $dto['activity'][$sampleData['a6']]['questionRef']);
        $this->assertEquals($sampleData['question']->title, $dto['activity'][$sampleData['a6']]['content']['question']);
        $this->assertEquals($sampleData['user3Id'], $dto['activity'][$sampleData['a6']]['userRef']['id']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a6']]['userRef']['username']);
        $this->assertEquals('user3.png', $dto['activity'][$sampleData['a6']]['userRef']['avatar_ref']);
        $this->assertEquals($sampleData['answer']->content, $dto['activity'][$sampleData['a6']]['content']['answer']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a6']]['content']['user']);

        $this->assertEquals('add_comment', $dto['activity'][$sampleData['a7']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a7']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a7']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a7']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a7']]['content']['text']);
        $this->assertEquals($sampleData['questionId'], $dto['activity'][$sampleData['a7']]['questionRef']);
        $this->assertEquals($sampleData['question']->title, $dto['activity'][$sampleData['a7']]['content']['question']);
        $this->assertEquals($sampleData['user1Id'], $dto['activity'][$sampleData['a7']]['userRef']['id']);
        $this->assertEquals('user1', $dto['activity'][$sampleData['a7']]['userRef']['username']);
        $this->assertEquals('user1.png', $dto['activity'][$sampleData['a7']]['userRef']['avatar_ref']);
        $this->assertEquals('user1', $dto['activity'][$sampleData['a7']]['content']['user']);
        $this->assertEquals($sampleData['user3Id'], $dto['activity'][$sampleData['a7']]['userRefRelated']['id']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a7']]['userRefRelated']['username']);
        $this->assertEquals('user3.png', $dto['activity'][$sampleData['a7']]['userRefRelated']['avatar_ref']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a7']]['content']['userRelated']);
        $this->assertEquals($sampleData['answer']->content, $dto['activity'][$sampleData['a7']]['content']['answer']);
        $this->assertEquals($sampleData['comment1']->content, $dto['activity'][$sampleData['a7']]['content']['comment']);

        $this->assertEquals('add_comment', $dto['activity'][$sampleData['a8']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a8']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a8']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a8']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a8']]['content']['text']);
        $this->assertEquals($sampleData['questionId'], $dto['activity'][$sampleData['a8']]['questionRef']);
        $this->assertEquals($sampleData['question']->title, $dto['activity'][$sampleData['a8']]['content']['question']);
        $this->assertEquals($sampleData['user2Id'], $dto['activity'][$sampleData['a8']]['userRef']['id']);
        $this->assertEquals('user2', $dto['activity'][$sampleData['a8']]['userRef']['username']);
        $this->assertEquals('user2.png', $dto['activity'][$sampleData['a8']]['userRef']['avatar_ref']);
        $this->assertEquals('user2', $dto['activity'][$sampleData['a8']]['content']['user']);
        $this->assertEquals($sampleData['user3Id'], $dto['activity'][$sampleData['a8']]['userRefRelated']['id']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a8']]['userRefRelated']['username']);
        $this->assertEquals('user3.png', $dto['activity'][$sampleData['a8']]['userRefRelated']['avatar_ref']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a8']]['content']['userRelated']);
        $this->assertEquals($sampleData['answer']->content, $dto['activity'][$sampleData['a8']]['content']['answer']);
        $this->assertEquals($sampleData['comment2']->content, $dto['activity'][$sampleData['a8']]['content']['comment']);

        $this->assertEquals('update_answer', $dto['activity'][$sampleData['a9']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a9']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a9']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a9']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a9']]['content']['text']);
        $this->assertEquals($sampleData['questionId'], $dto['activity'][$sampleData['a9']]['questionRef']);
        $this->assertEquals($sampleData['question']->title, $dto['activity'][$sampleData['a9']]['content']['question']);
        $this->assertEquals($sampleData['user3Id'], $dto['activity'][$sampleData['a9']]['userRef']['id']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a9']]['userRef']['username']);
        $this->assertEquals('user3.png', $dto['activity'][$sampleData['a9']]['userRef']['avatar_ref']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a9']]['content']['user']);
        $this->assertEquals($sampleData['answer_updated']->content, $dto['activity'][$sampleData['a9']]['content']['answer']);

        $this->assertEquals('update_comment', $dto['activity'][$sampleData['a10']]['action']);
        $this->assertEquals($expectedProjectRef, $dto['activity'][$sampleData['a10']]['projectRef']);
        $this->assertEquals($project->projectName, $dto['activity'][$sampleData['a10']]['content']['project']);
        $this->assertEquals($sampleData['textId'], $dto['activity'][$sampleData['a10']]['textRef']);
        $this->assertEquals($sampleData['text']->title, $dto['activity'][$sampleData['a10']]['content']['text']);
        $this->assertEquals($sampleData['questionId'], $dto['activity'][$sampleData['a10']]['questionRef']);
        $this->assertEquals($sampleData['question']->title, $dto['activity'][$sampleData['a10']]['content']['question']);
        $this->assertEquals($sampleData['user1Id'], $dto['activity'][$sampleData['a10']]['userRef']['id']);
        $this->assertEquals('user1', $dto['activity'][$sampleData['a10']]['userRef']['username']);
        $this->assertEquals('user1.png', $dto['activity'][$sampleData['a10']]['userRef']['avatar_ref']);
        $this->assertEquals('user1', $dto['activity'][$sampleData['a10']]['content']['user']);
        $this->assertEquals($sampleData['user3Id'], $dto['activity'][$sampleData['a10']]['userRefRelated']['id']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a10']]['userRefRelated']['username']);
        $this->assertEquals('user3.png', $dto['activity'][$sampleData['a10']]['userRefRelated']['avatar_ref']);
        $this->assertEquals('user3', $dto['activity'][$sampleData['a10']]['content']['userRelated']);
        $this->assertEquals($sampleData['answer_updated']->content, $dto['activity'][$sampleData['a10']]['content']['answer']);
        $this->assertEquals($sampleData['comment1_updated']->content, $dto['activity'][$sampleData['a10']]['content']['comment']);
    }

}
