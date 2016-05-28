const fs = require( 'fs' );
const exec = require( 'child_process' ).exec;

var utils = {};

/**
 * Download a repository
 * @param config Config containing git credentials
 * @param url Public url of the project
 * @param dest Path of the destination directory
 * @param callback() Callback executed after the repository is downloaded
 */
utils.downloadRepo = function ( config, url, dest, callback ) {

    if ( !fs.existsSync( dest ) || !fs.statSync( dest ).isDirectory() )
        fs.mkdirSync( dest );

    // Parse git url to add credentials
    var split = url.split( '//' );
    url = split[0] + '//' + config.gitlab.admin_login + ':' + config.gitlab.admin_password + '@' + split[1];

    var child = exec( 'git clone --depth 1 ' + url, {cwd: dest} );

    child.on( 'close', function () {
        if ( typeof callback === 'function' )
            return callback();
    } );

};

/**
 * Add an user to the npm registry
 * @param config Config containing npm registry credentials and url
 * @param callback() Callback executed after the user is created
 */
function addUser( config, callback ) {

    var i = 0;
    var input = [config.npm_registry.login, config.npm_registry.password, config.npm_registry.email];
    var child1 = exec( 'npm set registry ' + config.npm_registry.url );

    child1.on( 'close', function () {
        
        var child2 = exec( 'npm adduser --registry ' + config.npm_registry.url );

        child2.stdout.on( 'data', function ( ) {

            child2.stdin.write( input[i++] + '\n' );
            if ( i == input.length )
                return callback()

        } );

    } );

}

/**
 * Publish a npm package to a repository
 * @param config Config containing repository credentials and url
 * @param dir package directory
 * @param callback() Callback executed after the package is published
 */
utils.publishPackage = function ( config, dir, callback ) {

    addUser( config, function () {

        var child = exec( 'npm publish ' + dir );

        child.on( 'close', function () {

            if ( typeof callback === 'function' )
                return callback();

        } );

    } );

};

module.exports = utils;