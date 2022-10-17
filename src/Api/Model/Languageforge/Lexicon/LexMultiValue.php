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

    public static function createFromArray($values)
    {
        $field = new LexMultiValue();
        $field->values = new ArrayOf();
        $field->values->exchangeArray($values);
        return $field;
    }

    /**
     * Ensures that the normalized (NFC) value $value is set
     * @param string $value
     */
    public function value($value)
    {
        $value = \Normalizer::normalize($value);
        if ($this->values->array_search($value) === false) {
            $this->values[] = $value;
        }
    }

    public function differences(LexMultiValue $otherMultiValue)
    {
        // Shows differences between the arrays as whole values. Use individualDifferences function to see individual additions or removals.
        if ($this->values == $otherMultiValue->values) {
            // Shortcut so we don't have to copy arrays just to find out they were already equal
            return [];
        }
        $thisArr = $this->values->getArrayCopy();
        $otherArr = $otherMultiValue->values->getArrayCopy();
        $thisJson = json_encode($thisArr);
        $otherJson = json_encode($otherArr);
        return ["this" => $thisJson, "other" => $otherJson];
    }

    /* If individual differences between arrays (insertions and deletions) are desired, we could do it like this:
    public function individualDifferences(LexMultiValue $otherMultiValue)
    {
        $result = [];
        $thisArr  = $this->values->getArrayCopy();
        $otherArr = $otherMultiValue->values->getArrayCopy();
        $oursOnly = array_diff($thisArr, $otherArr);
        $theirsOnly = array_diff($otherArr, $thisArr);
        foreach ($oursOnly as $item)
        {
            $value = isset($item) ? (string)$item : "";
            $result[] = [
                "value" => $value,
                "this" => $value,
                "other" => ""
            ];
        }
        foreach ($theirsOnly as $item)
        {
            $value = isset($item) ? (string)$item : "";
            $result[] = [
                "value" => $value,
                "this" => "",
                "other" => $value
            ];
        }
        return $result;
    }
*/
}
