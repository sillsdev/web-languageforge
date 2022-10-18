<?php

namespace Api\Model\Languageforge\Lexicon;

class LexValue
{
    public function __construct($value = "")
    {
        $this->value($value);
    }

    /** @var string */
    public $value;

    /**
     * Ensures that the value $value is set
     * This method is primarily to give an api consistent with LexMultiValue
     * @param string $value
     */
    public function value($value)
    {
        $this->value = \Normalizer::normalize($value);
    }

    public function __toString()
    {
        return $this->value;
    }
}
