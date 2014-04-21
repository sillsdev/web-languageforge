<?php
/**
 * This class contains User DTO
 * @author Arivusudar
 */

namespace libraries\lfdictionary\dto;

class ProjectListDTO {
	
	/**	 
	 * @var array
	 */
	var $_projectList;
	
	function __construct() {		
		$this->_projectList = array();
	}
	
	/**
	 * @param User $user
	 */
	function addListProject($project) {	
		$this->_projectList[] = $project;
	}
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		$projects = array();
		foreach ($this->_projectList as $project) {		
			$projects[] = $project->encode();
		}
		return array(
			"List" => $projects
		);		
	}
}
?>