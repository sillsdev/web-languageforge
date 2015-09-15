<?php

namespace Api\Model\Mapper;

class MapperUtils
{
    /**
     * @param string $databaseName
     */
    public static function drop($databaseName) {
        return MongoUtils::drop($databaseName);
    }

    /**
     * @param string $databaseName
     */
    public static function dropAllCollections($mapper) {
        return MongoUtils::dropAllCollections($mapper);
    }
}
