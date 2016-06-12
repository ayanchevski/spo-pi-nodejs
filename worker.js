var worker = require('cluster').worker;
var math = require('mathjs').create({ number: 'BigNumber', precision: 1000 });

worker.on('message', message => {
	var members = [];
	for (var i = message.from; i <= message.to; i++) {
		members.push(math.eval('((((-1)^n) * (4 * n)!) * (1123 + 21460 * n)) / ((4^n * n!)^4 * 882^(2 * n))', { n: math.bignumber(i) }));
	}

	const result = members.reduce((memo, item) => math.eval('x + y', { x: math.bignumber(item), y: math.bignumber(memo) }), 0);

	worker.send({
		from: message.from,
		to: message.to,
		result: result.toString()
	});
});