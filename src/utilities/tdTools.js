module.exports = () => {
	var o = {
		__: {
			id: (aid, zone) => {
				const ids = find.search(aid, 'id', zone);
				if(zone.length > 1){
					return find.byIDs(ids, data.td());
				}
				return find.byIDs(ids, zone[0]);
			},
			name: (aname, zone) => {
				const names = find.search(aname, 'name', zone);
				return find.byIDs(names);
			},
			getLogs: id => data.td().filter(item => item.id == id)[0].logs.filter(item2 => !item2.isDel),
			getAllLogs: id => data.td().filter(item => item.id == id)[0].logs,
			resetLog: id => {
				if(id == data.log()) {
					data.log('null');
				}
			},
			addLog: (id, content) => {
				let logs = o.__.getAllLogs(id);
				logs.push({
					'id': o.__.generateID(16),
					'content': content,
					createTime: (new Date()).valueOf(),
					lastOperateTime: (new Date()).valueOf(),
					isDel: false
				});
				find.updateTd(id, 'logs', logs);
			},
			rmLog: (id, lid) => {
				let logs = o.__.getAllLogs(id);
				for(let i of logs){
					if(i.id == lid){
						i.isDel = true;
						break;
					}
				}
				find.updateTd(id, 'logs', logs);
			},
			getAllClass: (zone) => {
				let arr = [];
				for(const cla of zone){
					for(const i of cla){
						if(arr.indexOf(i.class) != -1){
							arr.push(i.class);
						}
					}
				}
				return arr;
			},
			parseTime: t => {
				if(!t){
					return 'null';
				}
				const st = new Date(t);
				return `${st.getFullYear()}-${st.getMonth()+1}-${st.getDate()} ${st.getHours()}:${st.getMinutes()}:${st.getSeconds()}`;
			},
			generateID: (l) => md5((new Date()).valueOf()).substring(0, l),
			show: arr => {
				let configInfo = new table({
					head: ['id', 'class', 'name', 'createTime', 'todoTime', 'endTime']
				});
				for(const i of arr){
					configInfo.push([i.id, i.class, i.name, o.__.parseTime(i.createTime), o.__.parseTime(i.todoTime), o.__.parseTime(i.endTime)]);
				}
				console.log(configInfo.toString());
			},
			showLogs: arr => {
				let configInfo = new table({
					head: ['id', 'content', 'createTime']
				});
				for(const i of arr){
					configInfo.push([i.id, i.content, o.__.parseTime(i.createTime)]);
				}
				console.log(configInfo.toString());
			}
		},
		getAll: () => data.td(),
		getAllClass: () => o.__.getAllClass([data.td()]),
		getByaID: id =>  o.__.id(id, [data.td()]),
		getByaName: name => o.__.name(name, [data.td()]),
		new: (name, cla) => {
			let d = data.td();
			if(!cla){
				cla = 'default';
			}
			if(!name){
				return 'Name should not be empty!!';
			}
			if(name.length > 25){
				return 'Name too Long!!';
			}
			d.push({
				id: o.__.generateID(8),
				'name': name,
				'class': cla,
				createTime: (new Date()).valueOf(),
				todoTime: null,
				endTime: null,
				lastOperateTime: (new Date()).valueOf(),
				idDel: false,
				logs: [{
					id: o.__.generateID(16),
					content: 'Todo Item Created!!',
					createTime: (new Date()).valueOf(),
					lastOperateTime: (new Date()).valueOf()
				}]
			});
			data.td(d);
			return;
		},
		rm: aid => {
			let items = o.__.id(aid, [o.todo.getAll(), o.task.getAll(), o.history.getAll()]);
			if(items.length > 1){
				return 'Which id do you want to remove?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			find.updateTd(items[0].id, 'isDel', true);
			console.log(items[0].id);
			o.__.resetLog(items[0].id);
		},
		add: aid => {
			let items = o.__.id(aid, [o.todo.getAll()]);
			if(items.length > 1){
				return 'Which id do you want to add to task?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			find.updateTd(items[0].id, 'todoTime', (new Date()).valueOf());
		},
		return: aid => {
			let items = o.__.id(aid, [o.task.getAll()]);
			if(items.length > 1){
				return 'Which id do you want to return?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			find.updateTd(items[0].id, 'todoTime', null);
			o.__.resetLog(items[0].id);
		},
		done: aid => {
			let items = o.__.id(aid, [o.task.getAll()]);
			if(items.length > 1){
				return 'Which id do you want to finish?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			find.updateTd(items[0].id, 'endTime', (new Date()).valueOf());
			o.__.resetLog(items[0].id);
		},
		recover: aid => {
			let items = o.__.id(aid, [o.history.getAll()]);
			if(items.length > 1){
				return 'Which id do you want to recover?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			find.updateTd(items[0].id, 'endTime', null);
		},
		/* log */
		ll: () => {
			if(data.log() == 'null'){
				return 'No Task Pointed!! Please select a task to begin!!';
			}
			let logs = o.__.getLogs(data.log());
			console.log('At task  ' + data.log() + '  ' + o.__.id(data.log(), [data.td()])[0].name);
			o.__.showLogs(logs);
		},
		select: aid => {
			let items = o.__.id(aid, [o.task.getAll()]);
			if(items.length > 1){
				return 'Which id do you want to add to task?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			data.log(items[0].id);
			console.log(items[0].id);
		},
		log: content => {
			if(data.log() == "null"){
				return 'No Task Pointed!! Please select a task to begin!!';
			}
			o.__.addLog(data.log(), content);
		},
		rml: aid => {
			if(data.log() == "null"){
				return 'No Task Pointed!! Please select a task to begin!!';
			}
			let items = o.__.id(aid, [o.__.id(data.log(), [data.td()])[0].logs]);
			if(items.length > 1){
				return 'Which id do you want to add to task?';
			}
			if(items.length <= 0){
				return 'Not found!!';
			}
			o.__.rmLog(data.log(), items[0].id);
			console.log(items[0].id);
		},
		/* sub */
		todo: {
			getAll: () => data.td().filter(item => !item.isDel && item.todoTime == null),
			getByaID: id =>  o.__.id(id, [o.todo.getAll()]),
			getByaName: name => o.__.name(name, [o.todo.getAll()]),
			getAllClass: () => o.__.getAllClass([o.todo.getAll()]),
		},
		task: {
			getAll: () => data.td().filter(item => !item.isDel && item.todoTime != null && item.endTime == null),
			getByaID: id =>  o.__.id(id, [o.task.getAll()]),
			getByaName: name => o.__.name(name, [o.task.getAll()]),
			getAllClass: () => o.__.getAllClass([o.task.getAll()]),
		},
		history: {
			getAll: () => data.td().filter(item => !item.isDel && item.todoTime != null && item.endTime != null),
			getByaID: id =>  o.__.id(id, [o.history.getAll()]),
			getByaName: name => o.__.name(name, [o.history.getAll()]),
			getAllClass: () => o.__.getAllClass([o.history.getAll()]),
		},
		ash: {
			getAll: () => data.td().filter(item => item.isDel),
			getByaID: id =>  o.__.id(id, [o.ash.getAll()]),
			getByaName: name => o.__.name(name, [o.ash.getAll()]),
			getAllClass: () => o.__.getAllClass([o.ash.getAll()]),
		}
	}

	var data = require(__dirname + '/../utilities/data.js')();
	const find = require(__dirname + '/../utilities/find.js')();
	const colors = require('colors');
	const boxen = require('boxen');
	const table = require('cli-table');
	const md5 = require('md5');

	return o;
}