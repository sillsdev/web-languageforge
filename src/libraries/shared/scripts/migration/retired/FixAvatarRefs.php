<?php

namespace libraries\shared\scripts\migration;

use models\UserProfileModel;

use models\ProjectListModel;
use models\ProjectModel;
use models\UserModel;
use models\UserListModel;

class FixAvatarRefs {

	public function run($mode = 'test') {
		$testMode = ($mode == 'test');
		$message = "";

		$userlist = new UserListModel();
		$userlist->read();
		$badAvatarLinks = 0;
		foreach ($userlist->entries as $userParams) { // foreach existing user
			$userId = $userParams['id'];
			$user = new UserProfileModel($userId);
			$avatarUrl = $user->avatar_ref;
			if (strpos($user->avatar_ref, '/images/shared/avatar') === FALSE) {
				if ($user->avatar_color != '' && $user->avatar_shape != '') {
					$newPath = "/images/shared/avatar/" . $user->avatar_color . '-' . $user->avatar_shape . "-128x128.png";
				} else {
					$newPath = "/images/shared/avatar/anonymoose.png";
				}
				$message .= "Changed user $userId 's avatar from " . $user->avatar_ref . " to $newPath\n";
				$user->avatar_ref = $newPath;
				$badAvatarLinks++;
				if (!$testMode) {
					$user->write();
				}
			}
		}
		if ($badAvatarLinks > 0) {
			$message .= "\n\nFixed $badAvatarLinks bad avatar URLs\n\n";
		} else {
			$message .= "\n\nNo bad avatar URLs were found\n\n";
		}

		return $message;
	}
}

?>
