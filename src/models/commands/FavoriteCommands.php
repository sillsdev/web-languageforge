<?php

namespace models\commands;

use libraries\palaso\CodeGuard;

class FavoriteCommands
{
	/**
	 * @param array $favoriteIds
	 * @return int Total number of favorite questions removed.
	 */
	public static function deleteFavorites($favoriteIds) {
		CodeGuard::checkTypeAndThrow($favoriteIds, 'array');
		$count = 0;
		foreach ($favoriteIds as $favoriteId) {
			CodeGuard::checkTypeAndThrow($favoriteId, 'string');
			$favorite = new \models\FavoriteModel($favoriteId);
			$favorite->remove($favoriteId);
			$count++;
		}
		return $count;
	}
}

?>
