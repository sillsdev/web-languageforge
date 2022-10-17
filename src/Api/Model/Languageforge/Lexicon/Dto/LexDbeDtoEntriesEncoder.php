<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Shared\Mapper\JsonEncoder;

class LexDbeDtoEntriesEncoder extends JsonEncoder
{
    protected function _encode($model)
    {
        $data = parent::_encode($model);

        switch (get_class($model)) {
            case "Api\Model\Languageforge\Lexicon\LexMultiParagraph":
                // convert multiparagraph model to HTML version
                $data = [];
                $data["type"] = LexConfig::MULTIPARAGRAPH;
                $data["inputSystem"] = $model->inputSystem;
                $data["paragraphsHtml"] = $model->toHTML();
                break;
        }

        return $data;
    }

    public static function encode($model)
    {
        $e = new LexDbeDtoEntriesEncoder();
        return $e->_encode($model);
    }
}
