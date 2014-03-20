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
		self::updateComment($entry->lexeme[$inputSystem], $commentData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}

	public static function updateLexemeReply($projectId, $entryId, $inputSystem, $commentId, $replyData, $userId) {
		CodeGuard::checkTypeAndThrow($replyData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateReply($entry->lexeme[$inputSystem], $commentId, $replyData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}
	
	public static function updateSenseComment($projectId, $entryId, $senseId, $senseFieldName, $inputSystem, $commentData, $userId) {
		CodeGuard::checkTypeAndThrow($commentData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateComment(self::getSenseField($entry, $senseId, $senseFieldName, $inputSystem), $commentData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}

	public static function updateSenseReply($projectId, $entryId, $senseId, $senseFieldName, $inputSystem, $commentId, $replyData, $userId) {
		CodeGuard::checkTypeAndThrow($replyData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateReply(self::getSenseField($entry, $senseId, $senseFieldName, $inputSystem), $commentId, $replyData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}
	
	public static function updateExampleComment($projectId, $entryId, $senseId, $exampleId, $exampleFieldName, $inputSystem, $commentData, $userId) {
		CodeGuard::checkTypeAndThrow($commentData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateComment(self::getExampleField($entry, $senseId, $exampleId, $exampleFieldName, $inputSystem), $commentData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}

	public static function updateExampleReply($projectId, $entryId, $senseId, $exampleId, $exampleFieldName, $inputSystem, $commentId, $replyData, $userId) {
		CodeGuard::checkTypeAndThrow($replyData, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		self::updateReply(self::getSenseField($entry, $senseId, $exampleId, $exampleFieldName, $inputSystem), $commentId, $replyData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}

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
	 * @param LexEntryModel $entry
	 * @param string $senseId
	 * @param string $senseFieldName
	 */
	private static function getSenseField($entry, $senseId, $senseFieldName, $inputSystem) {
		$sense = $entry->getSense($senseId);
		switch ($senseFieldName) {
			case 'definition':
				return $sense->definition[$inputSystem];
			case 'partOfSpeech':
				return $sense->partOfSpeech[$inputSystem];
			case 'semanticDomain':
				return $sense->semanticDomain[$inputSystem];
		}
	}
	
	private static function getExampleField($entry, $senseId, $exampleId, $exampleFieldName, $inputSystem) {
		$sense = $entry->getSense($senseId);
		$example = $sense->getExample($exampleId);
		switch ($exampleFieldName) {
			case 'sentence':
				return $example->sentence[$inputSystem];
			case 'translation':
				return $example->translation[$inputSystem];
		}
	}
	
	/**
	 * 
	 * @param LexiconFieldWithComments $field
	 * @param array $commentData
	 * @param string $userId
	 * @param string $type
	 */
	private static function updateComment($field, $commentData, $userId) {
		$id = $commentData['id'];
		$existingComment = ($id != '');
		if ($existingComment) {
			$comment = $field->getComment($id);
		} else {
			$comment = new LexComment();
			$comment->regarding = $commentData['regarding'];
		}
		$comment->content = $commentData['content'];
		$comment->dateModified = new \DateTime();
		$comment->userRef = $userId;
		
		if ($existingComment) {
			$field->setComment($id, $comment);
		} else {
			$field->comments[] = $comment;
		}
	}
	
	/**
	 * 
	 * @param LexiconFieldWithComments $field
	 * @param string $commentId
	 * @param array $replyData
	 * @param string $userId
	 */
	private static function updateReply($field, $commentId, $replyData, $userId) {
		$comment = $field->getComment($commentId);
		$id = $replyData['id'];
		$existingReply = ($id != '');
		if ($existingReply) {
			$reply = $comment->getReply($id);
		} else {
			$reply = new LexCommentReply();
		}
		$reply->content = $replyData['content'];
		$reply->dateModified = new \DateTime();
		$reply->userRef = $userId;
		
		if ($existingReply) {
			$comment->setReply($id, $reply);
		} else {
			$comment->replies[] = $reply;
		}
	}
}

?>
