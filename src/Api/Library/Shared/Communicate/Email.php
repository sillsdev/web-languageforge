<?php

namespace Api\Library\Shared\Communicate;

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

class Email
{
    /**
     * @param string $from
     * @param string $to
     * @param string $subject
     * @param string $content
     * @param string $htmlContent
     */
    public static function send($from, $to, $subject, $content, $htmlContent = "")
    {
        // Create the Transport
        $transport = new \Swift_SmtpTransport(Env::requireEnv("MAIL_HOST"));

        // Create the Mailer using your created Transport
        $mailer = new \Swift_Mailer($transport);

        // Create a message
        $message = new \Swift_Message($subject);
        $message->setFrom($from);
        $message->setTo($to);
        $message->setBody($content);
        if ($htmlContent) {
            $message->addPart($htmlContent, "text/html");
        }

        // Send the message
        $mailer->send($message);
    }
}
