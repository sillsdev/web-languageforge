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
}
