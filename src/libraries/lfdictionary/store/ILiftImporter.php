<?php
namespace libraries\lfdictionary\store;
interface ILiftImporter
{
	/**
	 * @param LiftImporterUpdatePolicy $policy
	 */
	public function update($policy) ;

	/**
	 * Updates a single $entry in the LexMongoStore according to the given $policy.
	 * @param \dto\EntryDTO $entry
	 * @param LiftImporterUpdatePolicy $policy
	 */
	public function updateEntry($entry, $policy);
}
?>