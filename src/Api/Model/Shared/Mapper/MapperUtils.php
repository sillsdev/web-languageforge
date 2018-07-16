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

    /** Figure out if subdocuments have moved
     * Structure expected for oldData and newData: array of documents that have a unique key
     * Returns a keyed array (dict) with keys being ID values, and values being ["oldPos" => int, "newPos" => int].
     * Only the key is examined; the other parts of the data are not compared
     * E.g., if the input is as follows:
     * $oldData = [ ["id" => "abc", "data" => "foo"], ["id" => "def", "data" => "bar"] ]
     * $newData = [ ["id" => "def", "data" => "bar"], ["id" => "abc", "data" => "new foo"] ]
     * $key = "id"
     * then the result will be:
     * [ "abc" => [ "oldPos" => 0, "newPos" => 1 ], "def" => [ "oldPos" => 1, "newPos" => 0 ] ]
     * If any ID has appeared or disappeared, the oldPos or newPos for that ID will be null.
     * E.g., ["oldPos" => 0, "newPos" => null] means that the item was deleted.
     *
     * WARNING: if keys are duplicated, this function's behavior will be undefined
     *
     * @param array $oldData
     * @param array $newData
     * @param string $keyName
     * @return array
     */
    public static function detectMoved($oldData, $newData, $keyName)
    {
        $oldPositionsById = [];
        $newPositionsById = [];
        foreach ($oldData as $pos => $value) {
            if (is_array($value) && array_key_exists($keyName, $value)) {
                $oldPositionsById[$value[$keyName]] = $pos;
            }
        }
        foreach ($newData as $pos => $value) {
            if (is_array($value) && array_key_exists($keyName, $value)) {
                $newPositionsById[$value[$keyName]] = $pos;
            }
        }

        // Most of the time there will be no motion, so check that first
        if ($oldPositionsById === $newPositionsById) {
            return [];
        }

        $result = [];
        foreach ($oldPositionsById as $id => $oldPos) {
            $newPos = $newPositionsById[$id] ?? null;  // Without the "?? null", we'd get an error if the ID didn't exist
            $result[$id] = ["oldPos" => $oldPos, "newPos" => $newPos];
            // Keep track of which keys we've handled
            unset($newPositionsById[$id]);
        }
        // Any remaining IDs in newData are items that were added
        foreach ($newPositionsById as $id => $newPos) {
            $result[$id] = ["oldPos" => null, "newPos" => $newPos];
        }
        return $result;
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
