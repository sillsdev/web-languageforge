<?php
namespace libraries\lfdictionary\store\mongo;

use libraries\palaso\CodeGuard;
use libraries\lfdictionary\common\LoggerFactory;
use libraries\lfdictionary\environment\MissingInfoType;
use libraries\lfdictionary\store\ILexStore;
use libraries\lfdictionary\Transliteration\WordTransliterationFilter;
use libraries\lfdictionary\dto\AutoListDTO;
use libraries\lfdictionary\dto\AutoListEntry;
use libraries\lfdictionary\dto\EntryListDTO;
use libraries\lfdictionary\dto\ListDTO;
use libraries\lfdictionary\dto\ListEntry;
use models\lex\LexEntryModel;
use models\lex\MultiText;

// TODO Delete. Replaced by the new MongoMapper. CP 2013-12
class MongoLexStore implements ILexStore
{

	/**
	 * @var MongoDb
	 */
	private static $_pool = array();

	/**
	 * @var Mongo
	 */
	private static $_mongo = null;

	/**
	 * @var string
	 */
	private $_databaseName;

	/**
	 * @var MongoDB
	 */
	private $_mongoDB;

	/**
	 * @param string $databaseName
	 */
	private function __construct($databaseName) {
		CodeGuard::checkNotFalseAndThrow($databaseName, 'databaseName');
		if (self::$_mongo == null) {
			self::$_mongo = new \Mongo();
		}
		LoggerFactory::getLogger()->logInfoMessage("MongoLexStore: Connect to " . $databaseName);
		$this->_databaseName = $databaseName;
		try {
			$this->_mongoDB = self::$_mongo->selectDB($databaseName);
		} catch (\Exception $e) {
			throw new \Exception("Could not open database '$databaseName'");
		}
	}

	/**
	 * @param string $databaseName
	 * @return MongoLexStore
	 */
	public static function connect($databaseName) {
		if (!isset(self::$_pool[$databaseName])) {
			self::$_pool[$databaseName] = new MongoLexStore($databaseName);
		}
		return self::$_pool[$databaseName];
	}

