<?php

use Api\Library\Scriptureforge\Sfchecks\SfchecksReports;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\CommentModel;
use PHPUnit\Framework\TestCase;

class SfchecksReportsTest extends TestCase
{
    public function testUserEngagementReport_simpleProjectWithQuestionsAndAnswers_AsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = $environ->createUser("user1", "user1", "user1@email.com");
        $user2Id = $environ->createUser("user2", "user2", "user2@email.com");
        $user3Id = $environ->createUser("user3", "user3", "user3@email.com");

        ProjectCommands::updateUserRole($project->id->asString(), $user1Id);
        ProjectCommands::updateUserRole($project->id->asString(), $user2Id);
        ProjectCommands::updateUserRole($project->id->asString(), $user3Id);

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        $answer->textHightlight = "text highlight";
        $answerId = $question->writeAnswer($answer);

        // Followed by comments
        $comment1 = new CommentModel();
        $comment1->content = "first comment";
        $comment1->userRef->id = $user1Id;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);

        $comment2 = new CommentModel();
        $comment2->content = "second comment";
        $comment2->userRef->id = $user2Id;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);

        $data = SfchecksReports::UserEngagementReport($project->id->asString());
        $this->assertNotEmpty($data['output']);
    }
}
