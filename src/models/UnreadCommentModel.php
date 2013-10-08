<?php
namespace models;

use models\UserUnreadModel;

class UnreadCommentModel extends UserUnreadModel
{
	public function __construct($userId, $projectId) {
		parent::__construct('comment', $userId, $projectId);
	}
}

?>