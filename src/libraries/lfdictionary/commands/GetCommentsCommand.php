<?php

namespace libraries\lfdictionary\commands;

require_once (dirname ( __FILE__ ) . '/../Config.php');

use libraries\lfdictionary\common\LoggerFactory;

class GetCommentsCommand {
	
	// if need to change follow definations, please change client side too.
	public static $TYPE_UNDEFINED = "undefined";
	public static $TYPE_QUESTION = "question";
	public static $TYPE_MERGECONFLICT = "mergeConflict";
	public static $STATUS_UNDEFINED = "undefined";
	public static $STATUS_CLOSED = "closed";
	public static $STATUS_REVIEWED = "reviewed";
	public static $STATUS_TODO = "todo";
	var $_fileName;
	var $_status;
	var $_type;
	var $_startIndex;
	var $_limitation;
	var $_sortType;
	function __construct($fileName, $status, $type, $startIndex, $limitation, $sortType) {
		// if (!file_exists($fileName))
		// {
		// throw new \Exception('ChorusNotes file is missing on server: ' . $fileName);
		// }
		$this->_fileName = $fileName;
		$this->_status = $status;
		$this->_type = $type;
		$this->_startIndex = $startIndex;
		$this->_limitation = $limitation;
		$this->_sortType = $sortType;
	}
	function sort_entries_by_message_date($a, $b) {
		$datetimeStringLeft = $a->getAttributeNode ( "date" )->value;
		$datetimeStringRight = $b->getAttributeNode ( "date" )->value;
		$datetimeLeft = strtotime ( $datetimeStringLeft );
		$datetimeRigth = strtotime ( $datetimeStringRight );
		return $datetimeRigth - $datetimeLeft;
	}
	function execute() {
		$this->processFile ();
		return $this->_dto;
	}
	function processFile() {
		$this->_dto = new \libraries\lfdictionary\dto\ConversationListDTO ();
		if (file_exists ( $fileName )) {
			
			$doc = new \DOMDocument ();
			$doc->preserveWhiteSpace = false;
			$doc->Load ( $this->_fileName );			
			$xpath = new \DOMXPath ( $doc );
			
			if ($this->_type == GetCommentsCommand::$TYPE_QUESTION) {
				$entries = $xpath->query ( '//notes/annotation[@class="' . GetCommentsCommand::$TYPE_QUESTION . '"]' );
			} else if ($this->_type == GetCommentsCommand::$TYPE_MERGECONFLICT) {
				$entries = $xpath->query ( '//notes/annotation[@class="' . GetCommentsCommand::$TYPE_MERGECONFLICT . '"]' );
			} else {
				// undefined
				$entries = $xpath->query ( '//notes/annotation' );
			}
			
			$closedList = array ();
			
			if ($this->_status == GetCommentsCommand::$STATUS_CLOSED /*|| $this->_status==GetCommentsCommand::$STATUS_REVIEWED*/)
		{
				$closedListEntries = $xpath->query ( '//notes/annotation/message[@status="' . GetCommentsCommand::$STATUS_CLOSED . '"]' );
				
				foreach ( $closedListEntries as $closedEntry ) {
					$guidValue = $closedEntry->parentNode->getAttributeNode ( "guid" )->value;
					$closedList [$guidValue] = $guidValue;
				}
			}
			
			$unsortedConversationArray = array ();
			
			foreach ( $entries as $entry ) {
				if ($this->_status == GetCommentsCommand::$STATUS_CLOSED) {
					if (! array_key_exists ( $entry->getAttributeNode ( "guid" )->value, $closedList )) {
						continue;
					}
				} 				/*
				   * else if($this->_status==GetCommentsCommand::$STATUS_REVIEWED){ if (array_key_exists($entry->getAttributeNode ("guid")->value,$closedList)) { continue; } }
				   */
				else {
					// undefined
				}
				$convDto = new \libraries\lfdictionary\dto\ConversationDTO ();
				$convDto->setClass ( $entry->getAttributeNode ( "class" )->value );
				$convDto->setGuid ( $entry->getAttributeNode ( "guid" )->value );
				$convDto->setReference ( $entry->getAttributeNode ( "ref" )->value );
				$convDto->setAuthor ( "" );
				$convDto->setDate ( "" );
				$convDto->setComment ( "" );
				$convDto->setStatus ( "" );
				foreach ( $entry->childNodes as $childNode ) {
					$childDto = new \libraries\lfdictionary\dto\ConversationDTO ();
					$childDto->setClass ( "" );
					$childDto->setReference ( "" );
					$childDto->setGuid ( $childNode->getAttributeNode ( "guid" )->value );
					$childDto->setAuthor ( $childNode->getAttributeNode ( "author" )->value );
					$childDto->setDate ( strtotime ( $childNode->getAttributeNode ( "date" )->value ) );
					$childDto->setComment ( $childNode->nodeValue );
					$childDto->setStatus ( $childNode->getAttributeNode ( "status" )->value );
					// TODO cyu check for null
					// $childDto->setStatusResolved($childNode->getAttributeNode ("status.resolved")->value);
					// $childDto->setStatusReviewed($childNode->getAttributeNode ("status.reviewed")->value);
					// $childDto->setStatusTodo($childNode->getAttributeNode ("status.todo")->value);
					$convDto->add ( $childDto );
				}
				// $this->_dto->addConversation($convDto);
				$unsortedConversationArray [$entry->getAttributeNode ( "guid" )->value] = $convDto;
			}
			
			if ($this->_sortType == "1") {
				// need soted by recent changes
				$sortedMessages = $this->getAllDataSorted ( $doc, "//notes/annotation/message" );
				$sortedConversationArray = array ();
				foreach ( $sortedMessages as $messageNode ) {
					$key = $messageNode->parentNode->getAttributeNode ( "guid" )->value;
					if (array_key_exists ( $key, $unsortedConversationArray )) {
						$sortedConversationArray [$key] = $unsortedConversationArray [$key];
					}
				}
				
				$this->_dto->setConversationArray ( $this->getArrayRange ( $sortedConversationArray, $this->_startIndex, $this->_limitation ) );
			} else {
				$this->_dto->setConversationArray ( $this->getArrayRange ( $unsortedConversationArray, $this->_startIndex, $this->_limitation ) );
			}
		}
	}
	function getAllDataSorted($doc, $xpathQueryString) {
		$xpath = new \DOMXPath ( $doc );
		// $entries = $xpath->query('//notes/annotation/message');
		$entries = $xpath->query ( $xpathQueryString );
		$entriesArray = array ();
		foreach ( $entries as $entry ) {
			// put into array for soting
			$entriesArray [$entry->parentNode->getAttributeNode ( "guid" )->value] = $entry;
		}
		usort ( $entriesArray, array (
				$this,
				"sort_entries_by_message_date" 
		) );
		return $entriesArray;
	}
	function getArrayRange($array, $startIndex, $limits) {
		return array_slice ( $array, $startIndex, $limits );
	}
}
?>