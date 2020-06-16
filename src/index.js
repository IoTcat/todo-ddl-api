#!/usr/bin/env node
var yargs = require('yargs');


/* help */
yargs = require(__dirname + '/modules/help.js')(yargs);
/* version */
yargs = require(__dirname + '/modules/version.js')(yargs);

/* systemctl */
yargs = require(__dirname + '/modules/systemctl.js')(yargs);

/* config */
yargs = require(__dirname + '/modules/config.js')(yargs);

/* td */
yargs = require(__dirname + '/modules/td.js')(yargs);

/* log */
yargs = require(__dirname + '/modules/log.js')(yargs);

/* push */
yargs = require(__dirname + '/modules/sync.js')(yargs);

argv = yargs.epilogue("-----------------------").argv;
