<?php
namespace libraries\sfchecks;

interface IDelivery {
	
	public function sendEmail($user, $project, $content);
	
	public function sendSms($smsModel);
	
}

?>