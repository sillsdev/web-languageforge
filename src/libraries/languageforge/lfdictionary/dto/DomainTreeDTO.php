<?php
namespace libraries\lfdictionary\dto;

// TODO Refactor. Conflate with the similarly named command which should be the dto. The encdoing should become trivial with JsonEncoder CP 2013-12
class DomainTreeDTO{
	
	/**
	 * @var String
	 */
	var $_domainKey;
	
	/**
	* @var String
	*/
	var $_domainGuid;
	
	/**
	 * @var Array<DomainTreeDTO>
	 */
	var $_children;
	
	/**
	 * @var DomainTreeDTO
	 */
	var $_parent;

	
	function __construct(){
		$this->_children = array();
	}
	
	function add($child){
		$this->_children[] = $child;
		$child->setParent($this);
	}
	
	function setKey($key){
		$this->_domainKey = $key;
	}

	function setGuid($guid){
		$this->_domainGuid = $guid;
	}
	
	function setParent($parent){
		$this->_parent = $parent;
	}
	
	function getParent(){
		return $this->_parent;
	}
	
	function encode(){
		$children = array();
		foreach ($this->_children as $child){
			$children[] = $child->encode();
		}
		
		return array("key" => $this->_domainKey, "guid" => $this->_domainGuid, "children" => $children);
	}
	
}