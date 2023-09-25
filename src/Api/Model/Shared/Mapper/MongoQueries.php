<?php

namespace Api\Model\Shared\Mapper;

class MongoQueries
{
    public static function countEntries($databaseName, $collectionName)
    {
        $db = MongoStore::connect($databaseName);
        $coll = $db->selectCollection($collectionName);
        return $coll->count();
    }

    public static function countEntriesWithPictures($databaseName, $collectionName)
    {
        $db = MongoStore::connect($databaseName);
        $coll = $db->selectCollection($collectionName);
        $query = [
            "senses" => ['$exists' => true, '$ne' => []],
            "senses.pictures" => ['$exists' => true, '$ne' => []],
        ];
        return $coll->count($query);
    }

    public static function countUnresolvedComments($databaseName, $collectionName)
    {
        $db = MongoStore::connect($databaseName);
        $coll = $db->selectCollection($collectionName);
        $query = [
            "status" => ['$exists' => true, '$ne' => "resolved"],
        ];
        return $coll->count($query);
    }
}
