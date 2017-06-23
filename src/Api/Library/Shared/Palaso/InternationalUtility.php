<?php

namespace Api\Library\Shared\Palaso;

class InternationalUtility
{
    /**
     * Unicode Normalize strings in array
     * @param array $array
     * @param string $form
     * @return mixed
     */
    public static function arrayNormalize($array, $form = \Normalizer::FORM_C)
    {
        foreach ($array as &$value) {
            if (is_array($value)) {
                $value = self::arrayNormalize($value, $form);
            } elseif (is_string($value)) {
                $value = \Normalizer::normalize($value, $form);
            }
        }

        return $array;
    }
}
