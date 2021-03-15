<?php

namespace Api\Model\Shared\Rights;

class Domain
{
    // note: USERS are system domains
    // note: PROJECTS are site domains
    // note: COMMENTS and the rest of them are project domains

    const ANY            = 1000;

    // system-wide domains
    const USERS            = 1100; // ownership (your own user data)

    // site-wide domain
    const PROJECTS        = 1200;

    // shared project domains
    const COMMENTS        = 1600; // ownership

    // languageforge-lexicon domains
    const ENTRIES        = 1900;
}
