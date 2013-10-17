<?php
namespace libraries\sfchecks;

interface IDelivery {
	
	public function sendEmail($from, $to, $subject, $content);
	
	public function sendSms($smsModel);
	
}

?>