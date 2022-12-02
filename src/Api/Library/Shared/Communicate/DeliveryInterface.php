<?php

namespace Api\Library\Shared\Communicate;

interface DeliveryInterface
{
    /**
     * Sends an email
     * @param string $from
     * @param string $to
     * @param string $subject
     * @param string $content
     * @param string $htmlContent
     */
    public function sendEmail($from, $to, $subject, $content, $htmlContent = "");
}
