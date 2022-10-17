<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;

class LexConfigFieldList extends LexConfig
{
    public function __construct()
    {
        parent::__construct();
        $this->type = self::FIELDLIST;
        $this->fieldOrder = new ArrayOf();
        $this->fields = new MapOf(function ($data) {
            switch ($data["type"]) {
                case self::FIELDLIST:
                    return new LexConfigFieldList();
                case self::MULTITEXT:
                    return new LexConfigMultiText();
                case self::MULTIPARAGRAPH:
                    return new LexConfigMultiParagraph();
                case self::OPTIONLIST:
                    return new LexConfigOptionList();
                case self::MULTIOPTIONLIST:
                    return new LexConfigMultiOptionList();
                case self::PICTURES:
                    return new LexConfigPictures();
                default:
                    $type = $data["type"];
                    throw new \Exception("Unknown field list config type: $type");
            }
        });
    }

    /** @var ArrayOf<string> fieldName */
    public $fieldOrder;

    /** @var MapOf<LexConfig> */
    public $fields;
}
