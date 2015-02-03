<?php

namespace models\mapper;

class MongoStore
{
    /**
     * @var MongoDB[]
     */
    private static $_pool = array();

    /**
     * @var Mongo
     */
    private static $_mongo;

    /**
     * @param string $databaseName
     * @return MongoDB
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = static::connectMongo($databaseName);
        }

        return static::$_pool[$databaseName];
    }

    /**
     * @param string $databaseName
     * @return MongoDB
     */
    private static function connectMongo($databaseName)
    {
        if (static::$_mongo == null) {
            static::$_mongo = new \Mongo();
        }

        return static::$_mongo->selectDB($databaseName);
    }

    public static function hasDB($databaseName)
    {
        $databases = static::$_mongo->listDBs();
        $result = array_filter($databases['databases'], function ($item) use ($databaseName) { return $item['name'] == $databaseName; } );

        return count($result) != 0;
    }

    /**
     * @param string $sourceName
     * @param string $destName
     * @return MongoDB
     */
    public static function copyDB($sourceName, $destName)
    {
        $response = static::$_mongo->admin->command(array(
            'copydb' => 1,
            'fromhost' => 'localhost',
            'fromdb' => $sourceName,
            'todb' => $destName,
        ));

        return $response;
    }

    /**
     * @param string $databaseName
     * @return MongoDB
     */
    public static function dropDB($databaseName)
    {
        $oldDB = MongoStore::connectMongo($databaseName);
        $response = $oldDB->drop();

        return $response;
    }

    /**
     * @param string $oldName
     * @param string $newName
     * @return MongoDB
     */
    public static function renameDB($oldName, $newName)
    {
        // See http://stackoverflow.com/questions/14701418/rename-mongo-database
        if (!MongoStore::hasDB($oldName)) {
            throw new \Exception("Database " . $oldName . " does not exist; cannot rename it to " . $newName . ".");
        }
        if (MongoStore::hasDB($newName)) {
            throw new \Exception("Database " . $newName . " already exists; not renaming " . $oldName . " to " . $newName . ".");
        }
        $copyResult = MongoStore::copyDB($oldName, $newName);
        $dropResult = MongoStore::dropDB($oldName);
        $result = array(
            'copyResult' => $copyResult,
            'dropResult' => $dropResult
        );

        return $result;
    }
}
