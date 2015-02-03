<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;

function _createLexiconField($data)
{
    return new LexiconField();
}

class MultiText extends MapOf
{
    public function __construct()
    {
        parent::__construct('\models\languageforge\lexicon\_createLexiconField');
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
