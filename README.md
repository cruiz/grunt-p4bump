# grunt-p4bump

**edit, bump n save, p4 submit**

## Installation

Install npm package, next to your project's `Gruntfile.js` file:

    npm install grunt-p4bump --save-dev

Add this line to your project's `Gruntfile.js`:

    grunt.loadNpmTasks('grunt-p4bump');


## Usage 

Given that the current version is `0.0.1` for project name `cars`:

```
$ grunt p4bump
>> Version bumped to 0.0.2
>> Submitted as "Release for cars v0.0.2"
```

## Configuration

This shows all the available config options with their default values.

```js
p4bump: {
    options: {
        bump: 'patch', // patch, minor, major
        file: 'package.json',
        commitMessage: '[grunt-p4bump] Release %NAME% v%VERSION%',
        p4GlobalOptions: '', // options to use with p4
        p4SubmitOptions: '',
        p4EditOptions: '',
        skipP4Submit: false,
        skipBump: false
    }
}
```
