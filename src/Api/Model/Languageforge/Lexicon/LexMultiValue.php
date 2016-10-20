<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\ArrayOf;

class LexMultiValue
{
    public function __construct()
    {
        $this->values = new ArrayOf();
    }

    /** @var ArrayOf */
    public $values;

    public static function createFromArray($values) {
        $field = new LexMultiValue();
        $field->values = new ArrayOf();
        $field->values->exchangeArray($values);
        return $field;
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
