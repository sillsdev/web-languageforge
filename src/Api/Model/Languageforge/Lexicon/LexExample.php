<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

class LexExample extends ObjectForEncoding
{
    use LazyPropertiesTrait;

    public function __construct($liftId = '', $guid = '')
    {
        $this->setPrivateProp('liftId');
        $this->setReadOnlyProp('guid');
        $this->setReadOnlyProp('translationGuid');
        $this->setReadOnlyProp('authorInfo');
        if ($liftId) $this->liftId = $liftId;
        $this->guid = Guid::makeValid($guid);

        $this->initLazyProperties([
            'authorInfo',
            'sentence',
            'translation',
            'translationGuid',
            'reference',
            'customFields',
        ], false);
    }

    protected function createProperty($name) {
        switch ($name) {
            case 'authorInfo':
                return new LexAuthorInfo();
            case 'sentence':
            case 'translation':
            case 'reference':
                return new LexMultiText();
            case 'translationGuid':
                return Guid::create();
            case 'customFields':
                return new MapOf('Api\Model\Languageforge\Lexicon\generateCustomField');
            default:
                return '';
        }
    }

    /**
     * The id of the example as specified in the LIFT file
     * @var string
     */
    public $liftId;

    /** @var LexMultiText */
    public $sentence;

    /** @var LexMultiText */
    public $translation;

    /** @var string */
    public $translationGuid;

    /** @var MapOf<LexMultiText|LexMultiParagraph|LexValue|LexMultiValue> */
    public $customFields;

    /** @var LexAuthorInfo */
    public $authorInfo;

    /** @var string */
    public $guid;

    // less common fields used in FLEx

    /** @var LexMultiText */
    public $reference;

}
