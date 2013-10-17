<?php
namespace models;

use models\mapper\IdReference;

use models\mapper\MongoMapper;
use models\mapper\MapperModel;
use models\mapper\Id;

class EmailSettings
{
	
	public function __construct() {
	}

	/**
	 * @var string
	 */
	public $fromAddress;
		
	/**
	 * @var string
	 */
	public $fromName;
}

?>
