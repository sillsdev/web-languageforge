<?php

namespace Api\Model\Languageforge\Semdomtrans;

class SemDomTransStatus
{
	const Draft = 1;
	const Suggested = 2;
	const NeedsRevision = 3;
	const Approved = 4;
	public static function getSemdomStatuses() 
	{
	    return  $statuses = array(
            self::Draft => "Draft",
	        self::Suggested => "Suggested",
            self::NeedsRevision => "NeedsRevision",
	        self::Approved => "Approved"
        );
        return $statuses;
	}
	
	public static function isApproved($status) {
	    return $status == SemDomTransStatus::Approved;
	}
}
