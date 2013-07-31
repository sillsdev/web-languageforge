<?php

namespace libraries\palaso;

class CodeGuard {
	
	public static function checkTypeAndThrow($var, $expectedType) {
		$type = gettype($var);
		if ($type == $expectedType) {
			return;
		}
		if ($type == 'object' && get_class($var) == $expectedType) {
			return;
		}
		if ($type == 'object') {
			$type = get_class($var);
		}
		throw new \Exception("Type Exception: Expected '" . $expectedType . "' given '" . $type . "'");
	}
	
}

?>