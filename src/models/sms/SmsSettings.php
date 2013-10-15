<?php
namespace models\sms;

use models\mapper\IdReference;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;

class SmsSettings
{
	
	public function __construct() {
	}
	
	/**
	 * @var string
	 */
	public $accountId;
	
	/**
	 * @var string
	 */
	public $authToken;
	
	/**
	 * 
	 * @var string
	 */
	public $fromNumber;
}

?>
