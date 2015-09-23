<?php

namespace Api\Library\Shared\Communicate;

class Email
{
    public static function send($from, $to, $subject, $content)
    {
        // Create the Transport
        $transport = \Swift_SmtpTransport::newInstance('localhost', 25);

        // Create the Mailer using your created Transport
        $mailer = \Swift_Mailer::newInstance($transport);

        // Create a message
        $message = \Swift_Message::newInstance($subject);
        $message->setFrom($from);
        $message->setTo($to);
        $message->setBody($content);

        // Send the message
        $mailer->send($message);
    }
}
