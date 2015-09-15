<?php

namespace Api\Model\Mapper;

class MongoUtils
{
    /**
     *
     * @param string $databaseName
     */
    public static function drop($databaseName)
    {
        if (MongoStore::hasDB($databaseName)) {
            $db = MongoStore::connect($databaseName);
            $db->drop();
        }
    }

    /**
     *
     * @param string $databaseName
     */
    public static function dropAllCollections($databaseName) {
        if (MongoStore::hasDB($databaseName)) {
            $db = MongoStore::connect($databaseName);
            foreach ($db->listCollections() as $collection) {
                $collection->drop();
            }
        }
    }
}
