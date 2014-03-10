<?php 
namespace models\languageforge\lexicon;

class LexEntryModelMongoMapper extends \models\mapper\MongoMapper {

	/**
	 * @var LexEntryModelMongoMapper[]
	 */
	private static $_pool = array();
	
	/**
	 * @param string $databaseName
	 * @return LexEntryModelMongoMapper
	 */
	public static function connect($databaseName) {
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = new LexEntryModelMongoMapper($databaseName, 'lexicon');
		}
		return static::$_pool[$databaseName];
	}
	
}


?>