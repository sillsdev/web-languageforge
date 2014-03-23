<?php

namespace models\languageforge\lexicon\commands;

use models\languageforge\lexicon\LexCommentReply;

use models\languageforge\lexicon\settings\LexiconConfigObj;

use models\languageforge\lexicon\LexEntryListModel;

use models\languageforge\lexicon\LexiconProjectModel;

use models\languageforge\lexicon\LexEntryModel;

use libraries\shared\palaso\CodeGuard;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\languageforge\lexicon\LexComment;

class LexCommentCommands {
	/**
	 * 
	 * @param string $projectId
	 * @param array $comment - comment data array to create or update
	 * @param string $userId
	 * @throws \Exception
	 * @return array
	 */	
	public static function updateCommentOrReply($projectId, $comment, $userId) {
		CodeGuard::checkTypeAndThrow($comment, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $comment['entryId']);
		$field = $comment['field'];
		switch ($field) {
			case 'lexeme':
				self::updateComment($entry->lexeme[$comment['inputSystem']], $comment, $userId);
				break;
			case 'sense_definition':
				$sense = $entry->getSense($comment['senseId']);
				self::updateComment($sense->definition[$comment['inputSystem']], $comment, $userId);
				break;
			case 'sense_partOfSpeech':
			case 'sense_semanticDomain':
				$field = substr($field, 6);
				$sense = $entry->getSense($comment['senseId']);
				self::updateComment($sense->$field, $comment, $userId);
				break;
			case 'sense_example_sentence':
			case 'sense_example_translation':
				$field = substr($field, 14);
				$sense = $entry->getSense($comment['senseId']);
				$example = $sense->getExample($comment['exampleId']);
				$multitext = $example->$field;
				self::updateComment($multitext[$comment['inputSystem']], $comment, $userId);
				break;
			default:
				throw new \Exception("unknown comment field '$field' in LexCommentCommands::updateComment");
		}
		$entry->write();
		return JsonEncoder::encode($entry);
	}
	
	
	public static function deleteCommentById($projectId, $entryId, $commentId) {
		// loop through all possible comment arrays and remove the comment with the matching id...
	}

	
	/**
	 * 
	 * @param LexiconFieldWithComments $field
	 * @param array $data
	 * @param string $userId
	 */
	private static function updateComment($field, $data, $userId) {
		$id = $data['id'];
		$existing = ($id != '');
		if (key_exists('parentId', $data)) {
			$comment = $field->getComment($data['parentId']);
			if ($existing) {
				$reply = $comment->getReply($id);
			} else {
				$reply = new LexCommentReply();
			}
			$reply->content = $data['content'];
			$reply->dateModified = new \DateTime();
			$reply->userRef = $userId;
			
			if ($existing) {
				$comment->setReply($id, $reply);
			} else {
				$comment->replies[] = $reply;
			}
		} else {
			if ($existing) {
				$comment = $field->getComment($id);
			} else {
				$comment = new LexComment();
				$comment->regarding = $data['regarding'];
			}
			$comment->content = $data['content'];
			$comment->dateModified = new \DateTime();
			$comment->userRef = $userId;
			
			if ($existing) {
				$field->setComment($id, $comment);
			} else {
				$field->comments[] = $comment;
			}
		}
	}
	
}

?>
