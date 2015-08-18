<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\MapOf;

function _createLexiconField($data)
{
    return new LexiconField();
}

class MultiText extends MapOf
{
    public function __construct()
    {
        parent::__construct('\Api\Model\Languageforge\Lexicon\_createLexiconField');
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
     *
     * @param string $inputSystem
     * @return boolean
     */
    public function hasForm($inputSystem)
    {
        return array_key_exists($inputSystem, $this);
    }

}
