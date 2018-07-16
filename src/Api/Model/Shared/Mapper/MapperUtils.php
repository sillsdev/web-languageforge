<?php

namespace Api\Model\Shared\Mapper;

class MapperUtils
{
    /**
     * @param string $databaseName
     * @return array
     */
    public static function drop($databaseName) {
        return MongoStore::dropDB($databaseName);
    }

    /**
     * @param string $databaseName
     */
    public static function dropAllCollections($databaseName) {
        MongoStore::dropAllCollections($databaseName);
    }

    // Returns an array with three keys:
    // [ 'added' => [ 'new1', 'new2' ], 'removed' => [ 'old1', 'old2' ], 'moved' => [ 0 => 1, 1 => 0 ] ]
    // The indices in "moved" are calculated after removing all the old keys, and then adding all the new keys *at the end*
    // So to apply these changes (e.g., in Mongo), you do the same sequence: remove first, then add, then rearrange
    public static function calculateChanges($oldKeys, $newKeys)
    {
        // Most of the time there will be no motion, so check that first.
        if ($oldKeys === $newKeys) {
            return [];
        }

        // array_values() call needed because array_diff(['a', 'b', 'c'], ['a']) produces [ 1 => 'b', 2 => 'c' ]
        // but the index-based logic further down needs [ 0 => 'b', 1 => 'c' ]
        $added = array_values(array_diff($newKeys, $oldKeys));
        $removed = array_values(array_diff($oldKeys, $newKeys));

        $remaining = array_values(array_diff($oldKeys, $removed));
        foreach ($added as $item) {
            $remaining[] = $item;
        }

        $oldIndicesByKey = array_flip($remaining);
        $newIndicesByKey = array_flip($newKeys);

        $moved = [];
        if ($oldIndicesByKey != $newIndicesByKey) {
            foreach ($oldIndicesByKey as $id => $oldPos) {
                $newPos = $newIndicesByKey[$id];
                $moved[$oldPos] = $newPos;
            }
        }
        return [ 'added' => $added, 'removed' => $removed, 'moved' => $moved ];
    }
}
