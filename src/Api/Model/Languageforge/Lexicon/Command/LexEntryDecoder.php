<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Shared\Mapper\JsonDecoder;

class LexEntryDecoder extends JsonDecoder
{
    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object $model
     * @param array $values A mixed array of JSON (like) data.
     * @param string $id
     */
    public static function decode($model, array $values, $id = "")
    {
        $decoder = new LexEntryDecoder();
        $decoder->_decode($model, $values, $id);
    }

    protected function _decode($model, array $values, string $id)
    {
        switch (get_class($model)) {
            case "Api\Model\Languageforge\Lexicon\LexMultiParagraph":
                $html = "";
                if (array_key_exists("paragraphsHtml", $values)) {
                    $html = $values["paragraphsHtml"];
                }
                /** @var LexMultiParagraph $model */
                $model->fromHtml($html);
                break;
            default:
                parent::_decode($model, $values, $id);
        }
    }
}
