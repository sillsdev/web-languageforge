<?php
namespace libraries\sfchecks;

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
		
	}
	
	/**
	 * Attempts to deliver any sms messages in the queue.
	 */
	public static function processQueue() {
		
	}
	
}