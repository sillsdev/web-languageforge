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
	
	/**
	 * @param UserModel $userModel
	 * @param string $content
	 */
	public function send() {
		// Create the Transport
		$transport = \Swift_SmtpTransport::newInstance('smtp.example.org', 25)
			->setUsername('your username')
			->setPassword('your password')
			;
		
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

class EmailHelper
{
	/**
	 * @param UserModel $userModel
	 * @return string
	 */
	public static function addValidateKeyToUser($userModel) {
		$key = sha1(microtime(true).mt_rand(10000,90000));
		$userModel->validationKey = $key;
		$userModel->validationDate = new \DateTime();
		$userModel->write();
	}
	
	/**
	 * 
	 * @param string $name
	 * @return \Twig_Template
	 */
	public static function template($name) {
		$loader = new \Twig_Loader_Filesystem(APPPATH . '/views');
		if (defined('TestMode')) {
			$options = array();
		} else {
			$options = array(
				'cache' => APPPATH . '/cache',
			);
		}
		$twig = new \Twig_Environment($loader, $options);
		$template = $twig->loadTemplate($name);
		return $template;
	}
	
}

class Email
{
	/**
	 * Send an email to validate a user when they sign up.
	 * @param string $userId
	 * @param SwiftMailer $mailer
	 */
	public static function sendSignup($userId, $mailer = null) {
		$userModel = new UserModel($userId);
		EmailHelper::addValidateKeyToUser($userModel);
		$vars = array(
			'user' => $userModel,
			'link' => 'http://' . $_SERVER['SERVER_NAME'] . '/validate/' . $userModel->validationKey,
		);
		$t = EmailHelper::template('email/en/SignupValidate.html');
		$html = $t->render($vars);
		
		$mailer->setFrom(array('no-reply@scriptureforge.org' => 'ScriptureForge')); // TODO put this in the sf config CP 2013-10
		$mailer->setTo(array($userModel->email => $userModel->name));
		$mailer->setBody($html);
		$mailer->send();
	}
	
	public static function sendSignupWithProject() {
		
	}
	
}