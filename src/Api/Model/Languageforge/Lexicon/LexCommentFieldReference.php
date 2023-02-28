<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\ObjectForEncoding;

class LexCommentFieldReference extends ObjectForEncoding
{
    /** @var string */
    public $field;

    /** @var string */
    public $fieldNameForDisplay;

    /** @var string */
    public $fieldValue;

    /** @var string */
    public $inputSystem;

    /** @var string */
    public $inputSystemAbbreviation;

    /** @var string */
    public $word;

    /** @var string */
    public $meaning;
}
