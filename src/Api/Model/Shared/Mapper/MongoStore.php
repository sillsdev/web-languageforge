<?php

namespace Api\Model\Shared\Mapper;

use MongoDB\Client;

class MongoStore
{
    /** @var \MongoDB\Client */
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
            $options = [];
            if (defined('MONGODB_USER') && defined('MONGODB_PASS')) {
                if (MONGODB_USER != null && MONGODB_PASS != null) {
                    $options = [ 'username' => MONGODB_USER, 'password' => MONGODB_PASS ];
                }
            }
            $options['authSource'] = 'admin';
            if (defined('MONGODB_AUTHSOURCE') && MONGODB_AUTHSOURCE != null) {
                $options['authSource'] = MONGODB_AUTHSOURCE;
            }
            static::$_mongoClient = new Client(
                MONGODB_CONN,
                $options,
                ["typeMap" => ["root" => "array", "document" => "array", "array" => "array"]]
            );
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
     * @return \MongoDB\Driver\Cursor - command result
     */
    public static function copyDB($sourceName, $destName)
    {
        $response = static::$_mongoClient->admin->command([
            "copydb" => 1,
            "fromhost" => "localhost",
            "fromdb" => $sourceName,
            "todb" => $destName,
        ]);

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
            throw new \Exception(
                "Database " . $newName . " already exists; not renaming " . $oldName . " to " . $newName . "."
            );
        }
        $copyResult = self::copyDB($oldName, $newName);
        $dropResult = self::dropDB($oldName);
        $result = [
            "copyResult" => $copyResult,
            "dropResult" => $dropResult,
        ];

