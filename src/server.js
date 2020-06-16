const app = require('express')();
const fs = require('fs');
const bodyParser = require('body-parser');

const find = require(__dirname + '/utilities/find.js')();

app.use(bodyParser.urlencoded({ extended: false }));


var data = {};

fs.exists('/mnt/var/todo-ddl/data.json', function(exists) {
	if(exists){
		data = JSON.parse(fs.readFileSync('/mnt/var/todo-ddl/data.json'));
	}else{
		fs.mkdir('/mnt/var/todo-ddl/', ()=>{});
	}
});


app.listen(13233 /*default port*/, () => console.log('todo-ddl listening on port 13233!'));

app.post('/', (req, res) => {
	let query = req.body;
	query.data = JSON.parse(query.data);
	if(!query.action || !query.email || !query.data){
		return;
	}
	if(query.action == 'push'){
		if(data.hasOwnProperty(query.email)){
			data[query.email] = find.merge(data[query.email], query.data);
		}else{
			data[query.email] = query.data;
		}
		fs.writeFile('/mnt/var/todo-ddl/data.json', JSON.stringify(data), ()=>{});
		res.send('ok');
	}
	if(query.action == 'pull'){
		if(data.hasOwnProperty(query.email)){
			res.send(data[query.email]);
		}else{
			res.status(404).send('');
		}
	}
});
