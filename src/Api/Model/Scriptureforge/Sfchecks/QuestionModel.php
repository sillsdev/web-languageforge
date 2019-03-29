<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use Litipk\Jiffy\UniversalTimestamp;

class QuestionModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->workflowState = "open"; // default workflow state
        $this->description = '';
        $this->dateEdited = UniversalTimestamp::now();
        $this->title = '';
        $this->textRef = new IdReference();
        $this->answers = new MapOf(
            function () {
                return new AnswerModel();
            }
        );

        $databaseName = $projectModel->databaseName();
        parent::__construct(QuestionModelMongoMapper::connect($databaseName), $id);
    }

    /** @var Id */
    public $id;

    /** @var string */
    public $title;

    /** @var string A content description/explanation of the question being asked */
    public $description;

    /** @var UniversalTimestamp */
    public $dateEdited;

    /** @var IdReference - Id of the referring text */
    public $textRef;

    /** @var MapOf<AnswerModel> */
    public $answers;

    /** @var string */
    public $workflowState;

    /** @var Boolean */
    public $isArchived;

    // TODO Override read to sort answers and comments by date/time. CP 2013-08

    /**
     * Removes this question from the collection
     * @param string $databaseName
     * @param string $id
     */
    public static function remove($databaseName, $id)
    {
        $mapper = QuestionModelMongoMapper::connect($databaseName);
        $mapper->remove($id);
    }

    /**
     * Adds / updates an answer to the given question.
     * @param AnswerModel $answer
     * @return string $id
     */
    public function writeAnswer($answer)
    {
        $id = $answer->id->asString();
        if (empty($id)) {
            $id = $answer->id->id = QuestionModelMongoMapper::makeId();
            $answerToWrite = $answer;
        } else {
            $answerToWrite = $this->answers[$id];
            $properties = get_object_vars($answer);
            $exclude = array('comments');
            foreach ($properties as $key => $value) {
                if (!in_array($key, $exclude)) {
                    $answerToWrite->$key = $value;
                }
            }
        }
        $this->_mapper->write(
            $answerToWrite,
            $id,
            [],
            [],
            MongoMapper::ID_IN_KEY,
            $this->id->asString(),
            'answers'
        );
        return $id;
    }

    /**
     * Reads an answer model for a question
     * @param string $answerId
     * @return AnswerModel
     */
    public function readAnswer($answerId)
    {
        return $this->answers[$answerId];
    }

    /**
     * @param string $answerId
     * @param string $commentId
     * @return CommentModel
     */
    public function readComment($answerId, $commentId)
    {
        $answer = $this->answers[$answerId];
        return $answer->comments[$commentId];
    }

    /**
     * Removes an answer from the given question.
     * @param string $databaseName
     * @param string $questionId
     * @param string $answerId
     * @return int modified count
     */
    public static function removeAnswer($databaseName, $questionId, $answerId)
    {
        $mapper = QuestionModelMongoMapper::connect($databaseName);
        // TODO Review, what should we return CP 2013-08

        return $mapper->removeSubDocument($questionId, 'answers', $answerId);
    }

    /**
     * Adds / updates a comment on an answer to the given question.
     * @param string $databaseName
     * @param string $questionId
     * @param string $answerId
     * @param CommentModel $comment
     * @return string $id
     */
    public static function writeComment($databaseName, $questionId, $answerId, $comment)
    {
        $id = $comment->id->asString();
        if (empty($id)) {
            $id = $comment->id->id = QuestionModelMongoMapper::makeId();
        }
        $mapper = QuestionModelMongoMapper::connect($databaseName);
        $mapper->write(
            $comment,
            $id,
            [],
            [],
            MongoMapper::ID_IN_KEY,
            $questionId,
            "answers.$answerId.comments"
        );
        return $id;
    }

    /**
     * Removes an answer from the given question.
     * @param string $databaseName
     * @param string $questionId
     * @param string $answerId
     * @param string $commentId
     * @return int
     */
    public static function removeComment($databaseName, $questionId, $answerId, $commentId)
    {
        $mapper = QuestionModelMongoMapper::connect($databaseName);
        // TODO Review, what should we return CP 2013-08

        return $mapper->removeSubDocument($questionId, "answers.$answerId.comments", $commentId);
    }

    /**
     * @return string - the title for display
     */
    public function getTitleForDisplay()
    {
        $title = $this->title;
        if ($title == "") {
            $desc = $this->description;
            if (strlen($desc) > 30) {
                $spacepos = strpos($desc, " ", 30);
                if ($spacepos !== false) {
                    $title = substr($desc, 0, $spacepos) . '...';
                } else {
                    $title = substr($desc, 0, 30);
                }
            } else {
                $title = $desc;
            }
        }
        return $title;
    }
}
