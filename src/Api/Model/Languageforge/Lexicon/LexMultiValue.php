<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;

class LexMultiValue
{

    public static function createFromArray($values) {
        $field = new LexMultiValue();
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
