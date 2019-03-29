<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Mapper\MapOf;

class AnswerModel extends CommentModel
{
    public function __construct()
    {
        parent::__construct();
        $this->comments = new MapOf(function()
        {
            return new CommentModel();
        });
        $this->score = 0;
        $this->tags = new ArrayOf();
        $this->isToBeExported = false;
    }

    public function fixDecode()
    {
        if ($this->score == null) {
            $this->score = 0;
        }
    }

    /** @var MapOf<CommentModel> */
    public $comments;

    /** @var string */
    public $textHighlight;

    /** @var int */
    public $score;

    /** @var ArrayOf<string> */
    public $tags;

    /** @var Boolean Flag to be exported for Paratext Export */
    public $isToBeExported;
}
