for /f "skip=1" %%x in ('wmic os get localdatetime') do if not defined MyDate set MyDate=%%x
set today=%MyDate:~0,4%-%MyDate:~4,2%-%MyDate:~6,2%

plink chris@scriptureforge.org -m backupMongoOnServer.sh
pscp chris@scriptureforge.org:mongodb_backup_%today%.tgz c:\src
plink chris@scriptureforge.org -m deleteTarFileOnServer.sh
plink root@scriptureforge.localhost -m restoreMongoOnLocal.sh
plink root@scriptureforge.localhost "php /var/www/host/sil/languageforge/scripts/tools/ChangeSiteNameToLocal.php"
