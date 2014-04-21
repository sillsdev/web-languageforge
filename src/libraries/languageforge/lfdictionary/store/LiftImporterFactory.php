<?php
namespace libraries\lfdictionary\store;
use libraries\lfdictionary\store\mongo\LiftMongoImporter;

// TODO Delete. This just doesn't hold its weight. CP 2013-12
class LiftImporterFactory
{
	public static function  getImportFactory($storeType, $liftFilePath, $database)
	{
		switch ($storeType) {
			case LexStoreType::STORE_MONGO:
				return new LiftMongoImporter($liftFilePath, $database);
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