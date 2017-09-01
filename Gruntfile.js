module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-ts');
    require('time-grunt')(grunt);

    grunt.initConfig({
        ts: {
            app: {
                tsconfig: 'tsconfig.json',
                options: {
                    fast: 'never',
                }
            },
        },
    });
    grunt.registerTask('build_app', [
        'ts:app'
    ]);
  
    grunt.registerTask('default', ['build_app']);
};
