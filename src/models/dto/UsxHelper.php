<?php

namespace models\dto;

class UsxHelper {
	
	private $_parser;
	
	private $_usx;
	
	public function __construct($usx) {
		$this->_usx = $usx;
		$this->_parser = xml_parser_create();
		xml_set_object($this->_parser, $this);
		xml_set_element_handler($this->_parser, "onTagOpen", "onTagClose");
		xml_set_character_data_handler($this->_parser, "onCData");
	}
	
	public function toHtml() {
		xml_parse($this->_parser, $this->_usx);		
	}
	
	private function onTagOpen($parser, $tag, $attributes) {
		var_dump('to ', $tag, $attributes);
	}
	
	private function onTagClose($parser, $tag) {
		var_dump('tc ', $tag);
	}
	
	private function onCData($parser, $cdata) {
		var_dump('cd ', $cdata);
	}
	
}

?>