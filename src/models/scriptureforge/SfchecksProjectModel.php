<?php

namespace models\scriptureforge;

class SfchecksProjectModel extends SfProjectModel {
	public function __construct($id = '') {
		parent::__construct($id);
		$this->appName = SfProjectModel::SFCHECKS_APP;
	}
}
?>