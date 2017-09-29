<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\ObjectForEncoding;

class LexCommentFieldReference extends ObjectForEncoding
{
    /** @var string - the field name e.g. "lexeme" */
    public $field;

    /** @var string - the field name for display e.g. "Word" */
    public $fieldNameForDisplay;

    /** @var string */
    public $fieldValue;

    /** @var string */
    public $inputSystem;

    /** @var string */
    public $inputSystemAbbreviation;

    // The EntryContext and SenseContext are strings storing the value of the effective "word" (the entry context) and "meaning" (the sense context) at the time the comment was made

    /** @var string - the "Word" value of the entry at comment time */
    public $word;

    /** @var string - the "Meaning" value of the entry at comment time */
    public $meaning;
}
