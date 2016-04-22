<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\LexiconMultiParagraphHelper;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\UserModel;

class LexDbeDtoEntriesEncoder extends JsonEncoder
{

    protected function _encode($model)
    {
        $data = parent::_encode($model);
        $dataToReturn = $data;

        switch (get_class($model)) {
            case 'Api\Model\Languageforge\Lexicon\LexiconMultiParagraph':
                
                // convert multiparagraph model to HTML version
                $dataToReturn = $this->_encodeLexiconMultiParagraph($model);
                break;
        }

        return $dataToReturn;
    }

    public static function encode($model)
    {
        $e = new LexDbeDtoEntriesEncoder();
        return $e->_encode($model);
    }

    private function _encodeLexiconMultiParagraph($model) {
        $data = array();
        $data['inputSystem'] = $model->inputSystem;
        $data['value'] = LexiconMultiParagraphHelper::toHTML($model);
        return $data;
    }
}
