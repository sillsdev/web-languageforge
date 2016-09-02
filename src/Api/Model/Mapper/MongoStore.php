<?php

namespace Api\Model\Mapper;

use MongoDB\Client;



class MongoStore
{
    /**
     * @var \MongoDB\Client
     */
    private static $_mongoClient;

    /**
     * @param string $databaseName
     * @return \MongoDB\Database
     */
    public static function connect($databaseName)
    {
        if (static::$_mongoClient == null) {
            // MongoDB Client that will unserialize everything as PHP Arrays consistent with the legacy driver (which our code was built on)
            // see http://mongodb.github.io/mongo-php-library/classes/client/#example
            static::$_mongoClient = new Client(MONGODB_CONN, [], ['typeMap' => ['root' => 'array', 'document' => 'array', 'array' => 'array']]);
        }
        return static::$_mongoClient->selectDatabase($databaseName);
    }

    /**
     * @param string $databaseName
     * @return bool
     */
    public static function hasDB($databaseName)
    {
        foreach (static::$_mongoClient->listDatabases() as $databaseInfo) {
            if ($databaseInfo->getName() == $databaseName) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param string $sourceName
     * @param string $destName
     * @return array - command result
     */
    public static function copyDB($sourceName, $destName)
    {
        $response = static::$_mongoClient->admin->command(array(
            'copydb' => 1,
            'fromhost' => 'localhost',
            'fromdb' => $sourceName,
            'todb' => $destName,
        ));

        return $response;
    }

    /**
     * @param string $databaseName
     * @return array - command result
     */
    public static function dropDB($databaseName)
    {
        return static::$_mongoClient->dropDatabase($databaseName);
    }

    /**
     * @param string $oldName
     * @param string $newName
     * @return array - command result
     * @throws \Exception
     */
    public static function renameDB($oldName, $newName)
    {
        // See http://stackoverflow.com/questions/14701418/rename-mongo-database
        if (!self::hasDB($oldName)) {
            throw new \Exception("Database " . $oldName . " does not exist; cannot rename it to " . $newName . ".");
        }
        if (self::hasDB($newName)) {
            throw new \Exception("Database " . $newName . " already exists; not renaming " . $oldName . " to " . $newName . ".");
        }
        $copyResult = self::copyDB($oldName, $newName);
        $dropResult = self::dropDB($oldName);
        $result = array(
            'copyResult' => $copyResult,
            'dropResult' => $dropResult
        );

        return $result;
    }

    /**
     *
     * @param string $databaseName
     */
    public static function dropAllCollections($databaseName) {
        $db = self::connect($databaseName);
        if (self::hasDB($databaseName)) {
            foreach ($db->listCollections() as $collectionInfo) {
                if ($collectionInfo->getName() != 'system.indexes') {
                    $collection = $db->selectCollection($collectionInfo->getName());
                    $collection->drop();
                }
            }
        }
    }

    /**
     * @param $databaseName
     * @return integer
     */
    public static function countCollections($databaseName) {
        $count = 0;
        if (self::hasDB($databaseName)) {
            $db = self::connect($databaseName);
            foreach ($db->listCollections() as $collectionInfo) {
                if ($collectionInfo->getName() != 'system.indexes') {
                    $count++;
                }
            }
        }
        return $count;
    }
}
