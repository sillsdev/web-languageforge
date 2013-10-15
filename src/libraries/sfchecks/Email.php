<?php
namespace libraries\sfchecks;

use models\UserModel;

class EmailSwiftMailWrapper
{

	private $_to;
	private $_from;
	private $_body;
	
	public function setTo($to) {
		$this->_to = $to;
	}
	
	public function setFrom($from) {
		$this->_from = $from;
	}
	
	public function setBody($body) {
		$this->_body = $body;
	}
	
	public function send() {
		// Create the Transport
		$transport = \Swift_SmtpTransport::newInstance('localhost', 25);
// 			->setUsername('your username')
// 			->setPassword('your password')
// 			;
		
		// Create the Mailer using your created Transport
		$mailer = \Swift_Mailer::newInstance($transport);
		
		// Create a message
		$message = \Swift_Message::newInstance('Wonderful Subject');
		$message->setFrom($this->_from);
		$message->setTo($this->_to);
		$message->setBody($this->_body);
		
		// Send the message
		$result = $mailer->send($message);	
		
	}
}

class Email
{
	/**
	 * Send an email to validate a user when they sign up.
	 * @param UserModel $userModel
	 * @param SwiftMailer $mailer
	 */
	public static function sendSignup($userModel, $mailer = null) {
		EmailHelper::addValidateKeyToUser($userModel);
		$vars = array(
			'user' => $userModel,
			'link' => 'http://' . $_SERVER['SERVER_NAME'] . '/validate/' . $userModel->validationKey,
		);
		$t = EmailHelper::template('email/en/SignupValidate.html');
		$html = $t->render($vars);
		self::send(
			array('no-reply@scriptureforge.org' => 'ScriptureForge'),
			array($userModel->email => $userModel->name),
			$html,
			$mailer
		);
	}
	
	public static function sendSignupWithProject() {
		
	}

	public static function send($from, $to, $content, $mailer = null) {
		if ($mailer == null) {
			$mailer = new EmailSwiftMailWrapper();
		}
		$mailer->setFrom($from); // TODO put this in the sf config CP 2013-10
		$mailer->setTo($to);
		$mailer->setBody($content);
		$mailer->send();
	}
}