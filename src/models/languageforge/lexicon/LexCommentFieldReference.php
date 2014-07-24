<?php

namespace models\languageforge\lexicon;


use models\mapper\ObjectForEncoding;

class LexCommentFieldReference extends ObjectForEncoding {

    /**
     * @var string
     */
    public $fieldName;

    /**
     * @var string
     */
    public $content;

    /**
     * @var string
     */
    public $inputSystem;

} 