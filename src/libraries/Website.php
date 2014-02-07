<?php

namespace libraries;

class Website {
	
	public static function getSiteName() {
		$domainName = $_SERVER['HTTP_HOST'];
		$uriParts = explode('.', $domainName);
		array_pop($uriParts); // pop off the .org
		$site = array_pop($uriParts);

		// exception list for custom standalone domains
		if ($site == 'jamaicanpsalms') {
			$site = 'scriptureforge';
		}

		return $site;
	}
}

?>
