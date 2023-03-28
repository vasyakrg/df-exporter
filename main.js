const http = require('http')
const url = require('url')
const client = require('prom-client')
const express = require('express');
const disk = require('diskusage')


const app = express();

const port = process.env.PORT || '8080'
const path = process.env.MYPATH || '/'

const register = new client.Registry();

const diskFreeMetric = new client.Gauge({
	name: 'df_exporter_disk_free_size',
	help: 'Free disk size from path: ' + path,
});

const diskTotalMetric = new client.Gauge({
	name: 'df_exporter_disk_total_size',
	help: 'Total disk size from path: ' + path,
});

const diskUsedMetric = new client.Gauge({
	name: 'df_exporter_disk_used_size',
	help: 'Used disk size from path: ' + path,
});

const diskUsedPercent = new client.Gauge({
	name: 'df_exporter_disk_used_pencent',
	help: 'Used disk size with pencent from path: ' + path,
});

const diskFreePercent = new client.Gauge({
	name: 'df_exporter_disk_free_pencent',
	help: 'Free disk size with pencent from path: ' + path,
});

app.get('/metrics', async (req, res) => {
	const diskData = disk.checkSync(path)

	diskFreeMetric.set(diskData.free / 1024)
	diskTotalMetric.set(diskData.total / 1024)
	diskUsedMetric.set((diskData.total - diskData.free) / 1024)

	diskUsedPercent.set(100 - (diskData.free / diskData.total * 100))
	diskFreePercent.set(diskData.free / diskData.total * 100)

	register.registerMetric(diskUsedMetric)
	register.registerMetric(diskFreeMetric)
	register.registerMetric(diskTotalMetric)

	register.registerMetric(diskUsedPercent)
	register.registerMetric(diskFreePercent)

	res.setHeader('Content-Type', register.contentType);
	res.send(await register.metrics());
});

var shutDown = function () {
	console.log("exiting ...");
	process.exit();
}

try {
	app.listen(port, () => console.log('Server is running on http://localhost:' + port + ', metrics are exposed on http://localhost:' + port + '/metrics'))
	process.on('SIGINT' || 'SIGTERM', function () { console.log("SIGINT"); shutDown() })
} catch (e) {
		console.log(e)
}
