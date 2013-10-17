<?php
namespace libraries\sms;

use models\UserModel;
use models\ProjectModel;

/**
 * 
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
		$databaseName = $projectModel->databaseName();
		$sms = new SmsModel($databaseName);
		
		
	}

}

?>