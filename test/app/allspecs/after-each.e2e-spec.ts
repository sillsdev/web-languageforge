import 'jasmine';
import {browser} from 'protractor';

import {SfAppFrame} from '../bellows/shared/app.frame';
import {PageBody} from '../bellows/shared/page-body.element';
import {Utils} from '../bellows/shared/utils';

afterEach(() => {
  const appFrame = new SfAppFrame();
  const body = new PageBody();

  appFrame.errorMessage.isPresent().then(isPresent => {
    if (isPresent) {
      appFrame.errorMessage.getText().then(message => {
        if (message.includes('Oh. Exception')) {
          message = 'PHP API error on this page: ' + message;
          expect<any>(message).toEqual(''); // fail the test
        }
      });
    }
  });

  body.phpError.isPresent().then(isPresent => {
    if (isPresent) {
      body.phpError.getText().then(message => {
        message = 'PHP Error present on this page:' + message;
        expect<any>(message).toEqual(''); // fail the test
      });
    }
  });

  // output JS console errors and fail tests
  browser.manage().logs().get('browser').then(browserLogs => {
    for (const browserLog of browserLogs) {
      let text = browserLog.message;
      if (Utils.isMessageToIgnore(browserLog)) {
        return;
      }

      text = '\n\nBrowser Console JS Error: \n' + text + '\n\n';
      expect<any>(text).toEqual(''); // fail the test
    }
  });
});
