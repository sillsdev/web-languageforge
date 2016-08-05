<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Mapper\JsonDecoder;

class LexEntryDecoder extends JsonDecoder
{
    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object $model
     * @param array $values A mixed array of JSON (like) data.
     * @param string $id
     */
    public static function decode($model, $values, $id = '')
    {
        $decoder = new LexEntryDecoder();
        $decoder->_decode($model, $values, $id);
    }

    protected function _decode($model, $values, $id)
    {
        switch (get_class($model)) {
            case 'Api\Model\Languageforge\Lexicon\LexMultiParagraph':
                /** @var LexMultiParagraph $model */
                $model->fromHtml($values['paragraphsHtml']);
                break;
            default:
                parent::_decode($model, $values, $id);
        }
    }
}
