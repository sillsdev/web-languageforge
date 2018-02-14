<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\MapOf;

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
            $this[$inputSystem]->value($value);
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

    public function differences(LexMultiText $otherMultiText)
    {
        $result = [];
        $thisArr  = $this->getArrayCopy();
        $otherArr = $otherMultiText->getArrayCopy();
        $thisKeys  = array_keys($thisArr);
        $otherKeys = array_keys($otherArr);
        $allKeys = array_unique(array_merge($thisKeys, $otherKeys));
        foreach ($allKeys as $key)
        {
            $thisValue  = isset($this[$key]) ? (string)$this[$key] : "";
            $otherValue = isset($otherMultiText[$key]) ? (string)$otherMultiText[$key] : "";
            if ($thisValue == $otherValue) continue;
            $result[] = [
                "inputSystem" => $key,
                "this" => $thisValue,
                "other" => $otherValue
            ];
        }
        return $result;
    }
}
