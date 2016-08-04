<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ObjectForEncoding;

class LexCommentReply extends ObjectForEncoding
{
    public function __construct($content = '')
    {
        $this->content = $content;
        $this->id = uniqid();
        $this->authorInfo = new LexAuthorInfo();
    }

    /**
     * @var LexAuthorInfo
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
