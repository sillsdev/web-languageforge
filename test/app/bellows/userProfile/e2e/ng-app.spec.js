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

// Radio selector from https://gist.github.com/alanning/5564640
/**
 * clicks a radio button element
 *
 * @method radioByValue
 * @param {string} name The name of the radio button group
 * @param {string} value The value of the option to select
 */
var radioByValue = function (name, value) {
  var locator = "input[name='" + name + "'][value='" + value + "']";
  driver.findElement(webdriver.By.css(locator))
    .click();
};


//}

var UserPage = function() {

};

describe('E2E testing: Login app', function() {
	var userPage = new UserPage();
	
	var loginService = require('../../loginService.js');
	loginService.loginAsUser();

	it('Test My Account', function() {
		browser.driver.get('http://jamaicanpsalms.scriptureforge.local/app/userprofile');
		
		browser.selectOption = selectOption.bind(browser);
		browser.selectOption(protractor.By.model('user.avatar_color'),   'Blue');
		browser.selectOption(protractor.By.model('user.avatar_shape'),   'Elephant');
		
		// TODO: Select communication preferences
		//WebElement e = browser.findElement(By.model('user.communicate_via'));
		//Select selectElement = new Select(e);
		//selectElement.selectByValue("SMS");

		browser.driver.findElement(By.id('saveBtn')).click();
		
		//browser.driver.findElement(by.id('avatar'))
		//browser.pause();
	});

});
