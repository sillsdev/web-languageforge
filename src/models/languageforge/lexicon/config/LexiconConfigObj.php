<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ObjectForEncoding;

class LexiconConfigObj extends ObjectForEncoding {

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

}

?>
