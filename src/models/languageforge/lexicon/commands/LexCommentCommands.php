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
	
	/*
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
		self::updateReply(self::getExampleField($entry, $senseId, $exampleId, $exampleFieldName, $inputSystem), $commentId, $replyData, $userId);
		$entry->write();
		return JsonEncoder::encode($entry);
	}
	*/
	
	public static function deleteCommentById($projectId, $entryId, $commentId) {
		// loop through all possible comment arrays and remove the comment with the matching id...
	}

	
	/**
	 * 
	 * @param LexEntryModel $entry
	 * @param string $senseId
	 * @param string $senseFieldName
	 */
	/*
	private static function getSenseField($entry, $senseId, $senseFieldName, $inputSystem) {
		$sense = $entry->getSense($senseId);
		switch ($senseFieldName) {
			case 'definition':
				return $sense->definition[$inputSystem];
			case 'partOfSpeech':
				return $sense->partOfSpeech;
			case 'semanticDomain':
				return $sense->semanticDomain;
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
	*/
	
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
