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

    // The EntryContext and SenseContext are strings storing the value of the effective "word" (the entry context) and "meaning" (the sense context) at the time the comment was made

    /**
     * @var string
     */
    public $entryContext;

    /**
     * @var string
     */
    public $senseContext;

} 