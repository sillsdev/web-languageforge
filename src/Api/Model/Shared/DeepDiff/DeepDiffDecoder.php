<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class DeepDiffDecoder
{
    public static function prepareDeepDiff($diffs) {
        $result = [];
        foreach (static::reorderPushes($diffs) as $diff) {
            $diffInstance = DiffBase::fromDeepDiff($diff);
            if ($diffInstance) $result[] = $diffInstance;
        }
        return $result;
    }

    public static function reorderPushes($diffs) {
        $currentPath = [];
        $pushes = [];
        $result = [];
        foreach ($diffs as $diff) {
            if ($diff['kind'] == 'A' && $diff['item']['kind'] == 'N' &&
                ($currentPath == [] || $currentPath == $diff['path'])) {
                    $currentPath = $diff['path'];
                    $pushes[] = $diff;
            } else {
                if ($pushes) {
                    foreach (array_reverse($pushes) as $push) {
                        $result[] = $push;
                    }
                    $pushes = [];
                    $currentPath = [];
                }
                $result[] = $diff;
            }
        }
        if ($pushes) {
            foreach (array_reverse($pushes) as $push) {
                $result[] = $push;
            }
        }
        return $result;
    }

    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object|MapOf|ArrayOf $model
     * @param array $deepDiff An array of diffs from the Javascript deep-diff library.
     * @throws \Exception
     */
    public static function applyDeepDiff($model, $deepDiff)
    {
        CodeGuard::checkTypeAndThrow($deepDiff, 'array');
        // TODO: Do we need something like this next line from JsonDecoder, or something similar to it?
        // $propertiesToIgnore = $this->getPrivateAndReadOnlyProperties($model);
        $diffs = static::prepareDeepDiff($deepDiff);
        foreach ($diffs as $diff) {
            static::applySingleDiff($model, $diff);
        }
    }

    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object|MapOf|ArrayOf $model
     * @param DiffBase $diff A single diff to apply to the model
     * @throws \Exception
     */
    public static function applySingleDiff($model, $diff)
    {
        $path = $diff->path;
        $allButLast = $path; // This is a copy
        $last = array_pop($allButLast);
        $target = $model;
        $value = $diff->getValue();
        $customFieldsIdx = array_search('customFields', $allButLast);
        $customFieldData = [];
        if ($customFieldsIdx !== false && $customFieldsIdx+2 <= count($path)) {
            // Custom fields need special handling
            $allButLast = array_slice($path, 0, $customFieldsIdx+2);
            $customFieldName = $path[$customFieldsIdx+1];
            $rest = array_slice($path, $customFieldsIdx+2);
            foreach (\array_reverse($rest) as $step) {
                $customFieldData = [$step => $customFieldData];
            }
        }
        // Custom fields need to call MapOf->generate() with a specific shape in order to work:
        // For LexValue fields (list fields with a single value): ['value' => (anything)]
        // For LexMultiValue fields (list fields where you can choose multiple values): ['values' => (anything)]
        // For LexMultiParagraph fields: ['paragraphs' => (anything)] *or* ['type' => 'multiparagraph']
        // For LexMultiText fields: ['en' => ['value' => (anything)]], where any writing system can be in place of 'en' here

        // The tricky part is distinguishing LexMultiText fields from LexValue fields, hence the slightly-convoluted construction of $customFieldData

        $prevStep = '';
        foreach ($allButLast as $step) {
            if ($prevStep === 'customFields') {
                $target = static::getCustomFieldStep($target, $step, $customFieldData);
            } else {
                $target = static::getNextStep($target, $step, $last, $value);
            }
            if ($target instanceof \Api\Model\Languageforge\Lexicon\LexMultiText && $last === 'value') {
                // For MultiText fields, we need $last to be NEXT-to-last step (the writing system), not "value"
                $last = $path[count($path) - 2];
                // $last = $step;
                break;
            }
            // For a custom single-line MultiText field: [customFields, cf_entry_Cust_Single_Line, en, value] and value is "what was typed"
            // For a custom list field, [customFields, cf_entry_Cust_Single_ListRef, value] and value is "what was selected"
            $prevStep = $step;
        }
        if ($diff instanceof ArrayDiff) {
            if ($diff->item['kind'] == 'N') {
                static::pushValue($target, $last, $value);
            } elseif ($diff->item['kind'] == 'D') {
                if ($target instanceof \ArrayObject) {
                    array_pop($target[$last]);
                } else {
                    array_pop($target->$last);
                }
            } else {
                // Invalid ArrayDiff; do nothing
            }
        } else {
            static::setValue($target, $last, $value);
            // TODO: Verify that this works as desired for deletions
        }
    }

    private static function getCustomFieldStep($target, $step, $customFieldData) {
        if (isset($target[$step])) {
            return $target[$step];
        } else {
            return $target->generate($customFieldData);
        }
    }

    private static function getNextStep($target, $step) {
        if ($target instanceof \ArrayObject) {
            return $target[$step];
        } else {
            return $target->$step;
        }
    }

    private static function setValue(&$target, $last, $value) {
        if ($target instanceof \Api\Model\Languageforge\Lexicon\LexMultiText) {
            $target->form($last, $value);
        } else if ($target instanceof \Api\Model\Languageforge\Lexicon\LexValue) {
            $target->value($value);  // TODO: Test this
        } else if ($target instanceof \ArrayObject) {
            $target[$last] = $value;
        } else {
            if ($target->$last instanceof \Api\Model\Languageforge\Lexicon\LexValue) {
                $target->$last->value($value);
            } else {
                $target->$last = $value;
            }
        }
    }

    private static function pushValue(&$target, $last, $value) {
        if ($target instanceof \ArrayObject) {
            $target[$last][] = $value;
        } else {
            $target->$last[] = $value;
        }
    }
}
