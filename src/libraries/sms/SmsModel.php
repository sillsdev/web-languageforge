<?php
namespace libraries\sms;

use models\mapper\IdReference;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;

class SmsModel extends MapperModel
{
	
	const SMS_NEW     = 'new';
	const SMS_SENDING = 'sending';
	const SMS_FAIL    = 'fail';
	
	const SMS_TWILIO  = 'twilio';
	
	public function __construct($id = '') {
		$this->id = new Id();
		$this->dateCreated = new \DateTime();
		$this->dateSent = new \DateTime();
		parent::__construct(self::mapper(), $id);
	}
	
	/**
	 * @return \models\mapper\MongoMapper>
	 */
	public static function mapper() {
		static $instance = null;
		if (null === $instance) {
			$instance = new MongoMapper(SF_DATABASE, 'sms');
		}
		return $instance;
	}
	
	public static function remove($id) {
		self::mapper()->remove($id);
	}

	/**
	 * @var Id
	 */
	public $id;

	/**
	 * @var IdReference
	 */
	public $userRef;

	/**
	 * @var string
	 */
	public $userName;
	
	/**
	 * @var string
	 */
	public $from;

	/**
	 * @var string
	 */
	public $to;

	/**
	 * @var string
	 */
	public $message;
	
	/**
	 * @var string
	 */
	public $state;
	
	/**
	 * @var string
	 */
	public $error;
	
	/**
	 * @var \DateTime
	 */
	public $dateCreated;
	
	/**
	 * @var \DateTime
	 */
	public $dateSent;
	
	/**
	 * @var string
	 */
	public $provider;
	
	/**
	 * @var string
	 */
	public $providerInfo;
	
}

?>
