<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MongoMapper;

class UserModelMongoMapper extends MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new UserModelMongoMapper(DATABASE, "users");
        }

        return $instance;
    }
}
