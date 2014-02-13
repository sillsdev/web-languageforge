<?php
namespace libraries\lfdictionary\store;
use libraries\lfdictionary\store\mongo\LiftMongoImporter;
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