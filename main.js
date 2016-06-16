var cluster = require('cluster');
var math = require('mathjs').create({ number: 'BigNumber', precision: 1000 });
var fs = require('fs');
var defaultTasks = require('os').cpus().length;

const START_TIME = +new Date();
const getCommandLineParameter = (param, defaultValue) => {
	if (process.argv.indexOf(param) != -1) {
		return process.argv[process.argv.indexOf(param) + 1];
	} else {
		return defaultValue;
	}
}
const precision = getCommandLineParameter('-p', 1000);
const tasks = getCommandLineParameter('-t', defaultTasks);
const quiet = getCommandLineParameter('-q', false);
const resultFile = getCommandLineParameter('-f', 'result.txt');
const NUMBER_OF_WORKERS = Math.min(tasks, precision);
const PAYLOAD_PER_WORKER = Math.floor(precision / NUMBER_OF_WORKERS);
var current = 0;
var currentWorkers = 0;
var result = 0;

cluster.setupMaster({ exec: './worker.js' });

const logger = (msg, force) => {
	if (!quiet || force) {
		console.log(msg);
	}
}

const startWorkers = () => {
	for (var i = 0; i < NUMBER_OF_WORKERS; i ++) {
		startWorker();
	};
};

const startWorker = () => {
	var worker = cluster.fork();

	currentWorkers += 1;
	logger(`Worker ${worker.id} started!`);
	worker.on('message', onMessageFromWorker(worker));
	calculate(worker);
};

const calculate = worker => {
	if (current <= precision) {
		var to = current + PAYLOAD_PER_WORKER <= precision ? current + PAYLOAD_PER_WORKER : precision;
		logger(`Start calculating members from ${current} to ${to}!`);
		worker.send({ from: current, to: to });
		current += PAYLOAD_PER_WORKER + 1;
	} else {
		logger(`Worker ${worker.id} disconnected!`);
		worker.disconnect();
	}
};

const onMessageFromWorker = worker => message => {
	result = math.eval('x + y', { x: math.bignumber(message.result), y: math.bignumber(result) });
	logger(`Finished calculating members from ${message.from} to ${message.to}`);
	calculate(worker);
};

const onWorkerDisconnect = msg => {
	currentWorkers -= 1;
	if (!currentWorkers) {
		onFinish();
	}
};

const onFinish = () => {
	result = math.eval('x / y', { x: 4 * 882, y: math.bignumber(result) });
	logger(`Finished calculating of Pi with ${precision} members and ${tasks} workers for ${+new Date - START_TIME} ms`, true);
	logger(`The result is ${result.toString()}`, true);
	fs.writeFileSync(resultFile, result.toString());
};

cluster.on('disconnect', onWorkerDisconnect);

try {
	startWorkers();
} catch(err) {
	console.log(err);
};
