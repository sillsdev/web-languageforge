<?php

namespace models\dto;

class UsxTrimHelper {
	private $_parser;
	private $_usx;
	private $_out;
	private $_tagStack;

	// States
	private $_stateCData;
	private $_stateDrop;
	private $_currentChapter;
	private $_currentVerse;

	// Start and end are both inclusive
	private $_startChapter;
	private $_startVerse;
	private $_endChapter;
	private $_endVerse;

	public function __construct($usx, $startCh, $startVs, $endCh, $endVs) {
		$this->_usx = $usx;

		// Empty strings or nulls will become 0, which is perfect for start chapters/verses
		$this->_startChapter = (int)$startCh;
		$this->_startVerse = (int)$startVs;
		// But for end chapters/verses, we should use MAXINT for empty/null
		$this->_endChapter = (int)$endCh;
		$this->_endVerse = (int)$endVs;
		if ($this->_endChapter == 0) {
			$this->_endChapter = PHP_INT_MAX;
		}
		if ($this->_endVerse == 0) {
			$this->_endVerse = PHP_INT_MAX;
		}

		$this->_parser = xml_parser_create('UTF-8');
		xml_set_object($this->_parser, $this);
		xml_set_element_handler($this->_parser, "onTagOpen", "onTagClose");
		xml_set_character_data_handler($this->_parser, "onCData");
	}

	public function toHtml() {
		$this->_out = '';
		$this->_tagStack = array();
		$this->_stateCData = false;
		// Keep all front matter; only start dropping when first chapter tag reached
		$this->_stateDrop = false;
		xml_parse($this->_parser, $this->_usx);
		//echo $this->_out;
		return $this->_out;
	}

	private function onTagOpen($parser, $tag, $attributes) {
		array_push($this->_tagStack, $attributes);
		array_push($this->_tagStack, $tag);
		switch ($tag) {
			case 'VERSE':
				$this->onVerse($attributes['NUMBER'], $attributes['STYLE']);
				break;
			case 'CHAPTER':
				$this->onChapter($attributes['NUMBER'], $attributes['STYLE']);
				break;
			default:
// 				echo 'to:';
// 				var_dump($tag, $attributes);

		}
	}

	private function onTagClose($parser, $tag) {
		switch ($tag) {
			case 'PARA':
			case 'CHAPTER':
			case 'VERSE':
			case 'CHAR':
				break;
			default:
// 				echo 'tc:';
// 				var_dump($tag);

		}
		$storedTag = array_pop($this->_tagStack);
		// Compare $tag to $storedTag?
		$attributes = array_pop($this->_tagStack);
	}

	private function onCData($parser, $cdata) {
// 		echo 'cd:';
// 		var_dump($cdata);
		if ($this->_stateCData && !$this->_stateDrop) {
			$this->_out .= $cdata;
		}
	}

	// Handlers
	private function onParagraphOpen($style) {
		if ($style == 'ide') {
			$this->_stateCData = false;
			return;
		}
		$this->_stateCData = true;
		if (!$this->_stateDrop) {
			if ($style != 'p') {
				$this->_out .= "<p class=\"$style\">";
			} else {
				$this->_out .= "<p>";
			}
		}
	}

	private function onParagraphClose() {
		if (!$this->_stateDrop) {
			$this->_out .= "</p>";
		}
		$this->_stateCData = false;
	}

	private function startDropping() {
		$this->_stateDrop = true;
	}

	private function stopDropping() {
		$oldstate = $this->_stateDrop;
		if ($oldstate) {
			// We just went from "drop" to "don't drop", so we need to
			// reconstruct the tag stack that should have gone before
			// this element.
			ob_start();
			var_dump($this->_tagStack);
			$foo = ob_get_clean();
			$this->_out .= $foo;
		}
		$this->_stateDrop = false;
	}

	private function setDropStateByChapter() {
		if (($this->_currentChapter < $this->_startChapter) ||
		    ($this->_currentChapter > $this->_endChapter)) {
			$this->startDropping();
		}
		if (($this->_currentChapter > $this->_startChapter) &&
		    ($this->_currentChapter < $this->_endChapter)) {
			$this->stopDropping();
		}
	}

	private function setDropStateByVerse() {
		if (($this->_currentChapter == $this->_startChapter) ||
		    ($this->_currentChapter == $this->_endChapter)) {
				// Boundary chapter; need to check verses
				if (($this->_currentVerse < $this->_startVerse) ||
				    ($this->_currentVerse > $this->_endVerse)) {
						$this->_out .= "DEBUG: dropping verse $this->_currentVerse. ";
					$this->startDropping();
				}
				if (($this->_currentVerse >= $this->_startVerse) &&
				    ($this->_currentVerse <= $this->_endVerse)) {
						$this->_out .= "DEBUG: keeping verse $this->_currentVerse. ";
					$this->stopDropping();
				}
		} else {
			// Don't need to check verses in this situation
			$this->setDropStateByChapter();
		}
	}

	private function onChapter($number, $style) {
		$this->_currentChapter = (int)$number;
		$this->setDropStateByChapter();
		if (!$this->_stateDrop) {
			$this->_out .= "<div class=\"$style\">Chapter $number</div>";
			$this->_out .= "(chapter $number)";
		}
	}

	private function onVerse($number, $style) {
		$this->_currentVerse = (int)$number;
		$this->setDropStateByVerse();
		if (!$this->_stateDrop) {
			$this->_out .= "<sup>$number</sup>";
			$this->_out .= "(verse $number)";
		}
	}

	private function onChar($style) {
	}

}

?>
