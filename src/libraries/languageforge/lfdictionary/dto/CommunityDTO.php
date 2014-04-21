<?php
namespace libraries\lfdictionary\dto;

/**
 * This class contains User DTO
 */
// TODO Delete. CP 2013-12
class CommunityDTO {
	
	/**	 
	 * @var string
	 */
	var $_communityName;
	
	/**	 
	 * @var integer
	 */
	var $_communityId;
	
	/**
	 * @param User $user
	 */
	function addCommunityId($communityId) {
		$this->_communityId = $communityId;
	}	
	
	/**
	 * @param User $user
	 */
	function addCommunityName($communityName) {
		$this->_communityName = $communityName;
	}	
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		return array(
			"CommunityId" => $this->_communityId,
			"CommunityName" => $this->_communityName			
		);
		
	}
}

?>