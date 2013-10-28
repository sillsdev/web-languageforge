<?php
namespace models\rights;

class Operation {

	const CREATE		= 1;
	const EDIT_OWN		= 2;
	const EDIT_OTHER	= 3;
	const DELETE_OWN	= 4;
	const DELETE_OTHER  = 5;
	const LOCK			= 6;
	const VIEW_OWN		= 7;
	const VIEW_OTHER	= 8;
	
	public static $operations = array(
			self::CREATE,
			self::EDIT_OWN,
			self::EDIT_OTHER,
			self::DELETE_OWN,
			self::DELETE_OTHER,
			self::LOCK,
			self::VIEW_OWN,
			self::VIEW_OTHER
	);
	
}

?>