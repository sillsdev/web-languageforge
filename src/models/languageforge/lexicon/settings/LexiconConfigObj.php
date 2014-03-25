<?php

namespace models\languageforge\lexicon\settings;

class LexiconConfigObj {

	// config types
	const FIELDLIST = 'fields';
	const MULTITEXT = 'multitext';
	const OPTIONLIST = 'optionlist';
	
	// fields
	const LEXEME = 'lexeme';
	const DEFINITION = 'definition';
	const GLOSS = 'gloss';
	const POS = 'partOfSpeech';
	const SEMDOM = 'semanticDomain';
	const EXAMPLE_SENTENCE = 'sentence';
	const EXAMPLE_TRANSLATION = 'translation';

	// field lists
	const SENSES_LIST = 'senses';
	const EXAMPLES_LIST = 'examples';

	// comments
	const COMMENTS_LIST = 'comments';
	const REPLIES_LIST = 'replies';
	
	/**
	 * @var string
	 */
	public $type;
	
	/**
	 * @var boolean
	 */
	public $visible;

	/**
	 * @var array
	 */
	private $_privateProperties;
	
	/**
	 * @var array
	 */
	private $_readOnlyProperties;
	
	protected function setReadOnlyProp($propertyName) {
		if (!is_array($this->_readOnlyProperties)) {
			$this->_readOnlyProperties = array();
		}
		if (!in_array($propertyName, $this->_readOnlyProperties)) {
			$this->_readOnlyProperties[] = $propertyName;
		}
	}
	protected function setPrivateProp($propertyName) {
		if (!is_array($this->_privateProperties)) {
			$this->_privateProperties = array();
		}
		if (!in_array($propertyName, $this->_privateProperties)) {
			$this->_privateProperties[] = $propertyName;
		}
	}
	
	public function getReadOnlyProperties() {
		return $this->_readOnlyProperties;
	}
	
	public function getPrivateProperties() {
		return $this->_privateProperties;
	}
	
}


?>
