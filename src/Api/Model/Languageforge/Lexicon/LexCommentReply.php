<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\ObjectForEncoding;

class LexCommentReply extends ObjectForEncoding
{
    public function __construct($content = "")
    {
        $this->content = $content;
        $this->id = uniqid();
        $this->authorInfo = new LexAuthorInfo();
        $this->isDeleted = false;
    }

    /** @var LexAuthorInfo */
    public $authorInfo;

    /** @var string */
    public $content;

    /** @var string */
    public $id;

    /** @var string */
    public $guid;

    /** @var boolean */
    public $isDeleted;
}
