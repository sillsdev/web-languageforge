<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\UserListModel;
use Api\Model\UserProfileModel;

class FixAvatarRefs
{
    public static function run($userId, $mode = 'test') {
        $testMode = ($mode != 'run');
        $message = '';

        $userlist = new UserListModel();
        $userlist->read();
        $badAvatarLinks = 0;
        foreach ($userlist->entries as $userParams) { // foreach existing user
            $userId = $userParams['id'];
            $user = new UserProfileModel($userId);
            if (strpos($user->avatar_ref, '/') !== FALSE or strpos($user->avatar_ref, '\\') !== FALSE) {
                if ($user->avatar_color != '' && $user->avatar_shape != '') {
                    $newRef = $user->avatar_color.'-'.$user->avatar_shape.'-128x128.png';
                } else {
                    $newRef = 'anonymoose.png';
                }
                $message .= "Changed user $userId 's avatar from ".$user->avatar_ref." to $newRef\n";
                $user->avatar_ref = $newRef;
                $badAvatarLinks++;
                if (! $testMode) {
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
