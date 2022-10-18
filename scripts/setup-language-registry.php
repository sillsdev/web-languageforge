#!/usr/bin/php -q

<?php
php_sapi_name() == "cli" or die("this script must be run on the command-line");

function usage($cmdname)
{
    echo "Usage: $cmdname dbname [collection]\n";
    echo "\n";
    echo "  dbname     = Name of database to populate with language registry\n";
    echo "  collection = Name of collection (\"table\" in SQL terminology) that\n";
    echo "               should hold the language data (default is \"languages\")\n";
    echo "\n";
    echo "Language data will be read from the file \"language-subtag-registry.txt\"\n";
    echo "in the current directory.\n";
}

function parse_registry($filePath)
{
    echo "Parsing IANA language registry found in file \"$filePath\"... ";

    // Format of registry specified in https://www.ietf.org/rfc/rfc5646.txt
    // Essentially, it's a collection of records separated by "%%\n" lines.
    // Each record is a collection of fields, which are usually one line
    // long. If a field spans multiple lines, the subsequent lines are
    // indented by a single space. (Any remaining spaces beyond the first
    // are part of the field value). Fields are in the form "name: value".

    $fileContents = file_get_contents($filePath);
    $records = explode("%%", $fileContents);

    // First record is datestamp of registry file; all subsequent records are data.
    $dateStamp = array_shift($records);
    // We don't currently use the datestamp for anything. We could
    // theoretically store it in the database and check it to see if a
    // new version of the language subtag registry is available, but it's
    // just as simple to check the first line of the text file.

    $fieldNameMapping = [
        "preferred-value" => "preferredValue",
        "suppress-script" => "suppressScript",
    ];

    $result = [];
    foreach ($records as $record) {
        // Join line-spanning fields (usually comments) onto one line
        $normalizedRecord = str_replace("\n ", "", $record);

        $mongoRecord = [
            "description" => [],
        ];

        $lines = explode("\n", $normalizedRecord);
        foreach ($lines as $line) {
            // Skip blank lines
            $trimmed = trim($line);
            if (empty($trimmed)) {
                continue;
            }

            $parts = explode(":", $line, 2);
            $key = strtolower(trim($parts[0]));
            if (array_key_exists($key, $fieldNameMapping)) {
                $key = $fieldNameMapping[$key];
            }
            $val = trim($parts[1]);

            if ($key == "description") {
                // Description fields may be, and often are, duplicated
                $mongoRecord[$key][] = $val;
            } else {
                $mongoRecord[$key] = $val;
            }
        }

        // We're only interested in language and extlang records
        $type = $mongoRecord["type"];
        if ($type == "language" || $type == "extlang") {
            $result[] = $mongoRecord;
        }
    }

    echo "done.\n";

    return $result;
}

function main($argv)
{
    $cmd = array_shift($argv);
    if (count($argv) == 0) {
        usage($cmd);
        exit(2);
    }
    foreach ($argv as $arg) {
        if ($arg == "--help") {
            usage($cmd);
            exit(2);
        }
    }
    $dbname = $argv[0];
    $collectionName = count($argv) >= 2 ? $argv[1] : "languages";
    $data = parse_registry("language-subtag-registry.txt");

    echo "Writing language data to collection \"$collectionName\" in Mongo database \"$dbname\"... ";
    $m = new MongoClient();
    $db = $m->$dbname;
    $coll = $db->$collectionName;
    $coll->drop(); // Replace old data with new, don't append
    $coll->batchInsert($data);
    echo "done.\n";
}

main($argv);
exit(0);

