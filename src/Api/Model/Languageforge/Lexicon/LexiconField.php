<?php

namespace Api\Model\Languageforge\Lexicon;

class LexiconField
{
    public function __construct($value = '')
    {
        $this->value = $value;
    }

    /**
     * @var string
     */
    public $value;

    /**
     * Ensures that the value $value is set
     * This method is primarily to give an api consistent with LexiconMultiValueField
     * @param string $value
     */
    public function value($value)
    {
        $this->value = $value;
    }

    public function __toString() {
        return $this->value;
    }

}
