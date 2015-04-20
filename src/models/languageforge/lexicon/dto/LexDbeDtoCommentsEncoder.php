<?php
namespace models\languageforge\lexicon\dto;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\LexCommentListModel;
use models\languageforge\lexicon\LexDeletedEntryListModel;
use models\languageforge\lexicon\LexDeletedCommentListModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\shared\UserGenericVoteModel;
use models\UserModel;
class LexDbeDtoCommentsEncoder extends JsonEncoder
{
    public function encodeIdReference($key, $model)
    {
        if ($key == 'createdByUserRef' || $key == 'modifiedByUserRef') {
            $user = new UserModel();
            if ($user->exists($model->asString())) {
                $user->read($model->asString());

                return array(
                        'id' => $user->id->asString(),
                        'avatar_ref' => $user->avatar_ref,
                        'name' => $user->name,
                        'username' => $user->username);
            } else {
                return '';
            }
        } else {
            return $model->asString();
        }
    }

    public static function encode($model)
    {
        $e = new LexDbeDtoCommentsEncoder();

        return $e->_encode($model);
    }
}