<?php
namespace libraries\sfchecks;

use models\UserModel;

/**
 * Manages the SMS queue.
 */
class Sms
{

	/**
	 * Queues an SMS for sending in the sms queue
	 * @param UserModel $userModel
	 * @param ProjectModel $projectModel
	 * @param string $message
	 */
	public static function send($userModel, $projectModel, $message) {
		
	}

}