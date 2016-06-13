var worker = require('cluster').worker;
var math = require('mathjs').create({ number: 'BigNumber', precision: 1000 });

var firstMemo = null;
var secondMemo = null;
var thirdMemo = null;
var fourthMemo = null;

worker.on('message', message => {
	var members = [];
	for (var i = message.from; i <= message.to; i++) {
		if (firstMemo) {
			firstMemo = math.eval('4 * n * (4 * n - 1) * (4 * n - 2) * (4 * n - 3) * m', { n: math.bignumber(i), m: math.bignumber(firstMemo) });
		} else {
			firstMemo = math.eval('(4 * n)!', { n: math.bignumber(i) });
		}
		if (secondMemo) {
			secondMemo = math.eval('4 * m', { m: math.bignumber(secondMemo) });
		} else {
			secondMemo = math.eval('(4 ^ n)', { n: math.bignumber(i) });
		}
		if (thirdMemo) {
			thirdMemo = math.eval('m * n', { n: math.bignumber(i), m: math.bignumber(thirdMemo) });
		} else {
			thirdMemo = math.eval('n!', { n: math.bignumber(i) });
		}
		if (fourthMemo) {
			fourthMemo = math.eval('m * 882 * 882', { m: math.bignumber(fourthMemo) });
		} else {
			fourthMemo = math.eval('882^(2 * n)', { n: math.bignumber(i) });
		}
		members.push(math.eval('((((-1)^n) * f) * (1123 + 21460 * n)) / ((s * t)^4 * fo)', { n: math.bignumber(i), f: math.bignumber(firstMemo), s: math.bignumber(secondMemo), t: math.bignumber(thirdMemo), fo: math.bignumber(fourthMemo) }));
	}

	const result = members.reduce((memo, item) => math.eval('x + y', { x: math.bignumber(item), y: math.bignumber(memo) }), 0);

	worker.send({
		from: message.from,
		to: message.to,
		result: result.toString()
	});
});