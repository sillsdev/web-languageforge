module.exports = function(config){
    config.set({


    basePath : '../',

    files : [
        'test/app/**/e2e/*.spec.js'
    ],

    autoWatch : false,

    browsers : [],

    frameworks: ['ng-scenario'],

    singleRun : false,

    proxies : {
      '/': 'http://e2etest.scriptureforge.local/'
    },

    plugins : [
            'karma-teamcity-reporter',
            'karma-jasmine',
            'karma-ng-scenario',    
            'karma-phantomjs-launcher'    
            ],

    junitReporter : {
      outputFile: 'test_out/e2e.xml',
      suite: 'e2e'
    }

})}
