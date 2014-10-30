<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class LexiconMultiValueField
{

    public static function createFromArray($values) {
        $field = new LexiconMultiValueField();
        $field->values = new ArrayOf();
        $field->values->exchangeArray($values);
        return $field;
    }

    /**
     *
     * @var ArrayOf
     */
    public $values;

    public function __construct()
    {
        $this->values = new ArrayOf();
    }

    /**
     * Ensures that the value $value is set
     * @param string $value
     */
    public function value($value)
    {
        if ($this->values->array_search($value) === FALSE) {
            $this->values[] = $value;
        }
    }
}
