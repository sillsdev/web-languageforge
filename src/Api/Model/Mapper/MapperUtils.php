<?php

namespace Api\Model\Mapper;

class MapperUtils
{
    /**
     * @param string $databaseName
     */
    public static function drop($databaseName) {
        return MongoStore::dropDB($databaseName);
    }

    /**
     * @param string $databaseName
     */
    public static function dropAllCollections($databaseName) {
        return MongoStore::dropAllCollections($databaseName);
    }
}
