<?php
namespace models\rights;

class Domain {

	const ANY			= 100;
	const USERS			= 110;
	const PROJECTS		= 120;
	const TEXTS			= 130;
	const QUESTIONS		= 140;
	const ANSWERS		= 150;
	const COMMENTS		= 160;
	
	public static $domains = array(
			self::ANY,
			self::USERS,
			self::PROJECTS,
			self::TEXTS,
			self::QUESTIONS,
			self::ANSWERS,
			self::COMMENTS
	);
	
}

?>