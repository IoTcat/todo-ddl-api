module.exports = (yargs) => {
	var o = {
		push: () => {
			let ban = ora(`Pushing...`).start();
			request.post(data.config.remote(), {
				form:{
					action: 'push',
					email: data.config.email(),
					data: JSON.stringify({
						td: data.td(),
						ddl: data.ddl()
					})
				}	
			}, (err, res, body) => {
				if(err){
					ban.fail('Push data failed with errors!!');
				}else{
					ban.succeed('Push data to remote successfully!!');
					
				}
				process.exit();
			});
		},
		pull: (f) => {
			let ban = ora(`Pulling...`).start();
			request.post(data.config.remote(), {
				form:{
					action: 'pull',
					email: data.config.email(),
					data: JSON.stringify({})
				}	
			}, (err, res, body) => {
				if(err){
					ban.fail('Pull data failed with errors!!');
				}else{
					try{
						body = JSON.parse(body);
					}catch(e){
						ban.fail('Pull data failed with errors!!');
						process.exit();
					}
					let d = find.merge({td: data.td(), ddl: data.ddl()}, body);
					data.td(d.td);
					data.ddl(d.ddl);
					ban.succeed('Push data to remote successfully!!');
					if(typeof f != "undefined") f();
				}
				process.exit();
			});
		}
	}

	const request = require('request');
	const ora = require('ora');
	var data = require(__dirname + '/../utilities/data.js')();
	var find = require(__dirname + '/../utilities/find.js')();

	yargs = yargs
	.command('push', "td push".green + " Push local data to remote..", yargs => yargs, argv => {
		o.push();
	})
	.command('pull', "td pull".green + " Pull remote data to local..", yargs => yargs, argv => {
		o.pull();
	})
	.command('sync', "td sync".green + " Sync remote and local data..", yargs => yargs, argv => {
		o.pull(()=>{
			o.push();
		});
	})

	return yargs;
}