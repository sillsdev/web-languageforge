<?php
namespace models;

use models\UserUnreadModel;

class UnreadActivityModel extends UserUnreadModel
{
	public function __construct($userId) {
		// Note: activity is inherently outside of a project and so we don't need to keep track of a project context (so we pass in the empty string for projectid)
		parent::__construct('activity', $userId, '');
	}
	
}

?>
