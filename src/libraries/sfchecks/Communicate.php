<?php
namespace libraries\sfchecks;

use models\UserModel;
use models\ProjectModel;
use libraries\sms\SmsModel;
use libraries\sms\SmsQueue;

class CommunicateDelivery implements IDelivery
{
	public function sendEmail($user, $project, $content) {
		$from = array('no-reply@scriptureforge.org' => 'ScriptureForge'); // TODO get this out of the projectModel. I think CH has it there now.CP 2013-10
		$to = array($userModel->email => $userModel->name);
		Email::send($from, $to, $content);
	}
	
	public function sendSms($smsModel) {
		SmsQueue::queue($smsModel);
	}
	
}

class CommunicateHelper
{
	/**
	 * @param UserModel $userModel
	 * @return string
	 */
	public static function addValidateKeyToUser($userModel) {
		$key = sha1(microtime(true).mt_rand(10000,90000));
		$userModel->validationKey = $key;
		$userModel->validationDate = new \DateTime();
	}

	/**
	 *
	 * @param string $fileName
	 * @return \Twig_Template
	 */
	public static function template($fileName) {
		$loader = new \Twig_Loader_Filesystem(APPPATH . '/views');
		if (defined('TestMode')) {
			$options = array();
		} else {
			$options = array(
					'cache' => APPPATH . '/cache',
			);
		}
		$twig = new \Twig_Environment($loader, $options);
		$template = $twig->loadTemplate($fileName);
		return $template;
	}

	public static function render($template, $context) {
		if (defined('TestMode')) {
			$options = array();
		} else {
			$options = array(
					'cache' => APPPATH . '/cache',
			);
		}
		$loader = new \Twig_Loader_String();
		$twig = new \Twig_Environment($loader, $options);
		return $twig->render($template, $context);
	}

}

class Communicate 
{
	public static function communicateToUsers($users, $project, $smsTemplate, $emailTemplate) {
		foreach ($users as $user) {
			self::communicateToUser($user, $project, $smsTemplate, $emailTemplate);
		}
	}
	
	/**
	 * 
	 * @param UserModel $user
	 * @param ProjectModel $project
	 * @param string $smsTemplate
	 * @param string $emailTemplate
	 * @param IDelivery $delivery
	 */
	public static function communicateToUser($user, $project, $smsTemplate, $emailTemplate, IDelivery $delivery = null) {
		// Create our default delivery mechanism if one is not passed in.
		if ($delivery == null) {
			$delivery = new IDelivery();
		}
		
		// Prepare the email message if required
		if ($user->communicate_via == UserModel::COMMUNICATE_VIA_EMAIL || $user->communicate_via == UserModel::COMMUNICATE_VIA_BOTH) {
			
		
			// Deliver the email message
			$delivery->sendEmail($user, $project, $content);
		}
		
		// Prepare the sms message if required
		if ($user->communicate_via == UserModel::COMMUNICATE_VIA_SMS || $user->communicate_via == UserModel::COMMUNICATE_VIA_BOTH) {
			$databaseName = $project->databaseName();
			$sms = new SmsModel($databaseName);
			$sms->providerInfo = $project->smsSettings->accountId;	// TODO: use project providerInfo
			$sms->to = $user->mobile_phone;
			$sms->from = $project->projectname;	// TODO: use project 'from' number when added to model
			$vars = array(
				'user' => $user,
				'project' => $project
			);
			$sms->message = CommunicateHelper::render($smsTemplate, $vars);
				
			// Deliver the sms message
			$delivery->sendSMS($sms);
		}
		
	}
	
}

?>