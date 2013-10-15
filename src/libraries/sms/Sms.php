<?php
namespace libraries\sms;

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

	/**
	 * Attempts to deliver a single sms message. 
	 * @param SmsModel $smsModel
	 */
	public static function deliver($smsModel) {
		$info = explode('|', $smsModel->providerInfo);
		$sid = $info[0];
		$token = $info[1];
		
		$client = new \Services_Twilio($sid, $token);
		$message = $client->account->messages->sendMessage(
			$smsModel->from,
			$smsModel->to,
			$smsModel->message
		);
		
		var_dump($message);
	}
	
	/**
	 * Attempts to deliver any sms messages in the queue.
	 */
	public static function processQueue() {
		
	}
	
}