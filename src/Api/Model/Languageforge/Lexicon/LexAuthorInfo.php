<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\ObjectForEncoding;
use Litipk\Jiffy\UniversalTimestamp;

/**
 * This class contains author information for the lex entry element and it sub-elements
 */
class LexAuthorInfo extends ObjectForEncoding
{
    public function __construct()
    {
        $this->createdByUserRef = new IdReference();
        $this->modifiedByUserRef = new IdReference();
        $now = UniversalTimestamp::now();
        $this->createdDate = $now;
        $this->modifiedDate = $now;

        $this->setReadOnlyProp("createdByUserRef");
        $this->setReadOnlyProp("modifiedByUserRef");
        $this->setReadOnlyProp("createdDate");
        $this->setReadOnlyProp("modifiedDate");
    }

    /** @var IdReference user's Id as string */
    public $createdByUserRef;

    /** @var UniversalTimestamp */
    public $createdDate;

    /** @var IdReference user's Id as string */
    public $modifiedByUserRef;

    /** @var UniversalTimestamp */
    public $modifiedDate;
}
