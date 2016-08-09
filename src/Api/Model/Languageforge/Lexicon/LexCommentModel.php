<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;
use Api\Model\Mapper\IdReference;
use Api\Model\Mapper\MapperModel;
use Api\Model\Mapper\MongoMapper;
use Api\Model\ProjectModel;

class LexCommentModel extends MapperModel
{
    // Comment statuses
    const STATUS_OPEN = 'open';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_TODO = 'todo';

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'lexiconComments');
        }

        return $instance;
    }

    /**
     * @param ProjectModel|LexProjectModel $projectModel
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
            function () {
                return new LexCommentReply();
            }
        );
        $this->status = self::STATUS_OPEN;
        $this->score = 0;
        $this->authorInfo = new LexAuthorInfo();
        $this->regarding = new LexCommentFieldReference();
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    public static function remove($projectModel, $commentId)
    {
        // old method self:mapper($projectModel->databaseName())->remove($commentId);
        $comment = new self($projectModel, $commentId);
        $comment->isDeleted = true;
        return $comment->write();
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
     * @var ArrayOf <LexCommentReply>
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
     * @var LexAuthorInfo
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

        return false;
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
