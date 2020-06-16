module.exports = yargs => {

	const tools = require(__dirname + '/../utilities/tdTools.js')();
	const colors = require('colors');
	const boxen = require('boxen');
	const table = require('cli-table');

	yargs = yargs

	.command('ll', "td ll".green + " List all logs..", yargs => yargs, argv => {
		let msg = tools.ll();
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
	})

	.command('log', "td log <content>".green + " Add new log..", yargs => yargs, argv => {
		let msg = tools.log(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
	})

	.command('select', "td select <id>".green + " Select a task to record logs..", yargs => yargs, argv => {
		if(argv._.length != 2){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.select(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
	})

	.command('rml', "td rml <logID>".green + " Remove log..", yargs => yargs, argv => {
		let msg = tools.rml(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
	})
	return yargs;
}