module.exports = function(config){
    config.set({


    basePath : '../',

    files : [
        'test/app/**/e2e/*.spec.js'
    ],

    autoWatch : false,

    browsers : ['PhantomJS'],

    frameworks: ['ng-scenario'],

    singleRun : true,

    proxies : {
      '/': 'http://e2etest.scriptureforge.local/'
    },

    plugins : [
            'karma-junit-reporter',
            'karma-jasmine',
            'karma-ng-scenario',    
            'karma-phantomjs-launcher'    
            ],

    junitReporter : {
      outputFile: 'test_out/e2e.xml',
      suite: 'e2e'
    }

})}
