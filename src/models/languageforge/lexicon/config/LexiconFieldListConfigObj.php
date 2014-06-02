<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexiconFieldListConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::FIELDLIST;
		$this->fieldOrder = new ArrayOf();
		$this->fields = new MapOf(
			function($data) {
				switch ($data['type']) {
					case LexiconConfigObj::FIELDLIST:
						return new LexiconFieldListConfigObj();
					case LexiconConfigObj::MULTITEXT:
						return new LexiconMultitextConfigObj();
					case LexiconConfigObj::OPTIONLIST:
						return new LexiconOptionlistConfigObj();
				}
			}
		);
	}
	
	public $fieldOrder;
	
	/**
	 * @var MapOf<LexiconConfigObj>
	 */
	public $fields;
	
}

?>
