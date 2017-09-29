<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;

class CommonQuestionsAndAnswersForDto
{
    /**
     * @param MongoTestEnvironment $environ
     * @return array
     */

    public static function createProjectForTestingAnswerVisibility($environ): array
    {
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $sfchecksProject = new SfchecksProjectModel($projectId);
        $sfchecksProject->usersSeeEachOthersResponses = true;
        $sfchecksProject->write();

        // Two texts, with different numbers of questions for each text and different create dates
        $text1 = new TextModel($project);
        $text1->title = 'Chapter 3';
        $text1->content = 'I opened my eyes upon a strange and weird landscape. I knew that I was on Mars; …';
        $text1->write();
        $text1->dateCreated->addSeconds(-date_interval_create_from_date_string('1 day')->s);
        $text1Id = $text1->write();

        $text2 = new TextModel($project);
        $text2->title = 'Chapter 4';
        $text2->content = 'We had gone perhaps ten miles when the ground began to rise very rapidly. …';
        $text2Id = $text2->write();

        // Answers are tied to specific users, so let's create some sample users
        $user1Id = $environ->createUser('jcarter', 'John Carter', 'johncarter@example.com');
        $user2Id = $environ->createUser('dthoris', 'Dejah Thoris', 'princess@example.com');
        $user3Id = $environ->createUser('ttarkas', 'Tars Tarkas', 'princess@example.com');

        // Tars Tarkas is the project manager, the other two are contributors
        $project->addUser($user1Id, ProjectRoles::CONTRIBUTOR);
        $project->addUser($user2Id, ProjectRoles::CONTRIBUTOR);
        $project->addUser($user3Id, ProjectRoles::MANAGER);
        $project->write();
        $user1 = new UserModel($user1Id);
        $user2 = new UserModel($user2Id);
        $user3 = new UserModel($user3Id);
        $user1->addProject($projectId);
        $user2->addProject($projectId);
        $user3->addProject($projectId);
        $user1->write();
        $user2->write();
        $user3->write();

        // Two questions for text 1...
        $question1 = new QuestionModel($project);
        $question1->title = 'Who is speaking?';
        $question1->description = 'Who is telling the story in this text?';
        $question1->textRef->id = $text1Id;
        $question1Id =$question1->write();

        $question2 = new QuestionModel($project);
        $question2->title = 'Where is the storyteller?';
        $question2->description = 'The person telling this story has just arrived somewhere. Where is he?';
        $question2->textRef->id = $text1Id;
        $question2Id = $question2->write();

        // ... and one question for text 2.
        $question3 = new QuestionModel($project);
        $question3->title = 'How far had they travelled?';
        $question3->description = 'How far had the group just travelled when this text begins?';
        $question3->textRef->id = $text2Id;
        $question3->write();

        // One answer for question 1...
        $answer1 = new AnswerModel();
        $answer1->content = 'Me, John Carter.';
        $answer1->score = 10;
        $answer1->userRef->id = $user1Id;
        $answer1->textHighlight = 'I knew that I was on Mars';
        $answer1Id = $question1->writeAnswer($answer1);

        // ... and two answers for question 2...
        $answer2 = new AnswerModel();
        $answer2->content = 'On Mars.';
        $answer2->score = 1;
        $answer2->userRef->id = $user1Id;
        $answer2->textHighlight = 'I knew that I was on Mars';
        $answer2Id = $question2->writeAnswer($answer2);

        // ... with 1 comment on the first answer ...
        $comment0 = new CommentModel();
        $comment0->content = 'By the way, the inhabitants of Mars call it Barsoom.';
        $comment0->userRef->id = $user1Id;
        $comment0Id = QuestionModel::writeComment($project->databaseName(), $question2Id, $answer2Id, $comment0);

        $answer3 = new AnswerModel();
        $answer3->content = 'On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.';
        $answer3->score = 7;
        $answer3->userRef->id = $user2Id;
        $answer3->textHighlight = 'I knew that I was on Mars';
        $answer3Id = $question2->writeAnswer($answer3);

        // ... and 2 comments on the second answer.
        $comment1 = new CommentModel();
        $comment1->content = 'By the way, our name for Earth is Jasoom.';
        $comment1->userRef->id = $user2Id;
        $comment1Id = QuestionModel::writeComment($project->databaseName(), $question2Id, $answer3Id, $comment1);
        $comment2 = new CommentModel();
        $comment2->content = 'Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.';
        $comment2->userRef->id = $user1Id;
        $comment2Id = QuestionModel::writeComment($project->databaseName(), $question2Id, $answer3Id, $comment2);

        return [$projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id];
    }
}
