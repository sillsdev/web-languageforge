<?php

class MockProjectModel
{
    public function databaseName()
    {
        $name = strtolower(SF_TESTPROJECT);
        $name = str_replace(' ', '_', $name);

        return 'sf_' . $name;
    }
}
