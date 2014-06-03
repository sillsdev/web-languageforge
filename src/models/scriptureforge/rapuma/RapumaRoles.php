<?php

namespace models\scriptureforge\rapuma;

use models\shared\rights\ProjectRoles;

class RapumaRoles extends ProjectRoles {
	
	public static function init() {
		parent::init();

		// Project Member
		$rights = array();
		self::$_rights[self::CONTRIBUTOR] = $rights;
		
		// Project Manager (everything an user has... plus the following)
		$rights = self::$_rights[self::CONTRIBUTOR];
		self::$_rights[self::MANAGER] = $rights;
	}
}
RapumaRoles::init();

?>
