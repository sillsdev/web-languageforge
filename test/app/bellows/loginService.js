
// Test credentials
// TODO: Abstract these to a separate file before E2E tests are pushed to repository
var user = new Object();
user['identity'] = 'New User';
user['password'] = '12345';

// TODO: Update project manager credentials.  Using admin for now
var projManager = new Object();
projManager['identity'] = 'admin';
projManager['password'] = 'password';

var admin = new Object();
admin['identity'] = 'admin';
admin['password'] = 'password';

/**
 * login to the site with a specific username/password
 * 
 * @param {string} username The username to login with
 * @param {string{ password The password to login with
 */
var login = function(username, password) {

	var loginURL  = 'http://jamaicanpsalms.scriptureforge.local/auth/login';
	var logoutURL = 'http://jamaicanpsalms.scriptureforge.local/auth/logout';

	// Should we log out first?
	// TODO: find a way to wait for async page to load
	//browser.driver.get(logoutURL);
	//browser.driver.manage().timeouts().setScriptTimeout(15, TimeUnit.SECONDS);
	
	// Get the login page
	browser.driver.get(loginURL);

	browser.driver.findElement(by.id('identity')).sendKeys(username);
	browser.driver.findElement(by.id('password')).sendKeys(password);
	browser.driver.findElement(by.id('password')).sendKeys(protractor.Key.ENTER);	


//		// Check for valid login
//		//try {
//			browser.driver.switchTo().alert();
//		//	return false;
//		//} catch (NoAlertPresentException Ex) {
//		//	return true;
//		//}
//		var alert = browser.driver.switchTo().alert();
////		if (alert.getText() == "") {
////			return true;
////		} else {
////			return false;
////		}
//		
//	});	
};
module.exports.login = login;

/**
 * login to the site as a test admin
 */
module.exports.loginAsAdmin = function() {
	it('Test logging in as test admin', function() {
		login(admin['identity'], admin['password']);
	});
};


/**
 * login to the site as a project manager
 */
module.exports.loginAsProjManager = function() {
	it('Test logging in as project manager', function() {
		login(projManager['identity'], projManager['password']);
	});
};

/**
 * login to the site as a test user
 */
module.exports.loginAsUser = function() {
	it('Test logging in as test user', function() {
		login(user['identity'], user['password']);
	});
};

