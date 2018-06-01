import './main.common';

import 'angular-mocks';
import 'angular-sanitize';

const webpackRequire = require as any;
const testsContext = webpackRequire.context('.', true, /\.spec$/);
testsContext.keys().forEach(testsContext);
