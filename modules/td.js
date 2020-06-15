module.exports = yargs => {

	const tools = require(__dirname + '/../utilities/tdTools.js')();
	const colors = require('colors');
	const boxen = require('boxen');
	const table = require('cli-table');

	yargs = yargs
	.command('lt', "td lt".green + " List all todos..", yargs => yargs, argv => {
		tools.__.show(tools.todo.getAll());
	})

	.command('ls', "td ls".green + " List all tasks..", yargs => yargs, argv => {
		tools.__.show(tools.task.getAll());
	})

	.command('history', "td history".green + " List all history..", yargs => yargs, argv => {
		tools.__.show(tools.history.getAll());
	})

	.command('new', "td new <name> [class]".green + " Create new todo..", yargs => yargs, argv => {
		if(argv._.length < 2 || argv._.length > 3){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.new(argv._[1], (argv._.length == 2)?null:argv._[2]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		tools.__.show(tools.todo.getAll());
	})

	.command('add', "td add <id>".green + " Add todo to task..", yargs => yargs, argv => {
		if(argv._.length != 2){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.add(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		tools.__.show(tools.task.getAll());
	})

	.command('done', "td done <id>".green + " Finish task..", yargs => yargs, argv => {
		if(argv._.length != 2){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.done(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		tools.__.show(tools.task.getAll());
	})

	.command('rm', "td rm <id>".green + " Remove task..", yargs => yargs, argv => {
		if(argv._.length != 2){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.rm(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		console.log(argv._[1]);
	})

	.command('return', "td return <id>".green + " Return task to todo..", yargs => yargs, argv => {
		if(argv._.length != 2){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.return(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		tools.__.show(tools.task.getAll());
	})

	.command('recover', "td recover <id>".green + " Recover from history to task..", yargs => yargs, argv => {
		if(argv._.length != 2){
			console.error(boxen('Please use '+'td -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		let msg = tools.recover(argv._[1]);
		if(msg){
			console.error(boxen(msg, {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		tools.__.show(tools.task.getAll());
	})

	return yargs;
}