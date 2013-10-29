<?php

namespace libraries\palaso;

class CodeGuard {
	
	const CHECK_NULL_THROW = false;
	const CHECK_NULL_OK = true;
	
	public static function checkTypeAndThrow($var, $expectedType, $isNullOk = self::CHECK_NULL_THROW) {
		if ($isNullOk && $var === null) {
			return;
		}
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
	
	public static function checkNullAndThrow($var, $name) {
		if ($var == null) {
			throw new \Exception("'$name' should not be null");
		}
	}
	
	public static function checkNotFalseAndThrow($var, $name) {
		if ($var == null || !$var) {
			throw new \Exception("'$name' should not evaluate to false");
		}
	}
	
}

?>