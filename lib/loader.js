process.env.NODE_CONFIG_DIR = __dirname + '/../config';
const config = require( 'config' );

/**
 * Load config file
 * @type {{webhooker, gitlab, npm_registry}}
 */
module.exports = (function () {

    return {
        webhooker: config.get( 'webhooker' ),
        gitlab: config.get( 'gitlab' ),
        npm_registry: config.get( 'npm_registry' )
    };

})();
