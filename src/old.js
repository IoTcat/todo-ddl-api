#!/usr/bin/env node
const request = require('request');
require('shelljs/global');
const ora = require('ora');
const boxen = require('boxen');
const table = require('cli-table');
const colors = require('colors');
const fs = require('fs');
const md5 = require('md5');

const conf = new (require('conf'))({
	email: {
		type: "string",
		format: "email"
	},
	url: {
		type: "string",
		format: "url",
		default: "https://api.yimian.xyz/todo-ddl/"
	},
	taskData: {
		type: "array",
		default: []
	},
	ddlData: {
		type: "array",
		default: []
	}
});

if(conf.get('url') == undefined) conf.set('url', "https://api.yimian.xyz/todo-ddl/");
if(conf.get('email') == undefined) conf.set('email', "");
if(conf.get('taskData') == undefined) conf.set('taskData', []);
if(conf.get('ddlData') == undefined) conf.set('ddlData', []);


const tds = ['todo', 'task', 'history', 'ash'];

var tools = {
	_parseTime: t => {
		var st = new Date(t);
		return `${st.getFullYear()}-${st.getMonth()+1}-${st.getDate()} ${st.getHours()}:${st.getMinutes()}:${st.getSeconds()}`;
	},
	_showInfo: (arr, head, value) => {
		var info = new table({
			'head': head
		});
		arr.forEach((i, index) => {
			var item = conf.get('taskData')[i];
			info.push(value(item));
			if(index == arr.length-1){
				console.log(info.toString());
			}
		});
	},
	td: {
		_filter: condition => new Promise(resolve => {
			var arr = [];
			conf.get('taskData').forEach((item, index) => {
				if(condition(item)){
					arr.push(index);
				}
				if(index == conf.get('taskData').length-1){
					resolve(arr);
				}
			});
		}),
		task: {
			_: item => (!item.isDel && item.tt == null),
			_head: ['id', 'class', 'name', 'Create Time'],
			_value: item => [item.id, item.class, item.name, tools._parseTime(item.st)],
			ls: {}
		},
		todo: {
			_: item => !item.isDel && item.tt != null && item.et == null,
			_head: ['id', 'class', 'name', 'Create Time', 'Start Time'],
			_value: item => [item.id, item.class, item.name, tools._parseTime(item.st), tools._parseTime(item.tt)],
			ls: {}
		},
		history: {
			_: item => !item.isDel && item.tt != null && item.et != null,
			_head: ['id', 'class', 'name', 'Create Time', 'Start Time', 'Finish Time'],
			_value: item => [item.id, item.class, item.name, tools._parseTime(item.st), tools._parseTime(item.tt), tools._parseTime(item.et)],
			ls: {}
		},
		ash: {
			_: item => item.isDel,
			_head: ['id', 'class', 'name', 'Create Time', 'Start Time', 'Finish Time'],
			_value: item => [item.id, item.class, item.name, tools._parseTime(item.st), tools._parseTime(item.tt), tools._parseTime(item.et)],
			ls: {}
		}
	}
};

tds.forEach(item => {
	tools.td[item].ls.all = async () => {
		tools._showInfo(await tools.td._filter(tools.td[item]._), tools.td[item]._head, tools.td[item]._value);
	};
	tools.td[item].__ = async () => new Promise(async resolve => {
		var arr = [];
		var index = await tools.td._filter(tools.td[item]._);
		index.forEach((i, ind) => {
			arr.push(conf.get('taskData')[i]);
			if(ind == index.length-1){
				resolve(arr);
			}
		});
	});
});


const getIDs = (id, data, zone) => new Promise(resolve => {
	var ban = ora('Searching IDs...').start();
	var arr = [];
	data.forEach((item, index) => {
		if(item.id.substring(0, String(id).length) == id && tools.td[zone]._(item)){
			arr.push(index);
			ban.info(item.id);
			ban = new ora('Searching IDs...').start();
		}
		if(index == data.length-1){
			ban.succeed('Search finished!! Found '+arr.length+' result!!');
			resolve(arr);
		}
	});
});

const getID = async (id, data, zone) => {
	var arr = await getIDs(id, data, zone);
	if(arr.length > 1){
		console.error(boxen('Which ID do you want?'));
		return null;
	}
	if(arr.length < 1){
		console.error(boxen('No ID Found!! Please use '+'td task|todo|history|ddl ls'.blue+' to check!!'));
		return null;
	}
	return arr[0];
};




