<?php
namespace libraries\lfdictionary\dto;

/**
 * This class contains Project DTO
 */
class ProjectDTO {
	
	/**
	 * @var ProjectModel
	 */
	private $_projectModel;
	
	/**
	 * @param ProjectModel $projectModel
	 */
	public function __construct($projectModel) {
		$this->_projectModel = $projectModel;
	}
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		return array(
			'id' => $this->_projectModel->id->asString(),
			'name' => $this->_projectModel->projectname,
			'title' => $this->_projectModel->title,
			'type' => "dictionary",
			'lang' => $this->_projectModel->languageCode
		);
	}
}

?>