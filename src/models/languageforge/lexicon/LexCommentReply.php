<?php

namespace models\languageforge\lexicon;

use models\mapper\ObjectForEncoding;

class LexCommentReply extends ObjectForEncoding
{
    public function __construct($content = '')
    {
        $this->content = $content;
        $this->id = uniqid();
        $this->authorInfo = new AuthorInfo();
    }

    /**
     * @var AuthorInfo
     */
    public $authorInfo;

    /**
     *
     * @var string
     */
    public $content;

    /**
     *
     * @var string
     */
    public $id;
}
