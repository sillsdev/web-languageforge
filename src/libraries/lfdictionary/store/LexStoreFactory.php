<?php
namespace libraries\lfdictionary\store;
use libraries\lfdictionary\store\mongo\MongoLexStore;
class LexStoreFactory
{
	public static function  getLexStore($storeType, $databaseName)
	{
		switch ($storeType) {
			case LexStoreType::STORE_MONGO:
				return MongoLexStore::connect($databaseName);
			case LexStoreType::STORE_TEST:
				throw new \Exception('Not implemented');
				break;
			default:
				throw new \Exception("undefined store type");
			break;
		}
	}
}

?>