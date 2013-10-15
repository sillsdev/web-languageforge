<?php
namespace libraries\sms;

use models\mapper\IdReference;
use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;

/**
 * Manages the SMS queue.
 */
class SmsQueue
{

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

?>