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
        $isLexValue = false;
        if ($last === 'value') {
            $isLexValue = true;
            $last = array_pop($allButLast);
        }
        $target = $model;
        foreach ($allButLast as $step) {
            $target = static::getNextStep($target, $step);
        }
        if ($diff instanceof ArrayDiff) {
            if ($diff->item['kind'] == 'N') {
                static::pushValue($target, $last, $diff->getValue());
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
            static::setValue($target, $last, $diff->getValue());
            // TODO: Verify that this works as desired for deletions
        }
    }

    private static function getNextStep($target, $step) {
        if ($target instanceof \Api\Model\Shared\Mapper\MapOf && strpos($step, 'customField_') === 0) {
            // Custom fields should be created if they do not exist
            if (isset($target[$step])) {
                return $target[$step];
            } else {
                if ($target->hasGenerator()) {
                    return $target->generate([$step]);
                } else {
                    // This will probably fail
                    return $target[$step];
                }
            }
        } else if ($target instanceof \ArrayObject) {
            return $target[$step];
        } else {
            return $target->$step;
        }
    }

    private static function setValue(&$target, $last, $value) {
        if ($target instanceof \Api\Model\Languageforge\Lexicon\LexMultiText) {
            $target->form($last, $value);
        } else if ($target instanceof \Api\Model\Languageforge\Lexicon\LexMultiValue) {
            $target->$last->value($value);
        } else if ($target instanceof \ArrayObject) {
            $target[$last] = $value;
        } else {
            $target->$last = $value;
        }
    }

    private static function pushValue(&$target, $last, $value) {
        if ($target instanceof \ArrayObject) {
            $target[$last][] = $value;
        } else if ($target instanceof \Api\Model\Languageforge\Lexicon\LexMultiValue) {
            $target->$last->value($value);
        } else {
            $target->$last[] = $value;
        }
    }
}