        return $result;
    }

    /**
     * @param string $databaseName
     */
    public static function dropAllCollections($databaseName)
    {
        $db = self::connect($databaseName);
        if (self::hasDB($databaseName)) {
            foreach ($db->listCollections() as $collectionInfo) {
                if ($collectionInfo->getName() != "system.indexes") {
                    $collection = $db->selectCollection($collectionInfo->getName());
                    $collection->drop();
                }
            }
        }
    }

    /**
     * @param string $databaseName
     * @param string $collectionName
     */
    public static function dropCollection($databaseName, $collectionName)
    {
        $db = self::connect($databaseName);
        if (self::hasDB($databaseName)) {
            if ($collectionName != "system.indexes") {
                $collection = $db->selectCollection($collectionName);
                $collection->drop();
            }
        }
    }

    /**
     * @param string $databaseName
     * @return integer
     */
    public static function countCollections($databaseName)
    {
        $count = 0;
        if (self::hasDB($databaseName)) {
            $db = self::connect($databaseName);
            foreach ($db->listCollections() as $collectionInfo) {
                if ($collectionInfo->getName() != "system.indexes") {
                    $count++;
                }
            }
        }
        return $count;
    }

    /**
     * @param string $databaseName
     * @param string $collectionName
     * @return \MongoDB\Model\IndexInfoIterator|null
     */
    public static function getCollectionIndexes($databaseName, $collectionName)
    {
        $db = self::connect($databaseName);
        if (self::hasDB($databaseName) && $collectionName != "system.indexes") {
            return $db->selectCollection($collectionName)->listIndexes();
        }
        return null;
    }

    /**
     * @param string $databaseName
     * @param string $collectionName
     * @param array $indexes see https://docs.mongodb.com/v2.4/reference/method/db.collection.createIndex/
     */
    public static function addIndexesToCollection($databaseName, $collectionName, $indexes)
    {
        $db = self::connect($databaseName);
        if (self::hasDB($databaseName) && $collectionName != "system.indexes") {
            $db->selectCollection($collectionName)->createIndexes($indexes);
        }
    }

    /**
     * @param string $databaseName
     * @param string $collectionName
     * @param array $indexes see https://docs.mongodb.com/v2.4/reference/method/db.collection.createIndex/
     * @param boolean $isDropRequired should an existing index be dropped
     * @return array indexes that don't exist yet
     */
    public static function getIndexesNotSetInCollection(
        $databaseName,
        $collectionName,
        $indexes,
        $isDropRequired = false
    ) {
        $indexesToCreate = [];
        $db = self::connect($databaseName);
        if (self::hasDB($databaseName) && $collectionName != "system.indexes") {
            foreach ($indexes as $index) {
                if (self::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName)) {
                    if (!self::isIndexIdenticalInCollection($index, $databaseName, $collectionName, $indexName)) {
                        if ($isDropRequired) {
                            $db->selectCollection($collectionName)->dropIndex($indexName);
                        }
                        $indexesToCreate[] = $index;
                    }
                } else {
                    $indexesToCreate[] = $index;
                }
            }
        }

        return $indexesToCreate;
    }

    /**
     * @param string $databaseName
     * @param string $collectionName
     * @param array $indexes see https://docs.mongodb.com/v2.4/reference/method/db.collection.createIndex/
     */
    public static function ensureIndexesInCollection($databaseName, $collectionName, $indexes)
    {
        $indexesToCreate = self::getIndexesNotSetInCollection($databaseName, $collectionName, $indexes, true);
        if (count($indexesToCreate) > 0) {
            self::connect($databaseName)
                ->selectCollection($collectionName)
                ->createIndexes($indexesToCreate);
        }
    }

    /**
     * @param array $index
     * @param string $databaseName
     * @param string $collectionName
     * @param string $indexName outputs the index name if the field name is found
     * @return boolean true if the index key field name is in the collection
     */
    public static function isIndexFieldNameInCollection($index, $databaseName, $collectionName, &$indexName = "")
    {
        $indexName = "";
        foreach (self::getCollectionIndexes($databaseName, $collectionName) as $indexInfo) {
            foreach ($index["key"] as $fieldName => $order) {
                if (array_key_exists($fieldName, $indexInfo->getKey())) {
                    $indexName = $indexInfo->getName();
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param array $index
     * @param string $databaseName
     * @param string $collectionName
     * @param string $indexName outputs the index name if the field name is found
     * @return boolean true if all the field names of a single index key is in the collection
     */
    public static function isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, &$indexName = "")
    {
        $indexName = "";
        foreach (self::getCollectionIndexes($databaseName, $collectionName) as $indexInfo) {
            $isAllFieldNamesInIndex = false;
            if (count($index["key"]) == count($indexInfo->getKey())) {
                $isAllFieldNamesInIndex = true;
                foreach ($index["key"] as $fieldName => $order) {
                    if (!array_key_exists($fieldName, $indexInfo->getKey())) {
                        $isAllFieldNamesInIndex = false;
                        break;
                    }
                }
            }

            if ($isAllFieldNamesInIndex) {
                $indexName = $indexInfo->getName();
                return true;
            }
        }

        return false;
    }

    /**
     * @param array $index
     * @param string $databaseName
     * @param string $collectionName
     * @param string $indexName expected in collection
     * @return boolean true if the index key field name is identical in the collection
     */
    public static function isIndexIdenticalInCollection($index, $databaseName, $collectionName, $indexName = "")
    {
        if (
            !$indexName &&
            !self::isAllIndexFieldNamesInCollection($index, $databaseName, $collectionName, $indexName)
        ) {
            return false;
        }

        foreach (self::getCollectionIndexes($databaseName, $collectionName) as $indexInfo) {
            $isIdentical = false;
            if ($indexInfo->getName() == $indexName) {
                $isIdentical = true;
                foreach ($index as $key => $value) {
                    if (!$indexInfo->offsetExists($key)) {
                        $isIdentical = false;
                        break;
                    }

                    if ($indexInfo->offsetGet($key) != $value) {
                        $isIdentical = false;
                        break;
                    }
                }

                if (
                    ($indexInfo->isSparse() && !array_key_exists("sparse", $index)) ||
                    ($indexInfo->isTtl() && !array_key_exists("expireAfterSeconds", $index)) ||
                    ($indexInfo->isUnique() && !array_key_exists("unique", $index))
                ) {
                    $isIdentical = false;
                }
            }

            if ($isIdentical) {
                return true;
            }
        }

        return false;
    }
}
