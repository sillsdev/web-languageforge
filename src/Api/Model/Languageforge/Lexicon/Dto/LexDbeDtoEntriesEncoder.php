<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\LexiconMultiParagraphHelper;
use Api\Model\Mapper\JsonEncoder;

class LexDbeDtoEntriesEncoder extends JsonEncoder
{

    protected function _encode($model)
    {
        $data = parent::_encode($model);
        $dataToReturn = $data;

        switch (get_class($model)) {
            case 'Api\Model\Languageforge\Lexicon\LexMultiParagraph':
                
                // convert multiparagraph model to HTML version
                $dataToReturn = array();
                $dataToReturn['inputSystem'] = $model->inputSystem;
                $dataToReturn['value'] = $model->toHTML();
                break;
        }

        return $dataToReturn;
    }

    public static function encode($model)
    {
        $e = new LexDbeDtoEntriesEncoder();
        return $e->_encode($model);
    }
}
