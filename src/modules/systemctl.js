module.exports = (yargs) => {

	yargs = yargs
	.command('init', "td init".green + " Clear All Data..", yargs => yargs, argv => {
		data.td([]);
		data.ddl([]);
		data.log('null');
	})

	var data = require(__dirname + '/../utilities/data.js')();
	const colors = require('colors');
	const boxen = require('boxen');

	return yargs;
}