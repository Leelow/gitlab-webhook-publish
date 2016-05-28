const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const request = require( 'request' );
const utils = require( './lib/utils' );
const path = require( 'path' );
const hat = require( 'hat' );
const fs = require( 'fs-extra' );

const config = require( './lib/loader.js' );

const regex = {
    namespace: new RegExp( config.webhooker.filter.namespace ),
    branch: new RegExp( config.webhooker.filter.branch )
};

var app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {extended: true} ) );

/** Executed action on the repository **/
function action( dir, res, callback ) {

    var repo_dir = path.join( dir, res['project']['name'] );

    // Remove .git dir
    var git_dir = path.join( repo_dir, '.git' );
    if ( fs.existsSync( git_dir ) && fs.statSync( git_dir ).isDirectory() )
        fs.removeSync( git_dir );

    // Publish package
    utils.publishPackage( config, repo_dir, function () {

        // Remove local repo dr
        fs.removeSync( dir );

        console.log( '"' + res['project']['name'] + '" published.' );

        return callback();

    } );


}

/** Install a hook on a project **/
function installCommitHook( config, project_id, callback ) {

    var args = {
        id: project_id,
        url: 'http://' + config.webhooker.host + ':' + config.webhooker.port + '/hook',
        push_events: true,
        merge_requests_events: false,
        tag_push_events: false,
        note_events: false,
        enable_ssl_verification: true
    };

    request( {
        url: config.gitlab.url + '/api/v3/projects/' + project_id + '/hooks',
        method: 'POST',
        headers: {
            'PRIVATE-TOKEN': config.gitlab.token
        },
        json: args
    }, function ( err ) {

        if ( typeof callback === 'function' ) {

            if ( err )
                return callback( err );
            else
                return callback( null );

        }
    } );

}

/** Add an hooker when a project is created **/
app.post( '/project_create', function ( req, res ) {

    if ( !req.body ) {
        res.writeHead( 404 );
        return res.send();
    }

    if ( req.body['event_name'] == 'project_create' ) {

        var project_id = req.body['project_id'];

        return installCommitHook( config, project_id, function () {

            res.writeHead( 200 );
            return res.send();

        } );
    }

} );

/** Hook which is executed when a project is commited **/
app.post( '/hook', function ( req, res ) {

    // Check if the committed project corresponds
    if ( regex.branch.test( req.body['ref'] ) && regex.namespace.test(req.body['project']['namespace']) ) {

        var url = req.body['project']['git_http_url'];
        var tmp_dir = path.join( __dirname, 'tmp', hat() );

        // Download repo
        utils.downloadRepo( config, url, tmp_dir, function ( err ) {

            if ( err )
                throw err;

            // Action repo file
            action( tmp_dir, req.body, function ( err ) {

                if ( err )
                    throw err;

                res.writeHead( 200 );
                return res.send();

            } );

        } );

    }
    else {

        res.writeHead( 404 );
        return res.send();

    }

} );

app.listen( 3000, function () {
    console.log( 'gitlab-webhook-publish server started on :' + config.webhooker.port + '.' );
} );