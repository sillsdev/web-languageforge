'use strict';

// Selector grabbed from https://coderwall.com/p/tjx5zg
function selectOption(selector, item){
    var selectList, desiredOption;

    selectList = this.findElement(selector);
    selectList.click();

    selectList.findElements(protractor.By.tagName('option'))
        .then(function findMatchingOption(options){
            options.some(function(option){
                option.getText().then(function doesOptionMatch(text){
                    if (item === text){
                        desiredOption = option;
                        return true;
                    }
                });
            });
        })
        .then(function clickOption(){
            if (desiredOption){
                desiredOption.click();
            }
        });
}

var newMemberEmail  = 'test@123.com';
var newColor        = 'Blue';
var newShape        = 'Elephant';
var contactButtonID = 'BothButton'; // [EmailButton, SMSButton, BothButton]
var newFullName     = 'abracadabra';
var newAge          = '33';
var newGender       = 'Female';

var SfUserPage = function() {
	this.emailInput = element(by.model('user.email'));
	
	// Jamaican mobile phone number will move to Project scope, so intentionally not tested here
	this.mobilePhoneInput = element(by.model('user.mobile_phone'));
	
	this.communicate_via = element(By.id(contactButtonID));
	
	this.fullName = element(by.model('user.name'));
	this.age      = element(by.model('user.age'));
	this.gender   = element(by.model('user.geneder'));

};

describe('E2E testing: User Profile page', function() {
	var sfUserPage = new SfUserPage();
	
	var LoginPage = require('../../../pages/loginPage'); 
	var loginPage = new LoginPage();
	loginPage.loginAsUser();

	it('Update My Account profile', function() {
		browser.driver.get('http://jamaicanpsalms.scriptureforge.local/app/userprofile');
		
		browser.selectOption = selectOption.bind(browser);
		browser.selectOption(protractor.By.model('user.avatar_color'), newColor);
		browser.selectOption(protractor.By.model('user.avatar_shape'), newShape);
		
		// Modify email address
		sfUserPage.emailInput.click();
		sfUserPage.emailInput.clear();
		sfUserPage.emailInput.sendKeys(newMemberEmail);
		
		// Modify contact preference
		sfUserPage.communicate_via.click();
		
		// Change Password tested in changepassword e2e
		
		// Submit updated profile
		browser.driver.findElement(By.id('saveBtn')).click();
	});
	

	it('Check updated usercolor is ' + newColor, function() {
		browser.driver.get('http://jamaicanpsalms.scriptureforge.local/app/userprofile');

		//var dropDown1 = browser.driver.findElement(By.id("smallAvatarURL"));
		//System.out.println(dropDown1.getValue()); //image1 = browser.driver.findElement(By.xpath("//img[contains(@data-ng-src,'Blue')]"));
//		expect(element(by.class('img-poloroid'))user.avatar_color')).value(), newColor);
	});

	it('Update About Me', function() {
		browser.driver.findElement(By.id("AboutMeTab")).click();
		
		// Modify About me
		sfUserPage.fullName.click();
		sfUserPage.fullName.clear();	
		sfUserPage.fullName.sendKeys(newFullName);
		
		sfUserPage.age.click();
		sfUserPage.age.clear();
		sfUserPage.age.sendKeys(newAge);
		browser.selectOption = selectOption.bind(browser);
		browser.selectOption(protractor.By.model('user.gender'), newGender);
		
		// Submit updated profile
		browser.driver.findElement(By.id('saveBtn')).click();
	});
	
	it('Check updated About Me', function() {

	});
});
