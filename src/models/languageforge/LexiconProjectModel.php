<?php

namespace models\languageforge;

class LexiconProjectModel extends LfProjectModel {
	public function __construct($id = '') {
		parent::__construct($id);
		$this->appName = LfProjectModel::LEXICON_APP;
	}
}
?>