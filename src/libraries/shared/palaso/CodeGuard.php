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
	
	public static function assertInArrayOrThrow($var, $array) {
		if (!in_array($var, $array)) {
			self::exception("'$var' does not match one of the specified values");
		}
	}
	
	public static function assertKeyExistsOrThrow($key, $array, $name) {
		if (!array_key_exists($key, $array)) {
			self::exception("'$key' does not exist in array '$name'");
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
	
	public static function getStackTrace($trace = null) {
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
		$out = "<pre style='font-weight:bold'>";
		try {
			foreach ($trace as $item) {
				$file = ''; $line = ''; $function = ''; $type = ''; $class = '';
				if (array_key_exists('file', $item)) {
					$file = substr($item['file'], strrpos($item['file'], '/')+1);
				}
				if (array_key_exists('line', $item)) {
					$line = $item['line'];
				}
				if (array_key_exists('function', $item)) {
					$function = $item['function'];
				}
				if (array_key_exists('type', $item)) {
					$type = $item['type'];
				}
				if (array_key_exists('class', $item)) {
					$class = substr($item['class'], strrpos($item['class'], '\\')+1);
				}
				$args = implode(', ', array_map($getString, $item['args']));
				$out .= "<p>$file line $line, $class$type$function($args)</p>";
			}
		} catch (\Exception $e) {
			$out .= "Exception: " . $e->getMessage();
			// ignore exceptions inside this method
		}
		$out .= "</pre>";
		return $out;
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
			print self::getStackTrace($previous->getTrace());
		}
		print self::getStackTrace();
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