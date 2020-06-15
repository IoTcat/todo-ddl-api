module.exports = () => {
	var o = {
		search: (s, w, zone) => {
			let res = [];
			let ban = ora(`Searching ${w}s...`).start();
			for(const cla of zone){
				for(const i of cla){
					let pos = i[w].indexOf(s);
					if(pos != -1 && res.indexOf(i[w]) == -1){
						res.push(i[w]);
						ban.info(i[w].substring(0, pos) + String(s).yellow + i[w].substring(pos + String(s).length) + '     ' + ((typeof i.name == "undefined")?'':i.name) + ((typeof i.content == "undefined")?'':i.content));
						ban = new ora(`Searching ${w}s...`).start();
					}
				}
			}
			ban.succeed('Search finished!! Found '+res.length+' results!!');
			return res;
		},
		byIDs: (id, arr) => arr.filter(item => id.indexOf(item.id) >= 0),
		updateTd: (id, w, s) => {
			let d = data.td();
			for(let i = 0; i < d.length; i ++){
				if(d[i].id == id){
					d[i][w] = s;
					d[i]['lastOperateTime'] = (new Date()).valueOf();
					break;
				}
			}
			data.td(d);
		},
		mergeArray: (a, b) => Array.from(new Set(a.concat(b))),
		merge: (a, b) => {
			let td = [];

			for(let td1 of a.td){
				for(let td2 of b.td){

					if(td1.id == td2.id && !td.some(item => item.id == td2.id)){
						let obj = {};
						let logs = [];
						for(let l2 of td2.logs){
							if(!logs.some(item => item.id == l2.id)){
								let l1 = td1.logs.filter(item => item.id == l2.id);
								if(l1.length){
									l1 = l1[0];
									if(l1.lastOperateTime < l2.lastOperateTime){
										logs.push(l2);
									}else{
										logs.push(l1);
									}
								}else{
									logs.push(l2);
								}
							}
						}

						for(let l1 of td1.logs){
							if(!logs.some(item => item.id == l1.id)){
								let l2 = td2.logs.filter(item => item.id == l1.id);
								if(l2.length){
									l2 = l2[0];
									if(l2.lastOperateTime < l1.lastOperateTime){
										logs.push(l1);
									}else{
										logs.push(l2);
									}
								}else{
									logs.push(l1);
								}
							}
						}

						if(td1.lastOperateTime < td2.lastOperateTime){
							obj = td2;
						}else{
							obj = td1;
						}
						obj.logs = logs;
						td.push(obj);
					}

				}
			}


			for(let td1 of a.td){
				if(!td.some(item => item.id == td1.id)){
					td.push(td1);
				}
			}

			for(let td2 of b.td){
				if(!td.some(item => item.id == td2.id)){
					td.push(td2);
				}
			}


			/* ddl */
			//console.log(td);
			return {
				'td': td,
				'ddl': []
			};
		}
	}

	const colors = require('colors');
	const ora = require('ora');
	var data = require(__dirname + '/../utilities/data.js')();

	return o;
}
