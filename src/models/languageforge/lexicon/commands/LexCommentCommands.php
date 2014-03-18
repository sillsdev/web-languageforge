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
	
	public static function updateLexemeComment($projectId, $entryId, $inputSystem, $commentData, $userId) {
		CodeGuard::checkTypeAndThrow($commentData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateComment($entry->lexeme[$inputSystem]->comments, $commentData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}

	public static function updateLexemeReply($projectId, $entryId, $inputSystem, $commentId, $replyData, $userId) {
		CodeGuard::checkTypeAndThrow($replyData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateReply($entry->lexeme[$inputSystem]->comments, $commentId, $replyData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}
	
	public static function updateSenseComment($projectId, $entryId, $senseId, $senseNode, $params) {
		
	}
	public static function updateSenseReply($projectId, $entryId, $senseId, $senseNode, $commentId, $params) {}
	
	public static function updateExampleComment($projectId, $entryId, $senseId, $exampleId, $exampleNode, $params) {}
	public static function updateExampleReply($projectId, $entryId, $senseId, $exampleId, $exampleNode, $commentId, $params) {}

	public static function removeEntries($projectId, $entryIds) {
		CodeGuard::checkTypeAndThrow($entryIds, 'array');
		$project = new LexiconProjectModel($projectId);
		foreach ($entryIds as $id) {
			LexEntryModel::remove($project, $id);
		}
	}
	
	/**
	 * 
	 * @param string $projectId
	 * @param string $missingInfo - if empty, returns all entries.
	 * 								if matches one of LexiconConfigObj constants (e.g. POS, DEFINITION, etc), then return a subset of entries that have one or more senses missing the specified field
	 */
	public static function listEntries($projectId, $missingInfo = '') {
		$project = new LexiconProjectModel($projectId);
		$lexEntries = new LexEntryListModel($project);
		$lexEntries->readForDto($missingInfo);
		return $lexEntries;
	}
	
	/**
	 * 
	 * @param ArrayOf<LexComment|LexCommentReply> $commentModels
	 * @param array $commentData
	 * @param string $userId
	 * @param string $type
	 */
	private static function updateComment($commentModels, $commentData, $userId, $type = 'comment') {
		$foundKey = FALSE;
		if ($commentData['id'] != '') {
			// existing comment
			foreach ($commentModels as $key => $c) {
				if ($c->id == $commentData['id']) {
					$foundKey = $key;
					break;
				}
			}
			$comment = $commentModels[$foundKey];
		} else {
			// new comment
			if ($type == 'comment') {
				$comment = new LexComment();
				$comment->regarding = $commentData['regarding'];
			} else {
				$comment = new LexCommentReply();
			}
		}
		$comment->content = $commentData['content'];
		$comment->dateModified = new \DateTime();
		$comment->userRef = $userId;
		
		if ($foundKey !== FALSE) {
			$commentModels[$foundKey] = $comment;
		} else {
			$commentModels[] = $comment;
		}
	}
	
	private static function updateReply($commentModels, $commentId, $replyData, $userId) {
		$foundKey = FALSE;
		foreach ($commentModels as $key => $comment) {
			if ($comment->id == $commentId) {
				$foundKey = $key;
				break;
			}
		}
		if ($foundKey !== FALSE) {
			self::updateComment($commentModels[$foundKey]->subcomments, $replyData, $userId, 'reply');
		}
	}
}

?>
