<?php
namespace libraries\lfdictionary\common;

/**
 * UserActionDeniedException may be thrown by the api when the currently logged in user has insufficient rights\
 * to execute an api.
 * REVIEWED CP 2013-12: OK
 */
class UserActionDeniedException extends \Exception
{
	// Redefine the exception so message isn't optional
	public function __construct($message, $code = 0) {
		// make sure everything is assigned properly
		parent::__construct($message, $code);
	}
}

?>