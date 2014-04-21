<?php
namespace libraries\lfdictionary\store;
use libraries\lfdictionary\store\mongo\MongoLexStore;

// TODO Delete. This just doesn't hold its weight. CP 2013-12
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