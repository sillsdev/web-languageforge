<?php 
namespace models\languageforge\lexicon;

class LexEntryListModel extends \models\mapper\MapperListModel {

	public function __construct($projectModel) {
		parent::__construct(
				LexEntryModelMongoMapper::connect($projectModel->databaseName()),
				array(), array('guid', 'lexeme')
		);
	}

}

?>