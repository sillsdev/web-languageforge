<?php
namespace models\shared\rights;

class Operation {

	const CREATE		= 1;
	const EDIT			= 2;
	const DELETE		= 3;
	const LOCK			= 4;
	const VIEW			= 5;
	const VIEW_OWN		= 6;
	const EDIT_OWN		= 7;
	const DELETE_OWN	= 8;
	const ARCHIVE		= 9;
	// todo: change 'delete_own' to 'archive_own'
	
	public static $operations = array(
			self::CREATE,
			self::EDIT,
			self::DELETE,
			self::LOCK,
			self::VIEW,
			self::EDIT_OWN,
			self::DELETE_OWN,
			self::VIEW_OWN,
			self::ARCHIVE
	);
	
}

?>