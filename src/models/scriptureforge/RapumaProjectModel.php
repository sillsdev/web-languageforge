<?php

namespace models\scriptureforge;

class RapumaProjectModel extends SfProjectModel {
	public function __construct($id = '') {
		parent::__construct($id);
		$this->appName = SfProjectModel::RAPUMA_APP;
	}
}
?>