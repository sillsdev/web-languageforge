<?php
namespace libraries\lfdictionary\store;
interface ILexStore
{
	/**
	 * @param string $databaseName
	 * @return LexStore implementation
	 */
	public static function connect($databaseName);

	/**
	 * Writes the Lexical Entry to the Store.
	 * @param EntryDTO $entry
	 */
	public function writeEntry($entry);

	/**
	 * Reads a Lexical Entry from the Store
	 * @param string $guid
	 * @return EntryDTO
	 */
	public function readEntry($guid);

	/**
	 * Returns $entryCount entries starting at $startFrom
	 * @param int $startFrom
	 * @param int $maxEntryCount
	 * @return dto\ListDTO
	 */
	public function readEntriesAsListDTO($startFrom, $maxEntryCount);

	/**
	 * Returns the total number of Entries in the Store.
	 * @return int
	 */
	public function entryCount();

	/**
	 * Deletes an entry from the Store
	 * @param string $guid
	 */
	public function deleteEntry($guid);

	/**
	 * Returns a list of suggestions that are similar to the $search term given.
	 * Up to $limit results are returned.
	 * @param string $language
	 * @param string $search
	 * @param int $startFrom
	 * @param int $limit
	 * @return \dto\AutoListDTO
	 */
	public function readSuggestions($language, $search, $startFrom, $limit);

	/**
	 * Returns a ListDTO of entries that do not have data for $language in the given $field.
	 * @param LexStoreMissingInfo $field
	 * @param string $language
	 * @return \dto\ListDTO
	 */
	public function readMissingInfo($field, $language = null);


	/**
	 * Returns the DVCS hash (SHA) of the last revision
	 * @return string
	 */
	public function readHashOfLastUpdate();

	/**
	 * Writes the DVCS hash (SHA) to the Store
	 * @param string $hash
	 */
	public function writeHashOfLastUpdate($hash);
	
	/**
	* Returns $entryCount entries starting at $startFrom
	* @param string $lang
	* @param string $titleLetter
	* @param int $startFrom
	* @param int $maxEntryCount
	* @return dto\EntryListDTO
	*/
	public function searchEntriesAsWordList($lang, $titleLetter, $startFrom, $maxEntryCount);

	/**
	 * get all entries and all parts of entry into a EntryListDTO.
	 */
	public function getAllEntries();
}
?>