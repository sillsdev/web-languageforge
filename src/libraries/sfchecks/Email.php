<?php
namespace libraries\sfchecks;

use models\UserModel;

class EmailHelper
{
	/**
	 * @param UserModel $userModel
	 * @return string
	 */
	public static function addValidateTagToUser($userModel) {
		$tag = sha1(microtime(true).mt_rand(10000,90000));
	}
	
	public static function template($name) {
		$m = self::templateEngine();
		return $m->loadTemplate($name);
	}
	
	/**
	 * @return \Mustache_Engine
	 */
	public static function templateEngine() {
		static $instance = null;
		if (null === $instance) {
			$instance = new Mustache_Engine(array(
					'loader' => new Mustache_Loader_FilesystemLoader(APPPATH . 'views/email/en'),
					'partials_loader' => new Mustache_Loader_FilesystemLoader(APPPATH . 'views/email/en/partials')
			));
		}
		return $instance;
	}
	
	public static function send() {
	
	}
	
}

class Email
{
	public static function sendJoin($userId) {
		$t = self::template('SignupValidate.tmpl');
		$userModel = new UserModel($userId);
		$validationKey = $userModel->setValidationKey();
		$vars = array(
			'user' =>$userModel,
			
		);
		
	}
	
	public static function sendJoinWithProject() {
		
	}
	
}