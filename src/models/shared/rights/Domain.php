<?php
namespace models\shared\rights;

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

    // scriptureforge-sfchecks domains
    const TEXTS            = 1300;
    const QUESTIONS        = 1400;
    const ANSWERS        = 1500; // ownership
    const TEMPLATES        = 1700;
    const TAGS        = 1800;

    // languageforge-lexicon domains
    const ENTRIES        = 1900;
}
