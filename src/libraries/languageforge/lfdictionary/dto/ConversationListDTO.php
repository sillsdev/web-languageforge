<?php

namespace libraries\lfdictionary\dto;

// TODO Delete. Superceded by SF Q&A.  CP 2013-12
class ConversationListDTO {
	
	/**	 
	 * @var array
	 */
	var $_conversationList;
	
	function __construct() {		
		$this->_conversationList = array();
	}
	
	
	
	/**
	 * @param ConversationDTO $conversation
	 */
	function addConversation($conversation) {	
		$this->_conversationList[] = $conversation;
	}
	
	/**
	* @param Array $conversationArray
	*/
	function setConversationArray($conversationArray) {
		$this->_conversationList = $conversationArray;
	}
	
	/**
	 * Encodes the ConversationDTO into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		$conversations = array();
		foreach ($this->_conversationList as $conversation) {		
			$conversations[] = $conversation->encode();
		}
		return array(
			"entries" => $conversations
		);		
	}
}
?>