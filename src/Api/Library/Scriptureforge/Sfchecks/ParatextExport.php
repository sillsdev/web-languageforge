<?php

namespace Api\Library\Scriptureforge\Sfchecks;

use Api\Model\Scriptureforge\Sfchecks\Dto\UsxHelper;
use Api\Model\Scriptureforge\Sfchecks\QuestionAnswersListModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;

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
            'xml' => '<?xml version="1.0" encoding="utf-8"?>' . "\n<CommentList>\n"
        );
        $commentFormatter = "formatForPT7";
        if (isset($params['commentFormat'])) {
            switch ($params['commentFormat'])
            {
            case "PT7":
                $commentFormatter = "formatForPT7";
                break;
            case "PT8":
                $commentFormatter = "formatForPT8";
                break;
            // No need for a default case since we've already set the default above
            }
        }
        foreach ($questionlist->entries as $question) {
            if (! array_key_exists('isArchived', $question) || ! $question['isArchived']) {
                foreach ($question['answers'] as $answerId => $answer) {
                    if (! $params['exportFlagged'] || (array_key_exists('isToBeExported', $answer) && $answer['isToBeExported'])) { // if the answer is tagged with an export tag
                        $dl['answerCount']++;
                        $dl['xml'] .= self::makeCommentXml($commentFormatter, $answer['tags'], $answer['score'], $textInfo, $answerId, $answer);
                        if ($params['exportComments']) {
                            foreach ($answer['comments'] as $commentId => $comment) {
                                $dl['xml'] .= self::makeCommentXml($commentFormatter, array(), 0, $textInfo, $answerId, $comment); // answerId, not commentId, so that Paratext will thread them together
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
     * @param string $threadId
     * @param array $comment
     */
    private static function makeCommentXml($commentFormatter, $tags, $votes, $textInfo, $threadId, $comment)
    {
        $user = new UserModel((string) $comment['userRef']);
        $username = $user->username;

        $content = self::sanitizeComment($comment['content']) . " (by " . $user->username . ")";
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

        // Is there a better way than specifying the function name *and* class name as "magic strings"? I'm unfamiliar with how to do this in PHP. - 2018-01 RM
        return call_user_func(["\Api\Library\Scriptureforge\Sfchecks\ParatextExport", $commentFormatter], $threadId, $username, $textInfo, "", $comment['dateEdited']->toDateTime(), $content);
    }

    private static function formatVerseRef($textInfo) : string
    {
        return $textInfo['bookCode'] . " " . $textInfo['startChapter'] . ":" . $textInfo['startVerse'];
    }

    public static function commentHeaderForPT7(string $threadId, string $username, string $verseRef, string $language, \DateTime $dateTime) : string
    {
        return "\t<Comment>
        <Thread>$threadId</Thread>
        <User>SF-$username</User>
        <Date>" . $dateTime->format(\DateTime::ATOM) . "</Date>
        <VerseRef>$verseRef</VerseRef>
        <Language/>";
    }

    public static function commentHeaderForPT8(string $threadId, string $username, string $verseRef, string $language, \DateTime $dateTime) : string
    {
        return "\t<Comment Thread=\"$threadId\" User=\"SF-$username\" VerseRef=\"$verseRef\" Language=\"$language\" Date=\"" . $dateTime->format(\DateTime::ATOM) . "\">";
    }

    public static function formatForPT7(string $threadId, string $username, array $textInfo, string $language, \DateTime $dateTime, string $content) : string
    {
        $header = self::commentHeaderForPT7($threadId, $username, self::formatVerseRef($textInfo), $language, $dateTime);
        return $header . "
        <SelectedText />
        <StartPosition>0</StartPosition>
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

    public static function formatForPT8(string $threadId, string $username, array $textInfo, string $language, \DateTime $dateTime, string $content) : string
    {
        $header = self::commentHeaderForPT8($threadId, $username, self::formatVerseRef($textInfo), $language, $dateTime);
        return $header . "
        <SelectedText />
        <StartPosition>0</StartPosition>
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
