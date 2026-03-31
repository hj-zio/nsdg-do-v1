'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const si = require('systeminformation');

let lastNetworkIn = 0;
let lastNetworkOut = 0;

async function collectSystemMetrics() {
    try {
        const cpuData = await si.cpu();
        const memoryData = await si.mem();
        const diskData = await si.fsSize();
        const networkData = await si.networkStats();
        const cpuUsage = await si.currentLoad();

        const cpuUsagePercent = cpuUsage.currentLoad;
        const memoryUsagePercent = (memoryData.used / memoryData.total) * 100;
        const diskUsagePercent = (diskData[0].used / diskData[0].size) * 100;

        const networkIn = networkData[0]?.rx_bytes || 0;
        const networkOut = networkData[0]?.tx_bytes || 0;

        const networkInRate = networkIn - lastNetworkIn;
        const networkOutRate = networkOut - lastNetworkOut;

        lastNetworkIn = networkIn;
        lastNetworkOut = networkOut;

        const metrics = [
            cpuUsagePercent, cpuData.cores, memoryUsagePercent, memoryData.total, memoryData.used,
            diskUsagePercent, diskData[0].size, diskData[0].used, networkIn, networkOut,
            networkInRate, networkOutRate
        ];

        const command = `
            INSERT INTO system_metrics (
              cpu_usage, cpu_cores, memory_usage, memory_total, memory_used, 
              disk_usage, disk_total, disk_used, network_in, network_out, 
              network_in_rate, network_out_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const query = await db.querySQLForMetrics(command, metrics);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    collectSystemMetrics
};