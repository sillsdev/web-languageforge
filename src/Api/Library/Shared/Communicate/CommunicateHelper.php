<?php

namespace Api\Library\Shared\Communicate;

use Api\Library\Shared\Communicate\Sms\SmsModel;
use Api\Library\Shared\Communicate\Sms\SmsQueue;

class CommunicateDelivery implements DeliveryInterface
{
    /**
     * @param string $from
     * @param string $to
     * @param string $subject
     * @param string $content
     * @param string $htmlContent
     */
    public function sendEmail($from, $to, $subject, $content, $htmlContent = '')
    {
        if (!defined('TestMode')) {
            Email::send($from, $to, $subject, $content, $htmlContent);
        }
    }

    /**
     * @param SmsModel $smsModel
     */
    public function sendSms($smsModel)
    {
        SmsQueue::queue($smsModel);
    }
}

class CommunicateHelper
{
    /**
     *
     * @param string $fileName
     * @return \Twig\Template
     */
    public static function templateFromFile($fileName)
    {
        if (defined('TestMode')) {
            $options = array();
        } else {
            $options = array(
                    'cache' => APPPATH . 'cache',
            );
        }
        $loader = new \Twig\Loader\FilesystemLoader(APPPATH . 'Site/views');
        $twig = new \Twig\Environment($loader, $options);
        $template = $twig->loadTemplate($fileName);

        return $template;
    }

    /**
     *
     * @param string $templateCode
     * @return \Twig\Template
     */
    public static function templateFromString($templateCode)
    {
        if (defined('TestMode')) {
            $options = array();
        } else {
            $options = array(
                    'cache' => APPPATH . 'cache',
            );
        }
        $loader = new \Twig\Loader\ArrayLoader(array());
        $twig = new \Twig\Environment($loader, $options);
        $template = $twig->createTemplate($templateCode);

        return $template;
    }

    /**
     *
     * @param SmsModel $smsModel
     * @param DeliveryInterface $delivery
     */
    public static function deliverSMS($smsModel, DeliveryInterface $delivery = null)
    {
        // Create our default delivery mechanism if one is not passed in.
        if ($delivery == null) {
            $delivery = new CommunicateDelivery();
        }

        // Deliver the sms message
        $delivery->sendSMS($smsModel);
    }

    /**
     * @param mixed $from
     * @param mixed $to
     * @param string $subject
     * @param string $content
     * @param string $htmlContent
     * @param DeliveryInterface $delivery
     */
    public static function deliverEmail($from, $to, $subject, $content, $htmlContent = '', DeliveryInterface $delivery = null)
    {
        // Create our default delivery mechanism if one is not passed in.
        if ($delivery == null) {
            $delivery = new CommunicateDelivery();
        }

        // Deliver the email message
        $delivery->sendEmail($from, $to, $subject, $content, $htmlContent);
    }
}
