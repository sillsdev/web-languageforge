<?php
namespace libraries\lfdictionary\dto;

class CommunityListDTO {

	/**
	 * @var array
	 */
	var $_communityList;

	function __construct() {
		$this->_communityList = array();
	}

	/**
	 * @param User $user
	 */
	function addListCommunity($project) {
		$this->_communityList[] = $project;
	}

	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		$communities = array();
		foreach ($this->_communityList as $community) {
			$communities[] = $community->encode();
		}
		return array(
				"List" => $communities
		);
	}
}

?>