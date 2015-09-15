<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\IdReference;
use Api\Model\Mapper\ObjectForEncoding;

/**
 * This class contains author information for the lex entry element and it sub-elements
 */
class AuthorInfo extends ObjectForEncoding
{
    public function __construct()
    {
        $this->createdByUserRef = new IdReference();
        $this->createdDate = new \DateTime();
        $this->modifiedByUserRef = new IdReference();
        $this->modifiedDate = new \DateTime();

        $this->setReadOnlyProp('createdByUserRef');
        $this->setReadOnlyProp('createdDate');
        $this->setReadOnlyProp('modifiedByUserRef');
        $this->setReadOnlyProp('modifiedDate');
    }

    /**
     * user's Id as string
     * @var IdReference
     */
    public $createdByUserRef;

    /**
     *    datetime
     * @var DateTime
     */
    public $createdDate;

    /**
     * user's Id as string
     * @var IdReference
     */
    public $modifiedByUserRef;

    /**
     * datetime
     * @var DateTime
     */
    public $modifiedDate;

}
