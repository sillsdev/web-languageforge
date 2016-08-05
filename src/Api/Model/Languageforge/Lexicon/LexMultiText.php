<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\MapOf;

function generateLexValue()
{
    return new LexValue();
}

class LexMultiText extends MapOf
{
    public function __construct()
    {
        parent::__construct('Api\Model\Languageforge\Lexicon\generateLexValue');
    }

    public function form($inputSystem, $value)
    {
        if (array_key_exists($inputSystem, $this)) {
            $this[$inputSystem]->value = $value;
        } else {
            $this[$inputSystem] = new LexValue($value);
        }
    }

    /**
     * @param string $inputSystem
     * @return boolean
     */
    public function hasForm($inputSystem)
    {
        return array_key_exists($inputSystem, $this);
    }
}
