<?php

namespace models\languageforge\lexicon;

use models\UserModel;
use models\mapper\JsonEncoder;

class LexEntryWithCommentsEncoder extends JsonEncoder {
	public function encodeIdReference($key, $model) {
		if ($key == 'userRef') {
			$user = new UserModel();
			if ($user->exists($model->asString())) {
				$user->read($model->asString());
				return array(
						'id' => $user->id->asString(),
						'avatar_ref' => $user->avatar_ref,
						'username' => $user->username);
			} else {
				return '';
			}
		} else {
			return $model->asString();
		}
	}
}

?>
