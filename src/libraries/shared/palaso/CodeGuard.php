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
		self::exception("Type Exception: Expected '" . $expectedType . "' given '" . $type . "'");
	}
	
	public static function checkNullAndThrow($var, $name) {
		if ($var == null) {
			self::exception("'$name' should not be null");
		}
	}
	
	public static function checkEmptyAndThrow($var, $name) {
		if (empty($var)) {
			self::exception("'$name' should not be empty");
		}
	}
	
	public static function checkNotFalseAndThrow($var, $name) {
		if ($var == null || !$var) {
			self::exception("'$name' should not evaluate to false");
		}
	}
	
	private static function printStackTrace($trace = null) {
		if (is_null($trace)) {
			$trace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT, 20);
		}
		$trace = array_slice($trace, 2, count($trace) - 11);
		$getString = function ($val) {
			if (is_string($val)) {
				return $val;
			} elseif (is_array($val)) {
				return 'Array';
			} elseif (is_object($val)) {
				return get_class($val);
			} else {
				return '';
			}
		};
		print "<pre style='font-weight:bold'>";
		foreach ($trace as $item) {
			$file = substr($item['file'], strrpos($item['file'], '/')+1);
			$line = $item['line'];
			$function = $item['function'];
			$type = $item['type'];
			$class = substr($item['class'], strrpos($item['class'], '\\')+1);
			$args = implode(', ', array_map($getString, $item['args']));
			print "<p>$file line $line, $class$type$function($args)</p>";
		}
		print "</pre>";
	} 
	
	/**
	 * 
	 * @param string $message
	 * @param string $code
	 * @param \Exception $previous
	 * @throws \Exception
	 */
	public static function exception($message = null, $code = null, $previous = null) {
		if (!is_null($previous)) {
			self::printException($previous);
			self::printStackTrace($previous->getTrace());
		}
		self::printStackTrace();
		throw new \Exception($message, $code, $previous);
	}
	
	/**
	 * 
	 * @param \Exception $ex
	 */
	private static function printException($ex) {
		print "<pre style='font-weight:bold'>";
		print $ex->getMessage() . " in " . $ex->getFile() . " line " . $ex->getLine();
		print "</pre>";
		
	}
	
}

?>