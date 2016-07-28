<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\MapOf;

function generateLexiconField()
{
    return new LexiconField();
}

class MultiText extends MapOf
{
    public function __construct()
    {
        parent::__construct('Api\Model\Languageforge\Lexicon\generateLexiconField');
    }

    public function form($inputSystem, $value)
    {
        if (array_key_exists($inputSystem, $this)) {
            $this[$inputSystem]->value = $value;
        } else {
            $this[$inputSystem] = new LexiconField($value);
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
