<?php
namespace libraries\lfdictionary\common;
error_reporting(E_ALL | E_STRICT);
require_once(dirname(__FILE__) . '/../Config.php');
use libraries\lfdictionary\common\LoggerFactory;
class ErrorHandler
{

	private static $_handler;

	private $userErrorMessage="Oops. That didn't work as well as it should have. Please email us at issues@languageforge.org and tell us all about it.";

	private function __construct() {
		set_error_handler(array($this, 'handleError'));
		set_exception_handler(array($this, 'handleException'));
	}

	public function __destruct() {
		restore_exception_handler();
		restore_error_handler();
	}

	function showToClient($msg, $refId, $exception = null) {
		// try to send error detail back to client
		try{
			$request = json_decode(file_get_contents('php://input'),true);
			if ($request != null && array_key_exists('id', $request) && !empty($request['id'])) {
				if (!is_null($exception) &&  (substr(get_class($exception), -(strlen("UserActionDeniedException"))) === "UserActionDeniedException"))
				{
					// this exception should show to user directlly!
					$msg=$exception->getMessage();

				}elseif (IS_DEV_MODE!=1 && SHOW_ERROR_DETAIL_CLIENT!=1)
				{
					//normall exception.
					$msg=$this->userErrorMessage . " " . "[REF: $refId]";
				}

				$response = array (
						'jsonrpc' => '2.0',
						'id' => $request['id'],
						'result' => NULL,
						'error' => $msg
				);
				header('content-type: text/javascript');
				echo \json_encode($response);
				flush();
			}else
			{
				//not a rpc call?
				return;
			}

		} catch (Exception $e) {
			//nothing we can do
		}
	}

	public function handleError($error_level,$error_message,$error_file,$error_line,$error_context)
	{
		$refId = \strtoupper(uniqid("ER"));
		$msg = "";
		switch ($error_level)
		{
			case E_WARNING:
				$msg = "[E_WARNING]";
				break;
			case E_NOTICE:
				$msg = "[E_NOTICE]";
				break;
			case E_USER_ERROR:
				$msg = "[E_USER_ERROR]";
				break;
			case E_USER_WARNING:
				$msg = "[E_USER_WARNING]";
				break;
			case  E_USER_NOTICE:
				$msg = "[E_USER_NOTICE]";
				break;
			case E_RECOVERABLE_ERROR:
				$msg = "[E_RECOVERABLE_ERROR]";
				break;
			case  E_ALL:
				$msg = "[E_ALL]";
				break;
		}
		//$msg=$msg . "[REF: $refId] : [T: $errorType] [L: $errorLine] [F: $errorFile] \n $errorString \n";
		$msg=$msg . "[REF: $refId] : $error_message: has occured in $error_file on line $error_line\n";
		LoggerFactory::getLogger()->logDebugMessage($msg);
		switch ($error_level)
		{
			case E_USER_ERROR:
				$this->showToClient($msg,$refId);
				exit;
				// finish
				return true;
			case E_USER_WARNING:
			case  E_USER_NOTICE:
				break;
		}
	}


	function handleException($exception) {
		// these are our templates
		$refId = \strtoupper(uniqid("EX"));
		$traceline = "#%s %s(%s): %s(%s)";

		$msg = "PHP Fatal error [REF: $refId] :  Uncaught exception '%s' with message '%s' in %s:%s\nStack trace:\n%s\n  thrown in %s on line %s";

		// alter your trace as you please, here
		$trace = $exception->getTrace();
		foreach ($trace as $key => $stackPoint) {
			// I'm converting arguments to their type
			// (prevents passwords from ever getting logged as anything other than 'string')
			$trace[$key]['args'] = \array_map('gettype', $trace[$key]['args']);
		}
		// build your tracelines
		$result = array();
		foreach ($trace as $key => $stackPoint) {
			$result[] = sprintf(
					$traceline,
					$key,
					\array_key_exists('file', $stackPoint)? $stackPoint['file'] : "",
					\array_key_exists('line', $stackPoint)? $stackPoint['line'] : "",
					\array_key_exists('function', $stackPoint)? $stackPoint['function'] : "",
					\implode(', ', $stackPoint['args'])
			);
		}
		// trace always ends with {main}
		if (!isset($key))
		{
			$result[] = '#1  {main}';
		}else{
			$result[] = '#' . ++$key . ' {main}';
		}
		// write tracelines into main template
		$msg = sprintf(
				$msg,
				get_class($exception),
				$exception->getMessage(),
				$exception->getFile(),
				$exception->getLine(),
				\implode("\n", $result),
				$exception->getFile(),
				$exception->getLine()
		);
		error_log($msg);
		LoggerFactory::getLogger()->logErrorMessage($msg);
		$this->showToClient($msg,$refId,$exception);
		return true;
	}

	public static function register() {
		self::$_handler = new ErrorHandler();
	}

}

?>