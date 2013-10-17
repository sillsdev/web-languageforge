<?php
namespace libraries\sms;

use models\mapper\IdReference;
use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;
use libraries\palaso\CodeGuard;

class SmsModel extends MapperModel
{
	
	const SMS_NEW     = 'new';
	const SMS_SENDING = 'sending';
	const SMS_FAIL    = 'fail';
	
	const SMS_TWILIO  = 'twilio';
	
	/**
	 * @param string $database
	 * @param string $id
	 */
	public function __construct($databaseName, $id = '') {
		$this->id = new Id();
		$this->dateCreated = new \DateTime();
		$this->dateSent = new \DateTime();
		$this->provider = self::SMS_TWILIO;
		parent::__construct(SmsMongoMapper::connect($databaseName), $id);
	}
	
	public static function remove($databaseName, $id) {
		SmsMongoMapper::connect($databaseName)->remove($id);
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
