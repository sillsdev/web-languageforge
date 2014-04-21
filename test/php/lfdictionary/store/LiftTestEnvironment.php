<?php

class StoreLiftTestEnvironment {

	/**
	 * @var string
	 */
	private $_path;
	
	/**
	 * @var string
	 */
	private $_liftFilePath;

	private function __construct($path = null) {
		$this->_path = $path;
		if ($this->_path == null) {
			$this->_path = sys_get_temp_dir() . '/StoreLiftTests';
			self::recursiveDelete($this->_path);
		}
		if (!file_exists($this->_path)) {
			mkdir($this->_path);
		}
		$this->_liftFilePath = $this->_path . '/Test.lift';
	}

	public static function create($path = null) {
		return new StoreLiftTestEnvironment($path);
	}
	
	/**
	 * Deletes everything in the folder
	 */
	public function dispose() {
		self::recursiveDelete($this->_path);
	}

	/*
	static private function guid(){
		if (function_exists('com_create_guid')) {
			return com_create_guid();
		} else {
			mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
			$charid = strtoupper(md5(uniqid(rand(), true)));
			$hyphen = chr(45); // '-'
			// 			$uuid = chr(123)   // '{'
			$uuid = substr($charid, 0, 8).$hyphen
			.substr($charid, 8, 4).$hyphen
			.substr($charid,12, 4).$hyphen
			.substr($charid,16, 4).$hyphen
			.substr($charid,20,12);
			// 				.chr(125);// "}"
			return $uuid;
		}
	}
	*/
	
	static private function recursiveDelete($str) {
		if(is_file($str)) {
			return @unlink($str);
		} elseif(is_dir($str)) {
			$str = rtrim($str, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
			$objects = scandir($str);
			foreach ($objects as $object) {
				if ($object === "." || $object === "..") {
					continue;
				}
				self::recursiveDelete($str . $object);
			}
			reset($objects);
			@rmdir($str);
		}
	}
	
	/**
	 * @return string
	 */
	function getLiftFilePath() {
		return $this->_liftFilePath;
	}

	/**
	 * @return string
	 */
	function getPath() {
		return $this->_path;
	}

	public function writeLiftToFile($lift) {
		file_put_contents($this->_liftFilePath, $lift);
	}
	
	public function createLiftWith($entryCount, $wordFormCount, $senseCount, $definitionFormCount, $partOfSpeech, $exampleCount, $exampleFormCount) {
		$writer = new XMLWriter();
		$writer->openUri($this->_liftFilePath);
		$writer->startElement('lift');
		for ($entryIndex = 0; $entryIndex < $entryCount; $entryIndex++) {
			$writer->startElement('entry');
			$writer->writeAttribute('guid', "guid$entryIndex");
			if ($wordFormCount > 0) {
				$writer->startElement('lexical-unit');
				$this->writeMultiText($writer, 'form', "entry $entryIndex ", $wordFormCount);
				$writer->endElement();
			}
			if ($senseCount > 0) {
				for ($senseIndex = 0; $senseIndex < $senseCount; $senseIndex++) {
					$writer->startElement('sense');
					if ($definitionFormCount > 0) {
						$writer->startElement('definition');
						$this->writeMultiText($writer, 'form', "entry $entryIndex sense $senseIndex ", $definitionFormCount);
						$writer->endElement();
					}
					if ($partOfSpeech) {
						$writer->startElement('grammatical-info');
						$writer->writeAttribute('value', "Noun");
						$writer->endElement();
					}
					if ($exampleCount > 0) {
						for ($exampleIndex = 0; $exampleIndex < $exampleCount; $exampleIndex++) {
							$writer->startElement('example');
							$this->writeMultiText($writer, 'form', "entry $entryIndex sense $senseIndex example $exampleIndex ", $exampleFormCount);
							$writer->startElement('translation');
							$this->writeMultiText($writer, 'form', "entry $entryIndex sense $senseIndex translation $exampleIndex ", $exampleFormCount);
							$writer->endElement(); // 'translation'
							$writer->endElement(); // 'example'
						}
					}
					$writer->endElement(); // 'sense'
				}
			}
			$writer->endElement(); // 'entry'
		}
		$writer->endElement(); // 'lift'
		$writer->endDocument();
	}

	private function writeMultiText($writer, $tagName, $prefix, $formCount) {
		for ($i = 0; $i < $formCount; $i++) {
			$writer->startElement($tagName);
			$writer->writeAttribute('lang', "qaa-x-$i");
			$writer->writeElement('text', $prefix . "text $i");
			$writer->endElement();
		}
	}
	
	function getCurrentHash() {
		return '1111';
	}

}

?>