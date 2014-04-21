<?php
namespace libraries\lfdictionary\store;

// TODO Delete. This just doesn't hold its weight. CP 2013-12
interface ILiftImporter
{
	/**
	 * @param LiftImporterUpdatePolicy $policy
	 */
	public function update($policy) ;

	/**
	 * Updates a single $entry in the LexMongoStore according to the given $policy.
	 * @param LexEntryModel $entry
	 * @param LiftImporterUpdatePolicy $policy
	 */
	public function updateEntry($entry, $policy);
}
?>