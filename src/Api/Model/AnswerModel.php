<?php
namespace Api\Model;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\MapOf;

class AnswerModel extends CommentModel
{

    public function __construct()
    {
        parent::__construct();
        $this->comments = new MapOf(function ($data)
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

    /**
     *
     * @var MapOf<CommentModel>
     */
    public $comments;

    public $textHighlight;

    /**
     *
     * @var int
     */
    public $score;

    /**
     *
     * @var ArrayOf<string>
     */
    public $tags;

    /**
     * Flag to be exported for ParaTExt Export
     * 
     * @var Boolean
     */
    public $isToBeExported;
}