const argv = require('yargs')
	.command("config", "Set todo-ddl tool confignation..", yargs => {
		var argv = yargs
			.reset()
			.command("show", "Show config details..", yargs2 => {
				var argv = yargs2
				.reset()
				.version(false)
				.help("")
				.argv
				return argv;
			}, yargs2 => {
				var configInfo = new table();
				configInfo.push({email: conf.get('email')},{remote: conf.get('url')});
				console.log(configInfo.toString());
			})
			.command("reset", "Reset All config..", yargs2 => {
				var argv = yargs2
				.reset()
				.version(false)
				.help("")
				.argv
				return argv;
			}, yargs2 => {
				conf.set('url', "https://api.yimian.xyz/todo-ddl/");
				conf.set('email', "");
			})
		.option("e", {
			alias: "email",
			default: "",
			describe: "Your Email to login.",
			demand: false,
			type: 'string'
		})
		.option("r", {
			alias: "remote",
			default: "",
			describe: "Remote todo-ddl server URL.",
			demand: false,
			type: 'string'
		})
		.version(false)
		.argv

		return argv;
	}, yargs => {
		if(yargs.e == "" && yargs.r == ""){
			console.error(boxen('Please use '+'td config -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		if(yargs.e != ""){
			conf.set('email', yargs.e);
		}
		if(yargs.r != ""){
			conf.set('url', yargs.r);
		}
		var configInfo = new table();
		configInfo.push({email: conf.get('email')},{remote: conf.get('url')});
		console.log(configInfo.toString());
	})


	/* init */
	.command("init", "Set todo-ddl tool confignation..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, yargs => {
		var t = (new Date()).valueOf();
		var ban = ora('Clear Data...').start();
		var data = conf.get('taskData');
		for(var i = 0; i < data.length; i ++){
			ban.succeed(data[i].id.red);
			ban = new ora('Clear Data...').start();
		}
		conf.set('taskData', []);
		ban.succeed(`Finished in ${(new Date()).valueOf() - t} ms!!`);
	})


	/* ls */
	.command("ls", "= td todo ls..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, yargs => {
		tools.td.todo.ls.all();
	})

	/* lst */
	.command("lst", "= td todo ls..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, yargs => {
		tools.td.task.ls.all();
	})

	/* lsh */
	.command("lsh", "= td todo ls..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, yargs => {
		tools.td.history.ls.all();
	})

	/* lsa */
	.command("lsa", "= td todo ls..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, yargs => {
		tools.td.ash.ls.all();
	})

	/* new */
	.command("new", "= td task add -n <name> -c [class]..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, yargs => {
		if(yargs._.length < 2 || yargs._.length > 3){
			return;
		}
		if(yargs._.length == 2){
			yargs._[2] = "default";
		}
		if(yargs._[1].length > 30){
			console.error(boxen('Too Long Name!!!\nPlease shorten your task name!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		var data = conf.get('taskData');
		data.push({
			id: md5((new Date()).valueOf()).substring(0, 6),
			name: yargs._[1],
			class: yargs._[2],
			st: (new Date()).valueOf(),
			tt: null,
			et: null,
			isDel: false
		});
		conf.set('taskData', data);
		tools.td.task.ls.all();
	})

	/* add */
	.command("add", "= td todo add..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, async yargs => {
		if(yargs._.length != 2) {
			return;
		}
		var data = conf.get('taskData');
		var index = await getID(yargs._[1], data, 'task');
		if(index==null){
			console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		data[index].tt = (new Date()).valueOf();
		conf.set('taskData', data);
		tools.td.todo.ls.all();
	})


	/* done */
	.command("done", "= td todo done..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, async yargs => {
		if(yargs._.length != 2) {
			return;
		}
		var data = conf.get('taskData');
		var index = await getID(yargs._[1], data, 'todo');
		if(index==null){
			console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		data[index].et = (new Date()).valueOf();
		conf.set('taskData', data);
		tools.td.todo.ls.all();
	})


	/* return */
	.command("return", "= td todo return..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, async yargs => {
		if(yargs._.length != 2) {
			return;
		}
		var data = conf.get('taskData');
		var index = await getID(yargs._[1], data, 'todo');
		if(index == null) index = getID(yargs._[1], data, 'history');
		if(index==null){
			console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		data[index].tt = null;
		data[index].et = null;
		conf.set('taskData', data);
		tools.td.todo.ls.all();
	})


	/* rm */
	.command("rm", "= td task del..", yargs => {
		var argv = yargs
		.reset()
		.version(false)
		.argv

		return argv;
	}, async yargs => {
		if(yargs._.length != 2) {
			return;
		}
		var data = conf.get('taskData');
		var index = await getID(yargs._[1], data, 'todo');
		if(index == null) index = getID(yargs._[1], data, 'task');
		if(index == null) index = getID(yargs._[1], data, 'history');
		if(index==null){
			console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
			return;
		}
		data[index].isDel = true;
		conf.set('taskData', data);
		//tools.td.todo.ls.all();
	})

	/* tasks */
	.command("task", "Add, del and change tasks..", yargs => {
		var argv = yargs
		.reset()
		.command("ls", "Show all tasks..", yargs2 => {
			var argv = yargs2
			.reset()
			.version(false)
			.help("")
			.argv
			return argv;
		}, yargs2 => {
			tools.td.task.ls.all();
		})
		.command("add", "td task add -n <name> -c [class]".green+"  Add new task..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("n", {
				alias: "name",
				default: "",
				describe: "Task name.",
				demand: true,
				type: 'string'
			})
			.option("c", {
				alias: "class",
				default: "",
				describe: "Task class.",
				demand: false,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, yargs2 => {
			if(yargs2.n == "" && yargs2.c == ""){
				console.error(boxen('Please use '+'td task -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			if(yargs2.n == ""){
				console.error(boxen('No Task Name!!!\nPlease use '+'td task -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			if(yargs2.c == ""){
				yargs2.c = "default";
			}
			if(yargs2.c.length > 30){
				console.error(boxen('Too Long Name!!!\nPlease shorten your task name!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			var data = conf.get('taskData');
			data.push({
				id: md5((new Date()).valueOf()).substring(0, 6),
				name: yargs2.n,
				class: yargs2.c,
				st: (new Date()).valueOf(),
				tt: null,
				et: null,
				isDel: false
			});
			conf.set('taskData', data);
			tools.td.task.ls.all();
		})

		.command("del", "td del -i <id>".green+"  Delete task..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("i", {
				alias: "id",
				default: "",
				describe: "Task id.",
				demand: true,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, async yargs2 => {
			if(yargs2.i == ""){
				console.error(boxen('No Task ID!!!\nPlease use '+'td task -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			var data = conf.get('taskData');
			var index = await getID(yargs2.i, data, 'task');
			if(index==null){
				console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			data[index].isDel = true;
			conf.set('taskData', data);
			tools.td.task.ls.all();
		})
		.version(false)
		.argv

		return argv;
	}, yargs => {
		console.error(boxen('Please use '+'td task -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
		return;
	})


	/* todo */
	.command("todo", "Add, return and done todos..", yargs => {
		var argv = yargs
		.reset()
		.command("ls", "td todo ls".green+"  Show all todos..", yargs2 => {
			var argv = yargs2
			.reset()
			.version(false)
			.help("")
			.argv
			return argv;
		}, yargs2 => {
			tools.td.todo.ls.all();
		})

		.command("add", "td todo add -i <id>".green+"  Add new todo from tasks..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("i", {
				alias: "id",
				default: "",
				describe: "Task ID.",
				demand: true,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, async yargs2 => {
			if(yargs2.i == ""){
				console.error(boxen('Please use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			var data = conf.get('taskData');
			var index = await getID(yargs2.i, data, 'task');
			if(index==null){
				console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			data[index].tt = (new Date()).valueOf();
			conf.set('taskData', data);
			tools.td.todo.ls.all();
		})

		.command("return", "td todo return -i <id>".green+"  Delete task..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("i", {
				alias: "id",
				default: "",
				describe: "Task id.",
				demand: true,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, async yargs2 => {
			if(yargs2.i == ""){
				console.error(boxen('No Task ID!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			var data = conf.get('taskData');
			var index = await getID(yargs2.i, data, 'todo');
			if(index==null){
				console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			data[index].tt = null;
			conf.set('taskData', data);
			tools.td.todo.ls.all();
		})


		.command("done", "td todo done -i <id>".green+"  Delete task..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("i", {
				alias: "id",
				default: "",
				describe: "Task id.",
				demand: true,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, async yargs2 => {
			if(yargs2.i == ""){
				console.error(boxen('No Task ID!!!\nPlease use '+'td task -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			var data = conf.get('taskData');
			var index = await getID(yargs2.i, data, 'todo');
			if(index==null){
				console.error(boxen('Illegal operation!!!\nPlease use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			data[index].et = (new Date()).valueOf();
			conf.set('taskData', data);
			tools.td.todo.ls.all();
		})
		.version(false)
		.argv

		return argv;
	}, yargs => {
		console.error(boxen('Please use '+'td todo -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
		return;
	})




	/* history */
	.command("history", "Check history..", yargs => {
		var argv = yargs
		.reset()
		.command("ls", "td history ls".green+"  Show all history..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("a", {
				alias: "ash",
				default: "",
				describe: "Show ash bin..",
				demand: false,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, yargs2 => {
			if(yargs2.a == ""){
				tools.td.history.ls.all();
			}else{
				tools.td.ash.ls.all();
			}
		})

		.command("return", "td history return -i <id>".green+"  Return item to tasks..", yargs2 => {
			var argv = yargs2
			.reset()
			.option("i", {
				alias: "id",
				default: "",
				describe: "Task id.",
				demand: true,
				type: 'string'
			})
			.version(false)
			.help("")
			.argv
			return argv;
		}, async yargs2 => {
			if(yargs2.i == ""){
				console.error(boxen('No Task ID!!!\nPlease use '+'td history -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			var data = conf.get('taskData');
			var index = await getID(yargs2.i, data, 'history');
			if(index==null){
				console.error(boxen('Illegal operation!!!\nPlease use '+'td history -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
				return;
			}
			data[index].tt = null;
			data[index].et = null;
			conf.set('taskData', data);
			tools.td.history.ls.all();
		})
		.version(false)
		.argv

		return argv;
	}, yargs => {
		console.error(boxen('Please use '+'td history -h '.red+'to get Help!!', {padding: 1, margin: 1, borderStyle: 'double'}));
		return;
	})
	.help()
	.alias("h", "help")
	.alias("v", "version")
	//.recommendCommands()
	.epilogue("")
	.argv;



