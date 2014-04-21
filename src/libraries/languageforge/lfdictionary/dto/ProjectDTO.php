<?php
namespace libraries\lfdictionary\dto;

/**
 * This class contains Project DTO
 */
// TODO. Delete. This is not likely useful.  The Dto should be page focussed, and the ProjectModel + JsonEncoder will help a lot. CP 2013-12
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
			'name' => $this->_projectModel->projectName,
			'title' => $this->_projectModel->title,
			'type' => "dictionary",
			'lang' => $this->_projectModel->languageCode
		);
	}
}

?>