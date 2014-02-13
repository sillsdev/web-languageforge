<?php

namespace libraries\lfdictionary\dto;
class ConversationDTO {

	/**
	 * @var string
	 */
	var $_class;

	/**
	 * @var string
	 */
	var $_guid;


	/**
	 * @var string
	 */
	var $_ref;


	/**
	 * @var string
	 */
	var $_author;

	/**
	 * @var string
	 */
	var $_date;

	/**
	 * @var string
	 */
	var $_comment;

	/**
	 * @var string
	 */
	var $_status;

	/**
	 * @var Array<ConversationDTO>
	 */
	var $_children;

	/**
	 * @var ConversationDTO
	 */
	var $_parent;
	
	/**
	* @var string
	*/
	var $_resolved;
	
	/**
	* @var string
	*/
	var $_reviewed;
	
	/**
	* @var string
	*/
	var $_todo;

	/**
	 * @param String $guid
	 */
	function setClass($class) {
		$this->_class = $class;
	}

	/**
	 * @param String $guid
	 */
	function setGuid($guid) {
		$this->_guid = $guid;
	}


	/**
	 * @param String $ref
	 */
	function setReference($ref) {
		$this->_ref = $ref;
	}


	/**
	 * @param String $author
	 */
	function setAuthor($author) {
		$this->_author = $author;
	}


	/**
	 * @param int $date
	 */
	function setDate($date) {
		$this->_date = $date;
	}


	/**
	 * @param String $comment
	 */
	function setComment($comment) {
		$this->_comment = $comment;
	}


	/**
	 * @param String $status
	 */
	function setStatus($status) {
		$this->_status = $status;
	}

	function add($child){
		$this->_children[] = $child;
		$child->setParent($this);
	}

	function setParent($parent){
		$this->_parent = $parent;
	}

	function getParent(){
		return $this->_parent;
	}
	
	function setStatusResolved($resolved) {
		$this->_resolved = $resolved;
	}
	
	function setStatusReviewed($reviewed) {
		$this->_reviewed = $reviewed;
	}
	
	function setStatusTodo($todo) {
		$this->_todo = $todo;
	}


	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {

		$children = array();

		if (count($this->_children)>0){ // fix a runtime warining
			foreach ($this->_children as $child){
				$children[] = $child->encode();
			}
		}

		return array(
			"conclass" => $this->_class,
			"guid" => $this->_guid,
			"ref" => $this->_ref,
			"author" => $this->_author,
			"date" => $this->_date,
			"comment" => $this->_comment,
			"status" => $this->_status,
		    "children" => $children,
		    "status.resolved" => $this->_resolved,
		    "status.reviewed" => $this->_reviewed,
		    "status.todo" => $this->_todo
		);

	}
}

?>