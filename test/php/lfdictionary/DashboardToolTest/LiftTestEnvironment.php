<?php

function recursiveDelete($str) {
	if(is_file($str)) {
		return @unlink($str);
	} elseif(is_dir($str)) {
		$str = rtrim($str, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
		$objects = scandir($str);
		foreach ($objects as $object) {
			if ($object === "." || $object === "..") {
				continue;
			}
			recursiveDelete($str . $object);
		}
		reset($objects);
		@rmdir($str);
	}
}

class LiftTestEnvironment {

	/**
	 * @var string
	 */
	var $_path;
	var $_liftFilePath;

	function __construct() {

		$a = func_get_args();
		$i = func_num_args();
		if ($i==1) {
			// use user spacified file name
			if (method_exists($this,$f='__construct'.$i)) {
				call_user_func_array(array($this,$f),$a);
			}
		} else {
			// use default test file name
			$this->_path = sys_get_temp_dir() . '/LiftTestEnvironment';
			// don't do it! this will let we can create only on file there
			//recursiveDelete($this->_path);
			if (!file_exists($this->_path)) {
				mkdir($this->_path);
			}
			$this->_liftFilePath = $this->_path . '/Test.lift';
			if (file_exists($this->_liftFilePath)) {
				unlink($this->_liftFilePath);
			}
		}
	}

	function __construct1($fileName) {
		$this->_path = sys_get_temp_dir() . '/LiftTestEnvironment';
		// don't do it! this will let we can create only on file there
		///recursiveDelete($this->_path);
		if (file_exists($this->_path . '/' . $fileName)) {
			unlink($this->_path);
		}
		$this->_liftFilePath = $this->_path . '/' . $fileName;
	}

	/**
	 * Deletes everything in the folder
	 */
	function dispose() {
		recursiveDelete($this->_path);
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


	function createLiftWith($entryCount, $wordFormCount, $senseCount, $definitionFormCount, $postofspeech, $exampleCount, $exampleFormCount) {
		$writer = new XMLWriter();
		$writer->openUri($this->getLiftFilePath());
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
					if ($postofspeech > 0) {
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

	function writeMultiText($writer, $tagName, $prefix, $formCount) {
		for ($i = 0; $i < $formCount; $i++) {
			$writer->startElement($tagName);
			$writer->writeAttribute('lang', "qaa-x-$i");
			$writer->writeElement('text', $prefix . "text $i");
			$writer->endElement();
		}
	}

	// Creating Dynamic Xml for Auto Search
	function createEntriesWith($words, $wordFormCount) {
		$writer = new XMLWriter();
		$writer->openUri($this->getLiftFilePath());
		$writer->startElement('lift');
		//$words = $word;
		for ($entryIndex = 0; $entryIndex < count($words); $entryIndex++) {
			$writer->startElement('entry');
			$writer->writeAttribute('guid', "guid$entryIndex");
			if ($wordFormCount > 0) {
				$writer->startElement('lexical-unit');
				$this->autoMultiText($writer, 'form', "$words[$entryIndex] ", $wordFormCount);
				$writer->endElement();
			}

			$writer->endElement(); // 'entry'
		}
		$writer->endElement(); // 'lift'
		$writer->endDocument();
	}

	function autoMultiText($writer, $tagName, $prefix, $formCount) {
		for ($i = 0; $i < $formCount; $i++) {
			$writer->startElement($tagName);
			$writer->writeAttribute('lang', "IPA");
			$writer->writeElement('text', $prefix);
			$writer->endElement();
		}
	}
}
?>