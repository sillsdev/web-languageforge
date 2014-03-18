<?php

namespace libraries\shared\palaso;

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
		self::printStackTrace();
		throw new \Exception("Type Exception: Expected '" . $expectedType . "' given '" . $type . "'");
	}
	
	public static function checkNullAndThrow($var, $name) {
		if ($var == null) {
			self::printStackTrace();
			throw new \Exception("'$name' should not be null");
		}
	}
	
	public static function checkEmptyAndThrow($var, $name) {
		if (empty($var)) {
			self::printStackTrace();
			throw new \Exception("'$name' should not be empty");
		}
	}
	
	public static function checkNotFalseAndThrow($var, $name) {
		if ($var == null || !$var) {
			self::printStackTrace();
			throw new \Exception("'$name' should not evaluate to false");
		}
	}
	
	private static function printStackTrace() {
		$stacktrace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT, 7);
		foreach ($stacktrace as $item) {
			$file = substr($item['file'], strrpos($item['file'], '/')+1);
			$line = $item['line'];
			$function = $item['function'];
			$type = $item['type'];
			$class = substr($item['class'], strrpos($item['class'], '\\')+1);
			$args = implode(', ', array_map(function($val) { return (is_array($val)) ? 'Array' : $val; }, $item['args']));
			print "<pre>Line $line in $file, $class$type$function($args)</pre>";
		}
	} 
	
}

?>