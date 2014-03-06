<?php

namespace models\scriptureforge\dto;

class UsxHelper {
	
	private $_parser;
	
	private $_usx;
	
	private $_out;
	
	private $_tagStack;
	
	
	/**
	 * 
	 * @var array
	 */
	private $_info;
	
	// States
	private $_stateCData;
	
	public function __construct($usx) {
		$this->_usx = $usx;
		$this->_parser = xml_parser_create('UTF-8');
		xml_set_object($this->_parser, $this);
		xml_set_element_handler($this->_parser, "onTagOpen", "onTagClose");
		xml_set_character_data_handler($this->_parser, "onCData");
		$this->_info = array(
			'startChapter' => null,
			'startVerse' => null,
			'endChapter' => null,
			'endVerse' => null,
			'bookCode' => null
		);
	}
	
	public function toHtml() {
		$this->_out = '';
		$this->_tagStack = array();
		$this->_stateCData = false;
		xml_parse($this->_parser, $this->_usx);
		//echo $this->_out;
		return $this->_out;
	}
	
	public function getMetadata() {
		if (is_null($this->_info['startChapter'])) {
			// parse the USX if we haven't already
			$this->toHtml();
		}
		return $this->_info;
	}
	
	private function onTagOpen($parser, $tag, $attributes) {
		array_push($this->_tagStack, $tag);
		switch ($tag) {
			case 'PARA':
				$this->onParagraphOpen($attributes['STYLE']);
				break;
			case 'VERSE':
				$this->onVerse($attributes['NUMBER'], $attributes['STYLE']);
				break;
			case 'CHAPTER':
				$this->onChapter($attributes['NUMBER'], $attributes['STYLE']);
				break;
			case 'CHAR':
				$this->onChar($attributes['STYLE']);
				break;
			case 'BOOK':
				$this->onBook($attributes['CODE']);
				break;
			default:
// 				echo 'to:';
// 				var_dump($tag, $attributes);
				
		}
	}
	
	private function onTagClose($parser, $tag) {
		switch ($tag) {
			case 'PARA':
				$this->onParagraphClose();
				break;
			case 'CHAPTER':
			case 'VERSE':
			case 'CHAR':
				break;
			default:
// 				echo 'tc:';
// 				var_dump($tag);
				
		}
		array_pop($this->_tagStack);
	}
	
	private function onCData($parser, $cdata) {
// 		echo 'cd:';
// 		var_dump($cdata);
		if ($this->_stateCData) {
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
		if ($style != 'p') {
			$this->_out .= "<p class=\"$style\">";
		} else {
			$this->_out .= "<p>";
		}
	}
	
	private function onParagraphClose() {
		$this->_out .= "</p>";
		$this->_stateCData = false;
	}
	
	private function onChapter($number, $style) {
		if (is_null($this->_info['startChapter'])) {
			$this->_info['startChapter'] = $number;
		}
		$this->_info['endChapter'] = $number;
		$this->_out .= "<div class=\"$style\">Chapter $number</div>";
	}
	
	private function onVerse($number, $style) {
		if (is_null($this->_info['startVerse'])) {
			$this->_info['startVerse'] = $number;
		}
		$this->_info['endVerse'] = $number;
		$this->_out .= "<sup>$number</sup>";
	}
	
	private function onChar($style) {
		
	}
	
	private function onBook($code) {
		$this->_info['bookCode'] = $code;
	}
	
}

?>