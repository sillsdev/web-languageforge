<?php
namespace models;

use models\UserUnreadModel;

class UnreadAnswerModel extends UserUnreadModel
{
	public function __construct($userId, $projectId) {
		parent::__construct('answer', $userId, $projectId);
	}
}

?>