<?php
namespace libraries\shared\sms;

class SmsMongoMapper extends \models\mapper\MongoMapper
{
    /**
	 * @var SmsModelMongoMapper[]
	 */
    private static $_pool = array();

    /**
	 * @param string $databaseName
	 * @return SmsModelMongoMapper
	 */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new SmsMongoMapper($databaseName, 'sms');
        }

        return static::$_pool[$databaseName];
    }

}
