<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class DeepDiffDecoder
{
    public static function fromDeepDiff($diffs) {
        // TODO: Pick a name and rename this
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
        $diffs = static::fromDeepDiff($deepDiff);
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
        foreach ($allButLast as $step) {
            if ($target instanceof \ArrayObject) {
                $target = $target[$step];
            } else {
                $target = $target->$step;
            }
        }
        if ($diff instanceof ArrayDiff) {
            if ($diff->item['kind'] == 'N') {
                if ($target instanceof \ArrayObject) {
                    $target[$last][] = $diff->getValue();
                } else {
                    $target->$last[] = $diff->getValue();
                }
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
            if ($target instanceof \ArrayObject) {
                $target[$last] = $diff->getValue();
            } else {
                $target->$last = $diff->getValue();
            }
            // TODO: Verify that this works as desired for deletions
        }
    }

    /** Creates a Mongo update array to pass to findOneAndUpdate()
     * @param array $deepDiff An array of diffs from the Javascript deep-diff library.
     * @throws \Exception
     */
    public static function toMongoUpdate($deepDiff) {
        CodeGuard::checkTypeAndThrow($deepDiff, 'array');
        $diffs = static::fromDeepDiff($deepDiff);
        $result = [];
        foreach ($diffs as $diff) {
            $update = $diff->toMongoUpdateEntry();
            $result = array_merge_recursive($result, $update);
        }
        return $result;
    }
}
