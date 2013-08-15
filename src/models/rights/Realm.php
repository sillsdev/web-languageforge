<?php
namespace models\rights;

class Realm {

	const SITE			= 'site';
	const PROJECT		= 'project';
	
	public static $realms = array(
			self::SITE,
			self::PROJECT
	);
	
}

?>