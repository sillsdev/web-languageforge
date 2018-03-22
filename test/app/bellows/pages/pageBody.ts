import {by, element} from 'protractor';

export class PageBody {
  phpError = element(by.xpath('//*[contains(.,\'A PHP Error was encountered\')]'));
}
