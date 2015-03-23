<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;
use models\mapper\Id;
use models\mapper\IdReference;

class LexCommentModel extends \models\mapper\MapperModel
{
    // Comment statuses
    const STATUS_OPEN = 'open';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_TODO = 'todo';

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'lexiconComments');
        }

        return $instance;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string       $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->setReadOnlyProp('authorInfo');
        $this->setReadOnlyProp('replies');
        $this->setReadOnlyProp('score');
        $this->setReadOnlyProp('status');
        $this->setPrivateProp('isDeleted');

        $this->id = new Id();
        $this->entryRef = new IdReference();
        $this->isDeleted = false;
        $this->replies = new ArrayOf(
            function ($data) {
                return new LexCommentReply();
            }
        );
        $this->status = self::STATUS_OPEN;
        $this->score = 0;
        $this->authorInfo = new AuthorInfo();
        $this->regarding = new LexCommentFieldReference();
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    public static function remove($projectModel, $commentId)
    {
        // old method self:mapper($projectModel->databaseName())->remove($commentId);
        $comment = new self($projectModel, $commentId);
        $comment->isDeleted = true;
        $comment->write();
    }

    /**
     * @var Id
     */
    public $id;

    /**
     * @var IdReference
     */
    public $entryRef;

    /**
     *
     * @var LexCommentFieldReference
     */
    public $regarding;

    /**
     *
     * @var int
     */
    public $score;

    /**
     *
     * @var ArrayOf<LexCommentReply>
     */
    public $replies;

    /**
     *
     * @var string - see status constants above
     */
    public $status;

    /**
     * @var bool
     */
    public $isDeleted;

    /**
     * @var AuthorInfo
     */
    public $authorInfo;

    /**
     * @var string
     */
    public $content;

    /**
     *
     * @param string $id
     * @return LexCommentReply
     */
    public function getReply($id)
    {
        foreach ($this->replies as $reply) {
            if ($reply->id == $id) {
                return $reply;
            }
        }
    }

    public function setReply($id, $model)
    {
        foreach ($this->replies as $key => $reply) {
            if ($reply->id == $id) {
                $this->replies[$key] = $model;
                break;
            }
        }
    }

    public function deleteReply($id)
    {
        $keyToDelete = null;
        foreach ($this->replies as $key => $reply) {
            if ($reply->id == $id) {
                $keyToDelete = $key;
                break;
            }
        }
        if (!is_null($keyToDelete)) {
            unset($this->replies[$keyToDelete]);
        }
    }
}
