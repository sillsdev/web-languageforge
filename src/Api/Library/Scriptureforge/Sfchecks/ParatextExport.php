<?php

namespace Api\Library\Scriptureforge\Sfchecks;

use Api\Model\Scriptureforge\Sfchecks\Dto\UsxHelper;
use Api\Model\Scriptureforge\Sfchecks\QuestionAnswersListModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;

class ParatextExport
{

    // Review: cjh 2018-04 This static method should be inside of a "Commands" class and the rest of the methods be refactored as a proper class (not static everywhere)
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

        $commentFormat = (isset($params['commentFormat'])) ? $params['commentFormat'] : "PT8"; // We'll default to PT8 style
        if ($commentFormat === "PT7") {
            $filenamePrefix = "Comments";
        } else {
            $filenamePrefix = "Notes";
        }

        $now = new \DateTime();
        $dateForFilename = date('Ymd_Gi', $now->getTimestamp());
        $dl['xml'] .= self::makeDummyComment($commentFormat, $now, $dateForFilename);

        foreach ($questionlist->entries as $question) {
            if (! array_key_exists('isArchived', $question) || ! $question['isArchived']) {
                foreach ($question['answers'] as $answerId => $answer) {
                    if (! $params['exportFlagged'] || (array_key_exists('isToBeExported', $answer) && $answer['isToBeExported'])) { // if the answer is tagged with an export tag
                        $dl['answerCount']++;

                        $questionModel = new QuestionModel($project, $question['id']);
                        $questionTitle = "(Question) " . $questionModel->getTitleForDisplay() . " ";
                        $answerUser = new UserModel((string) $answer['userRef']);
                        $answerContent = self::sanitizeComment("(Answered by {$answerUser->username}) {$answer['content']}");
                        $dl['xml'] .= self::makeCommentXml($commentFormat, $answer['tags'], $answer['score'], $textInfo, $answerId, $answer, $questionTitle . $answerContent);
                        if ($params['exportComments']) {
                            foreach ($answer['comments'] as $commentId => $comment) {
                                $commentUser = new UserModel((string) $comment['userRef']);
                                $commentContent = self::sanitizeComment("({$commentUser->username} commented in reply to {$answerUser->username}) {$comment['content']}");
                                $dl['xml'] .= self::makeCommentXml($commentFormat, array(), 0, $textInfo, $answerId, $comment, $commentContent); // answerId, not commentId, so that Paratext will thread them together
                                $dl['commentCount']++;
                            }
                        }
                    }
                }
            }
        }
        $dl['totalCount'] = $dl['answerCount'] + $dl['commentCount'];
        $dl['xml'] .= "</CommentList>";

        $dl['filename'] = $filenamePrefix . '_SF-' . $dateForFilename . '.xml';
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
     * @param string $commentFormat - either PT7 or PT8
     * @param array $tags
     * @param int $votes
     * @param array $textInfo
     * @param string $threadId
     * @param array $comment
     * @param string $content
     * @return string
     */
    private static function makeCommentXml($commentFormat, $tags, $votes, $textInfo, $threadId, $comment, $content)
    {
        $user = new UserModel((string) $comment['userRef']);

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

        return self::formatComment($commentFormat, $threadId, $user->username, $textInfo, "", $comment['dateEdited']->toDateTime(), $content);
    }

    private static function makeDummyComment($commentFormat, \DateTime $dateTime, string $dummyCommenterName)
    {
        return self::formatComment($commentFormat, $dummyCommenterName, $dummyCommenterName, [], "", $dateTime, "");
    }

    private static function formatVerseRef($textInfo) : string
    {
        return empty($textInfo) ? "" : ($textInfo['bookCode'] . " " . $textInfo['startChapter'] . ":" . $textInfo['startVerse']);
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
        $verse = (isset($textInfo['startVerse'])) ? "\\v " . $textInfo['startVerse'] : "";
        $header = self::commentHeaderForPT7($threadId, $username, self::formatVerseRef($textInfo), $language, $dateTime);
        return $header . "
        <SelectedText />
        <StartPosition>0</StartPosition>
        <ContextBefore>$verse</ContextBefore>
        <ContextAfter/>
        <Status>todo</Status>
        <Type/>
        <Language/>
        <Verse>$verse</Verse>
        <Field Name=\"assigned\"></Field>
        <Contents>$content</Contents>
    </Comment>\n";
    }

    public static function formatForPT8(string $threadId, string $username, array $textInfo, string $language, \DateTime $dateTime, string $content) : string
    {
        $verse = (isset($textInfo) && isset($textInfo['startVerse'])) ? "\\v " . $textInfo['startVerse'] : "";
        $header = self::commentHeaderForPT8($threadId, $username, self::formatVerseRef($textInfo), $language, $dateTime);
        return $header . "
        <SelectedText />
        <StartPosition>0</StartPosition>
        <ContextBefore>$verse</ContextBefore>
        <ContextAfter/>
        <Status>todo</Status>
        <Type/>
        <Language/>
        <Verse>$verse</Verse>
        <Field Name=\"assigned\"></Field>
        <Contents>$content</Contents>
    </Comment>\n";
    }

    public static function formatComment(string $commentFormat, string $threadId, string $username, array $textInfo, string $language, \DateTime $dateTime, string $content) : string
    {
        if ($commentFormat === "PT7") {
            return self::formatForPT7($threadId, $username, $textInfo, $language, $dateTime, $content);
        } else {
            return self::formatForPT8($threadId, $username, $textInfo, $language, $dateTime, $content);
        }
    }
}
