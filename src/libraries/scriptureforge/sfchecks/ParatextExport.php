<?php
namespace libraries\scriptureforge\sfchecks;

use models\scriptureforge\dto\UsxHelper;
use models\ProjectModel;
use models\QuestionAnswersListModel;
use models\TextModel;
use models\UserModel;

class ParatextExport
{

    public static function exportCommentsForText($projectId, $textId, $params)
    {
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
            if (! array_key_exists('isArchived', $question) || ! $question['isArchived']) {
                foreach ($question['answers'] as $answerId => $answer) {
                    if (! $params['exportFlagged'] || (array_key_exists('isToBeExported', $answer) && $answer['isToBeExported'])) { // if the answer is tagged with an export tag
                        $dl['answerCount']++;
                        $dl['xml'] .= self::makeCommentXml($answer['tags'], $answer['score'], $textInfo, $answerId, $answer);
                        if ($params['exportComments']) {
                            foreach ($answer['comments'] as $commentId => $comment) {
                                $dl['xml'] .= self::makeCommentXml(array(), 0, $textInfo, $commentId, $comment);
                                $dl['commentCount']++;
                            }
                        }
                    }
                }
            }
        }
        $dl['totalCount'] = $dl['answerCount'] + $dl['commentCount'];
        $dl['xml'] .= "</CommentList>";

        $dl['filename'] = 'Comments_sf_' . date('Ymd_Gi') . '.xml';
        //$dl['filename'] = preg_replace("([^\w\d\-]|[\.]{2,})", '_', $filename) . '.xml';
        return $dl;
    }

    public static function exportCommentsForProject($projectId, $params)
    {
        // NYI: loop over the texts in the project and call self::exportCommentsForText()
    }

    /**
	 *
	 * @param string $xml
	 * @return string sanitized XML
	 */
    private static function sanitizeComment($xml)
    {
        $search = array('&nbsp;', '<br>', '<b>', '</b>', '<i>', '</i>');
        $replace = array(' ', '<br />', '<bold>', '</bold>', '<italic>', '</italic>');

        return str_replace($search, $replace, $xml);
    }

    /**
	 *
	 * @param array $tags
	 * @param int $votes
	 * @param array $textInfo
	 * @param string $commentId
	 * @param array $comment
	 */
    private static function makeCommentXml($tags, $votes, $textInfo, $commentId, $comment)
    {
        $user = new UserModel((string) $comment['userRef']);
        $username = $user->username;

        $content = self::sanitizeComment($comment['content']) . " (by " . $user->username . " on " . date(\DateTime::RFC822, $comment['dateEdited']->sec) . ")";
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
		<User>SF-$username</User>
		<Date>" . date(\DateTime::ISO8601, $comment['dateEdited']->sec) . "</Date>
		<VerseRef>" . $textInfo['bookCode'] . " " . $textInfo['startChapter'] . ":" . $textInfo['startVerse'] . "</VerseRef>
		<SelectedText />
		<StartPosition>" . $textInfo['startVerse'] . "</StartPosition>
		<ContextBefore>\\v " . $textInfo['startVerse'] . "</ContextBefore>
		<ContextAfter/>
		<Status>todo</Status>
		<Type/>
		<Language/>
		<Verse>\\v " . $textInfo['startVerse'] . "</Verse>
		<Field Name=\"assigned\"></Field>
		<Contents>$content</Contents>
	</Comment>\n";
    }
}
