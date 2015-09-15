<?php
namespace Api\Model;

use Api\Model\Mapper\MongoMapper;

class UserModelMongoMapper extends \Api\Model\Mapper\MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new UserModelMongoMapper(SF_DATABASE, 'users');
        }

        return $instance;
    }
}
