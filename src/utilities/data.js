module.exports = () => {

	var o = {
		__: (c, w, s) => {
			var data = conf.get(c);
			if(typeof s != "undefined"){
				data[w] = s;
				conf.set(c, data);
			}
			return data[w];
		},
		//config
		config: {
			email: s => o.__('config', 'email', s),
			remote: s => o.__('config', 'remote', s)
		},
		//data
		td: s => o.__('data', 'td', s),
		ddl: s => o.__('data', 'ddl', s),
		log: s => {
			if(typeof s != "undefined"){
				conf.set('log', s);
			}
			return conf.get('log');
		}
	};

	const conf = new (require('conf'))({
		projectName: 'todo-ddl',
		config: {
			type: "object",
			default: {
				email: '',
				remote: "https://api.yimian.xyz/todo-ddl/"
			}
		},
		data: {
			type: "object",
			default: {
				td: [],
				ddl: []
			}
		},
		log: {
			type: 'string',
			default: 'null'
		}
	});

	if(conf.get('config') == undefined) conf.set('config', {
		email: '',
		remote: "https://api.yimian.xyz/todo-ddl/"
	});
	if(conf.get('data') == undefined) conf.set('data', {
		td: [],
		ddl: []
	});
	if(conf.get('log') == undefined) conf.set('log', 'null');

	return o;
}