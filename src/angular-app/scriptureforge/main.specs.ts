import './main';

import '../bellows/main.common.specs';

const webpackRequire = require as any;
const testsContext = webpackRequire.context('.', true, /\.spec$/);
testsContext.keys().forEach(testsContext);
