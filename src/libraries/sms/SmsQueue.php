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
		
		/* Not exactly sure as to what constitutes the various failure modes.  For now dump the message response to the log.
		 * As we know more we can 'white list' the codes and handle them gracefully here.
		 */
		error_log(var_export($message, true));
// 		var_dump($message);
		
		// Update the state
		$smsModel->state = SmsModel::SMS_SENT;
		$smsModel->write();
		
	}
	
	/**
	 * Attempts to deliver any sms messages in the queue.
	 * @param string $databaseName
	 */
	public static function processQueue($databaseName) {
		// TODO Async
		$queue = new SmsQueueModel($databaseName);
		$queue->readNew();
		foreach ($queue->entries as $sms) {
			self::deliver($sms);
		}
	}
	
	public static function queue($smsModel) {
		$smsModel->write();
	}
}

?>