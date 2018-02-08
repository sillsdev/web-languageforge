/*
 * Node Server Configuration File
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Do NOT commit changes to this file.
 * This file is in the repo so things work on a developer machine but it is ignored by git.
 * Each production machine should create their own version of this file.
 */

var sslKeyPath = '/root/csr/scriptureforge.key';
var sslCertPath = '/root/csr/scriptureforge.pem';

module.exports.sslKeyPath = sslKeyPath;
module.exports.sslCertPath = sslCertPath;