	/**
	 * Writes the Lexical Entry to the Store.
	 * @param LexEntryModel $entry
	 */
	public function writeEntry($entry) {
		$collection = $this->_mongoDB->Entries;
		$guid = $entry->getGuid();
		$encoded = $entry->encode();
		$result = $collection->update(
		array('guid' => $guid), $encoded, array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
	}

	/**
	 * Reads a Lexical Entry from the Store
	 * @param string $guid
	 * @return LexEntryModel
	 */
	public function readEntry($guid) {
		$collection = $this->_mongoDB->Entries;
		$result = $collection->findOne(array('guid' => $guid));
		if ($result==null)
		{
			return null;
		}
		$entry = LexEntryModel::create($guid);
		$entry->decode($result);
		return $entry;
	}

	/**
	 * Returns $entryCount entries starting at $startFrom
	 * @param int $startFrom
	 * @param int $maxEntryCount
	 * @return dto\ListDTO
	 */
	public function readEntriesAsListDTO($startFrom, $maxEntryCount) {
		return $this->queryForListDTO(array(), $startFrom, $maxEntryCount);
	}

	/**
	 * Returns a dto\ListDTO for entries matching the given $query
	 * @param array $query
	 * @param int $startFrom
	 * @param int $maxEntryCount
	 * @return dto\ListDTO
	 */
	private function queryForListDTO($query, $startFrom = null, $maxEntryCount = null) {
		$dto = new ListDTO();
		$dto->entryCount = $this->entryCount();
		$collection = $this->_mongoDB->Entries;
		$cursor = $collection->find($query, array('guid' => 1, 'entry' => 1, 'senses.definition' => 1, 'senses.examples' => 1));
		if ($startFrom && $maxEntryCount) {
			$cursor->skip($startFrom)->limit($maxEntryCount);
		}
		$dto->entryBeginIndex = $startFrom;
		$dto->entryEndIndex = $startFrom - 1;
		foreach ($cursor as $entry) {
			$listEntryDTO = ListEntry::createFromParts($entry['guid'], $entry['entry'], $entry['senses']);
			$dto->addListEntry($listEntryDTO);
			$dto->entryEndIndex++;
		}
		if ($dto->entryEndIndex < 0) {
			$dto->entryEndIndex = 0;
		}
		return $dto;
	}

	/**
	 * Returns the total number of Entries in the Store.
	 * @return int
	 */
	public function entryCount() {
		$collection = $this->_mongoDB->Entries;
		$cursor = $collection->find();
		$count = $cursor->count();
		return $count;
	}
	
	/**
	 * Deletes an entry from the Store
	 * @param string $guid
	 */
	public function deleteEntry($guid) {
		$collection = $this->_mongoDB->Entries;
		$collection->remove(array('guid' => $guid));
	}

	/**
	 * Returns a list of suggestions that are similar to the $search term given.
	 * Up to $limit results are returned.
	 * @param string $language
	 * @param string $search
	 * @param int $startFrom
	 * @param int $limit
	 * @return \dto\AutoListDTO
	 */
	public function readSuggestions($language, $search, $startFrom, $limit) {
		$dto = new AutoListDTO();

		$collection = $this->_mongoDB->Entries;
		$cursor = $collection->find(array(), array('guid' => 1, 'entry' => 1));
		foreach ($cursor as $record) {
			$word = MultiText::createFromArray($record['entry']);
			if ($word->hasForm($language)) {
				$wordForm = $word->getForm($language);
				//find the closest
				$simtext = similar_text($search, $wordForm);
				if ($simtext == strlen($search)) {
					// All the words in our search term are in this word.
					$autoListEntry = new AutoListEntry($record['guid'], $wordForm);
					$dto->addListEntry($autoListEntry);
					if (--$limit == 0) {
						break;
					}
				}
			}
		}
		return $dto;
	}

	/**
	 * Returns a ListDTO of entries that do not have data for $language in the given $field.
	 * @param LexStoreMissingInfo $field
	 * @param string $language
	 * @return \dto\ListDTO
	 */
	public function readMissingInfo($field, $language = null) {
		// TODO_OLD Implement the $language feature. i.e. Where $language is set, then check for
		// only that language missing in the given $field. CP 2012-11
		$query = null;
		switch ($field) {
			case MissingInfoType::MEANING:
				$query = array('senses.definition' => array('$size' => 0));
				break;
					
			case MissingInfoType::GRAMMATICAL:
				$query = array('senses.POS' => '');
				break;
					
			case MissingInfoType::EXAMPLE:
				$query = array('senses.examples' => array('$size' => 0));
				break;
					
			default:
				throw new \Exception("Unsupported field '$field'");

		}
		$result = $this->queryForListDTO($query);

		//second query for get those who don't have sense.
		if ( $field==MissingInfoType::MEANING){
			$query = array('senses' => array('$size' => 0));
			$result->mergeListDto($this->queryForListDTO($query));
		}
		return $result;
	}

	const HASH = 'Hash';

	/**
	 * Returns the DVCS hash (SHA) of the last revision
	 * @return string
	 */
	public function readHashOfLastUpdate() {
		$collection = $this->_mongoDB->System;
		$result = $collection->findOne(array('type' => self::HASH));
		return $result ? $result['hash'] : '';
	}

	/**
	 * Writes the DVCS hash (SHA) to the Store
	 * @param string $hash
	 */
	public function writeHashOfLastUpdate($hash) {
		$collection = $this->_mongoDB->System;
		$result = $collection->update(
		array('type' => self::HASH),
		array('type' => self::HASH, 'hash' => $hash),
		array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
	}

	/**
	 * Returns $entryCount entries starting at $startFrom
	 * @param string $lang
	 * @param string $titleLetter
	 * @param int $startFrom
	 * @param int $maxEntryCount
	 * @return dto\EntryListDTO
	 */
	public function searchEntriesAsWordList($lang, $titleLetter, $startFrom, $maxEntryCount) {
		$transliterationFilter = new WordTransliterationFilter();
		$query = array();
		$dto = new \libraries\lfdictionary\dto\EntryListDTO();
		$dto->entryCount = $this->entryCount();
		$collection = $this->_mongoDB->Entries;
		$cursor = $collection->find($query);
		if ($startFrom && $maxEntryCount) {
			$cursor->skip($startFrom)->limit($maxEntryCount);
		}
		foreach ($cursor as $entry) {
			$entryPart = $entry['entry'];
			if (array_key_exists($lang, $entryPart) && $transliterationFilter->isWordStartWithTitleLetter($titleLetter,$entryPart[$lang], $lang)){
				$entryDto = LexEntryModel::create($entry['guid']);
				$entryDto->decode($entry);
				$dto->addEntry($entryDto);
			}
		}
		return $dto;
	}
	
	public function  getAllEntries() {
		$collection = $this->_mongoDB->Entries;
		$cursor = $collection->find();
		$dtoList = new EntryListDTO();
		foreach ($cursor as $entry) {
			$entryPart = $entry['entry'];
			$entryDto = LexEntryModel::create($entry['guid']);
			$entryDto->decode($entry);
			$dtoList->addEntry($entryDto);
		}
		return $dtoList;
	}
	
}

?>