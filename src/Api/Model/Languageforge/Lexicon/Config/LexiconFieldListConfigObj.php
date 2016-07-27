<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\MapOf;

class LexiconFieldListConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = self::FIELDLIST;
        $this->fieldOrder = new ArrayOf();
        $this->fields = new MapOf(
            function ($data) {
                switch ($data['type']) {
                    case self::FIELDLIST:
                        return new LexiconFieldListConfigObj();
                    case self::MULTITEXT:
                        return new LexiconMultitextConfigObj();
                    case self::MULTIPARAGRAPH:
                        return new LexMultiParagraphConfigObj();
                    case self::OPTIONLIST:
                        return new LexiconOptionlistConfigObj();
                    case self::MULTIOPTIONLIST:
                        return new LexiconMultiOptionlistConfigObj();
                    case self::PICTURES:
                        return new LexPicturesConfigObj();
                    default:
                        $type = $data['type'];
                        throw new \Exception("Unknown field list config type: $type");
                }
            }
        );
    }

    /** @var ArrayOf<string> fieldName */
    public $fieldOrder;

    /** @var MapOf<LexiconConfigObj> */
    public $fields;

}
