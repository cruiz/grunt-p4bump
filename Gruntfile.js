module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-npm');

    grunt.initConfig({
        p4bump: {
            bump: 'patch',
            file: 'package.json',
            commitMessage: '[grunt-p4bump] Release %NAME% v%VERSION%',
            p4GlobalOptions: '',
            p4SubmitOptions: '',
            p4EditOptions: '',
            skipP4Submit: false,
            skipBump: false
        }
    });

    grunt.loadTasks('tasks');
    grunt.registerTask('default', ['test']);
};