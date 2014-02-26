/*
 * Increment the version and perform a p4 commit
 *
 * grunt-p4bump
 *
 * @author cruiz
 */
var exec = require('child_process').exec;
var Q = require('q');

module.exports = function (grunt) {

    var DESC = 'Bump the version then perform a p4 submit.';
    grunt.registerMultiTask('p4bump', DESC, function () {
        var qexec = Q.denodeify(exec);

        var opts = this.options({
            bump: 'patch', // patch, minor, major
            file: 'package.json',
            commitMessage: '[grunt-p4bump] Release %NAME% v%VERSION%',
            p4GlobalOptions: '', // options to use with p4 submit
            p4SubmitOptions: '',
            p4EditOptions: '',
            skipP4Submit: false,
            skipBump: false
        });

        /**
         * Bumps the version attribute of the json object. Assumes file is composed of a
         * single JSON object with a Semantic Versioning formatted "version" attribute (3.2.1)
         *
         * @param {String} file path to the file to be checked out.
         * @param {Object} json
         * @param {String} version Semantic Versioned value
         */
        function bumpAndSave(file, json, version) {
            var defer = Q.defer();

            if (!opts.skipBump) {
                var oldVersion = version;
                if (!version) {
                    oldVersion = json.version || '';
                    var split = oldVersion.split('.');
                    if (split.length !== 3) {
                        throw 'Unknown version format. Expected x.x.x but found [' + oldVersion + ']';
                    }

                    if (opts.bump === 'patch') {
                        split[2] = ((split[2] << 0) + 1);
                    } else if (opts.bump === 'minor') {
                        split[1] = ((split[1] << 0) + 1);
                        split[2] = 0;
                    } else if (opts.bump === 'major') {
                        split[0] = ((split[0] << 0) + 1);
                        split[1] = 0;
                        split[2] = 0;
                    }

                    version = split.join('.');
                }

                grunt.verbose.ok('Bumped And Saved [' + file + '] from version ' + oldVersion + ' to ' + version);

                json.version = version;
                grunt.config('version', version);
                grunt.file.write(file, JSON.stringify(json, null, "    "));
                defer.resolve(json.version);
            } else {
                defer.resolve('');
            }

            return defer.promise;
        }

        /**
         * Performs a P4 submit assumes p4 command line is installed
         *
         * @param {String} file path to the file to be checked out.
         * @param {Object} jsonContent the json object represented in the given file path.
         * @returns {Promise}
         */
        function p4Submit(file, jsonContent) {
            var promise;
            if (!opts.skipP4Submit) {
                var mgs = opts.commitMessage.replace('%VERSION%', jsonContent.version)
                    .replace('%NAME%', jsonContent.name);
                var cmd = 'p4 -s ' + opts.p4GlobalOptions + ' submit -d "'
                    + mgs + '" ' + opts.p4SubmitOptions + ' ' + file;

                promise = qexec(cmd).then(function (err, stdout, stderr) {
                    if (err && err.code) {
                        throw err;
                    }

                    grunt.verbose.ok('Submitted ' + file);
                    return true;
                });
            } else {
                promise = Q.fcall(function () {
                    return true;
                });
            }

            return promise;
        }

        /**
         * Performs a p4 edit (checkout)
         *
         * @param {String} file path to the file to be checked out.
         * @returns {Promise}
         */
        function p4Edit(file) {
            var cmd = 'p4 ' + opts.p4GlobalOptions + ' edit ' + opts.p4EditOptions + ' ' + file;
            grunt.verbose.ok('Check out cmd:: ' + cmd);
            return qexec(cmd).then(function (err, stdout, stderr) {
                if (err && err.code) {
                    throw err;
                }

                grunt.verbose.ok('Check out ' + file);
                return true;
            });
        }

        //
        // do the work:
        // edit, bump n save, submit
        //
        var done = this.async();
        var filepath = opts.file;
        var problems = false;
        var forceVersion = null; //TODO: support forcing a specific version
        var json = grunt.file.readJSON(opts.file);
        p4Edit(filepath)
            .then(function () {
                return bumpAndSave(filepath, json, forceVersion);
            })
            .then(function () {
                return p4Submit(filepath, json);
            })
            .catch(function (error) {
                grunt.fatal('p4Bump error:' + error);
                problems = true;
            })
            .finally(function () {
                grunt.verbose.ok('p4Bump done.');
                done(!problems);
            });
    });
};

