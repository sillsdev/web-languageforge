<?php

namespace Api\Model\Shared\Mapper;

class MongoQueries
{
    public static function countEntries($db, $collectionName)
    {
        $coll = $db->selectCollection($collectionName);
        return $coll->count();
    }

    public static function countEntriesWithPictures($db, $collectionName)
    {
        $coll = $db->selectCollection($collectionName);
        $query = [
            "senses" => ['$exists' => true, '$ne' => []],
            "senses.pictures" => ['$exists' => true, '$ne' => []],
        ];
        return $coll->count($query);
    }

    public static function countUnresolvedComments($db, $collectionName)
    {
        $coll = $db->selectCollection($collectionName);
        $query = [
            "status" => ['$exists' => true, '$ne' => "resolved"],
        ];
        return $coll->count($query);
    }
}
