<?php
namespace libraries\lfdictionary\store\mongo;
use \libraries\lfdictionary\store\ILiftImporter;
use \libraries\lfdictionary\store\LiftScanner;
use \libraries\lfdictionary\store\LiftStates;
/**
 * LiftMongoImporter imports lift data into the mongo database
 */
class LiftMongoImporter implements ILiftImporter
{
	
	/**
	 * @var string
	 */
	private $_liftFilePath;
	
	/**
	 * @var MongoLexStore
	 */
	private $_lexStoreMongo;
	
	/**
	 * @param string $liftFilePath
	 * @param string $database
	 */
	public function __construct($liftFilePath, $database) {
		$this->_liftFilePath = $liftFilePath;
		$this->_lexStoreMongo = MongoLexStore::connect($database);
	}
	
	/**
	 * @param LiftMongoImporterUpdatePolicy $policy
	 */
	public function update($policy) {
		$scanner = new LiftScanner($this->_liftFilePath);
		$importer = $this;
		$scanner->scanEntries(
			function ($entryGuid) {
				return LiftStates::PROCESS_ALL;
			},
			function ($node) use ($scanner, $importer, $policy) {
				$entry = $scanner->readEntry($node);
				if ($entry!=null){
					$importer->updateEntry($entry, $policy);
				}else if (isset($node->attributes()->dateDeleted))
				{
					$this->_lexStoreMongo->deleteEntry($node->attributes()->guid);
					error_log("Entry deledted by Lift file scanner: " . $node->attributes()->id);
				}else
				{
					throw new \Exception("Unknow Entry operation: " . $node->attributes()->id);
				}
				
			}
		);
	}
	
	/**
	 * Updates a single $entry in the LexMongoStore according to the given $policy.
	 * @param \dto\EntryDTO $entry
	 * @param LiftMongoImporterUpdatePolicy $policy
	 */
	public function updateEntry($entry, $policy) {
		// Note this function needs to be public to allow it to be called by the LiftScanner in the anonymous function
		// in update(...) above. As of PHP 5.3. CP 2012-11
		$this->_lexStoreMongo->writeEntry($entry);
	}
	
} 

?>