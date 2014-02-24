<?php
namespace libraries\sfchecks;


use models\dto\UsxHelper;

use models\UserModel;
use models\ProjectModel;
use models\TextModel;
use models\QuestionAnswersListModel;


class ParatextExport
{
	
	public static function exportCommentsForText($projectId, $textId, $params) {
		$project = new ProjectModel($projectId);
		$text = new TextModel($project, $textId);
		$usxHelper = new UsxHelper($text->content);
		$textInfo = $usxHelper->getMetadata();
		$questionlist = new QuestionAnswersListModel($project, $textId);
		$questionlist->read();
		$dl = array(
			'complete' => true,
			'inprogress' => false,
			'answerCount' => 0,
			'commentCount' => 0,
			'totalCount' => 0,
			'xml' => "<CommentList>\n"
		);
		foreach ($questionlist->entries as $question) {
			foreach ($question['answers'] as $answerId => $answer) {
				if (count($params['tags']) == 0 || count(array_intersect($params['tags'], $answer['tags'])) > 0) { // if the answer is tagged with an export tag
					$dl['answerCount']++;
					$dl['xml'] .= self::makeCommentXml($params['username'], $answer['tags'], $answer['score'], $textInfo, $answerId, $answer);
					if ($params['exportComments']) {
						foreach ($answer['comments'] as $commentId => $comment) {
							$dl['xml'] .= self::makeCommentXml($params['username'], array(), 0, $textInfo, $commentId, $comment);
							$dl['commentCount']++;
						}
					}
				}
			}
		}
		$dl['totalCount'] = $dl['answerCount'] + $dl['commentCount'];
		$dl['xml'] .= "</CommentList>";
		return $dl;
	}
	
	
	public static function exportCommentsForProject($projectId, $params) {
		// NYI: loop over the texts in the project and call self::exportCommentsForText()
	}

	/**
	 * 
	 * @param string $username
	 * @param array $tags
	 * @param int $votes
	 * @param array $textInfo
	 * @param string $commentId
	 * @param array $comment
	 */
	private static function makeCommentXml($username, $tags, $votes, $textInfo, $commentId, $comment) {
		$user = new UserModel((string)$comment['userRef']);
		
		$content = $comment['content'] . " (by " . $user->username . " on " . date(\DateTime::RFC822, $comment['dateEdited']->sec) . ")";
		if (count($tags) > 0) {
			$content .= " (Tags: ";
			foreach ($tags as $tag) {
				$content .= $tag . ', ';
			}
			$content = preg_replace('/, $/', '', $content);
			$content .= ")";
		}
		if ($votes > 0) {
			$content .= " ($votes Votes)";
		}
		return "\t<Comment>
		<Thread>" . $commentId . "</Thread>
		<User>$username</User>
		<Date>" . date(\DateTime::ISO8601, $comment['dateEdited']->sec) . "</Date>
		<VerseRef>" . $textInfo['bookCode'] . " " . $textInfo['startChapter'] . ":" . $textInfo['startVerse'] . "</VerseRef>
		<SelectedText />
		<StartPosition></StartPosition>
		<ContextBefore>\\v " . $textInfo['startVerse'] . "</ContextBefore>
		<ContextAfter/>
		<Status>todo</Status>
		<Type/>
		<Language/>
		<Verse>\\v " . $textInfo['startVerse'] . "</Verse>
		<Field Name='assigned'/>
		<Contents>$content</Contents>
	</Comment>\n";
	}
}