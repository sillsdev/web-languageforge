<?php
namespace libraries\sms;

use models\mapper\MapOf;

class SmsQueueModel extends \models\mapper\MapperListModel
{

	public function __construct($databaseName) {
		$this->entries = new MapOf(function($data) use ($databaseName) { return new SmsModel($databaseName); });
		parent::__construct(
			SmsMongoMapper::connect($databaseName),
			array('state' => array('$in' => $state))
		);
	}
	
	public function readNew() {
		$query = array('state' => array('$in' => SmsModel::SMS_NEW));
		return $this->_mapper->readListAsModels($this, $query, null);
	}
	
}

?>