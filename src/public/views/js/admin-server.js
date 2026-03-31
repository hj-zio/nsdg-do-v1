'use strict';

let cpuChart, memoryChart, diskChart, networkChart, responseChart;

document.addEventListener("DOMContentLoaded", async function () {
    await setData();
});

if (window.location.href.includes('/admin/server')) {
    setInterval(setData, 5000);
}

async function setData() {
    const timeValue = document.getElementById('time-selection').value;
    const serverStatus = await fetchJSON(`/admin/getServerStatus?t=${timeValue}`);
    if (!serverStatus.success) {
        alert(serverStatus.message);
        return;
    }
    const [data, data2, data3] = serverStatus.data;
    updateRequestStats(data2);
    const preServiceStatus = getPreServiceStatus(data2);
    const serviceStatus = sortServiceStatus(preServiceStatus);
    const topServiceStatus = [...preServiceStatus].sort((a, b) => a.avgResponse - b.avgResponse);
    renderServiceStatusList(serviceStatus, 'serviceStatus');
    renderServiceStatusList(topServiceStatus, 'topServiceStatus');
    const labels = data.map(item => formatTimestamp(item.timestamp));
    const conversionFactor = 10 / (1024 * 1024);
    const cpuUsageData = data.map(item => item.cpu_usage);
    const memoryUsageData = data.map(item => item.memory_usage);
    const diskUsageData = data.map(item => item.disk_usage);
    const networkInRateData = data.map(item => item.network_in_rate * conversionFactor);
    const networkOutRateData = data.map(item => item.network_out_rate * conversionFactor);
    const totalNetworkInData = data.map(item => item.network_in * conversionFactor);
    const totalNetworkOutData = data.map(item => item.network_out * conversionFactor);
    cpuChart = updateOrCreateLineChart(cpuChart, 'cpuChart', 'CPU 사용량', labels, cpuUsageData, "rgb(59, 130, 246)", "rgba(59, 130, 246, 0.1)");
    memoryChart = updateOrCreateLineChart(memoryChart, 'memoryChart', '메모리 사용량', labels, memoryUsageData, "rgb(59, 130, 246)", "rgba(59, 130, 246, 0.1)");
    diskChart = updateOrCreateLineChart(diskChart, 'diskChart', '디스크 사용량', labels, diskUsageData, "rgb(59, 130, 246)", "rgba(59, 130, 246, 0.1)");
    networkChart = updateOrCreateNetworkChart(networkChart, 'networkChart', labels, networkInRateData, networkOutRateData, totalNetworkInData, totalNetworkOutData);
}

function updateRequestStats(data2) {
    const totalRequest = data2.length;
    const successRequest = data2.filter(item => item.status === 'SUCCESS').length;
    const failRequest = data2.filter(item => item.status === 'FAIL').length;
    const avgExecution = totalRequest ? Math.round(data2.reduce((acc, curr) => acc + curr.execution_at, 0) / totalRequest) : 0;
    document.getElementById('totalRequest').innerHTML = totalRequest;
    document.getElementById('successRequest').innerHTML = successRequest;
    document.getElementById('failRequest').innerHTML = failRequest;
    document.getElementById('avgExecution').innerHTML = avgExecution;
}

function getPreServiceStatus(data2) {
    return Object.entries(
        data2.reduce((acc, { endpoint, execution_at, status }) => {
            if (!acc[endpoint]) acc[endpoint] = { total: 0, success: 0, responseSum: 0 };
            acc[endpoint].total++;
            acc[endpoint].responseSum += execution_at;
            if (status === 'SUCCESS') acc[endpoint].success++;
            return acc;
        }, {})
    ).map(([endpoint, { success, total, responseSum }]) => {
        const rate = (success / total) * 100;
        const avgResponse = responseSum / total;
        let serviceStatus;
        if (rate >= 90 && avgResponse <= 500) {
            serviceStatus = '정상';
        } else if (rate >= 50 && (avgResponse < 3000 || avgResponse >= 500)) {
            serviceStatus = '혼잡';
        } else {
            serviceStatus = '위험';
        }
        return { endpoint, rate, avgResponse, status: serviceStatus };
    });
}

function sortServiceStatus(statusArray) {
    return statusArray.sort((a, b) => {
        const groupA = a.endpoint.split('/')[1] || '';
        const groupB = b.endpoint.split('/')[1] || '';
        if (groupA === groupB) {
            return a.endpoint.length - b.endpoint.length;
        }
        return groupA.localeCompare(groupB);
    });
}

function renderServiceStatusList(statusList, elementId) {
    const container = document.getElementById(elementId);
    let htmlOutput = '';
    statusList.forEach(({ endpoint, status, avgResponse }) => {
        const statusClass =
            status === '정상' ? 'text-green-600 bg-green-50' :
            status === '혼잡' ? 'text-yellow-600 bg-yellow-50' :
            'text-red-600 bg-red-50';
        htmlOutput += `
        <div class="flex border-t border-gray-300">
            <div class="basis-2/4 px-4 py-2 bg-gray-0 text-[14px] text-gray-700 pretendard-500 text-left box-border truncate">${endpoint}</div>
            <div class="basis-1/4 px-4 py-2 bg-gray-0 text-[14px] text-gray-700 pretendard-500 text-center box-border truncate">
                <span class="px-2 py-1 rounded-full ${statusClass}">${status}</span>
            </div>
            <div class="basis-1/4 px-4 py-2 bg-gray-0 text-[14px] text-gray-700 pretendard-500 text-center box-border truncate">
                ${avgResponse.toFixed(0)}ms
            </div>
        </div>`;
    });
    container.innerHTML = htmlOutput;
}

function formatTimestamp(timestamp) {
    const time = new Date(timestamp);
    const hours = (time.getUTCHours() + 9) % 24;
    const minutes = time.getUTCMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function updateOrCreateLineChart(chartInstance, canvasId, labelText, labels, dataArray, borderColor, backgroundColor, yAxisID) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const commonOptions = {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                align: "center",
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: { size: 13 }
                }
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#111827",
                bodyColor: "#374151",
                bodyFont: { size: 13 },
                borderColor: "#E5E7EB",
                borderWidth: 1,
                padding: 12,
                displayColors: true,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
                ticks: {
                    font: { size: 12 },
                    padding: 8,
                    callback: function(e) { return `${e}%`; }
                }
            }
        },
        interaction: { intersect: false, mode: "index" }
    };
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = dataArray;
        chartInstance.update();
        return chartInstance;
    } else {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: labelText,
                    data: dataArray,
                    borderColor: borderColor,
                    borderWidth: 2.5,
                    backgroundColor: backgroundColor,
                    fill: false,
                    tension: 0.5,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    pointBackgroundColor: "rgb(59, 130, 246)",
                    pointBorderColor: "white",
                    ...(yAxisID ? { yAxisID } : {})
                }]
            },
            options: commonOptions
        });
    }
}

function updateOrCreateNetworkChart(chartInstance, canvasId, labels, networkInRateData, networkOutRateData, totalNetworkInData, totalNetworkOutData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const networkOptions = {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                align: "center",
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: { size: 13 }
                }
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                titleColor: "#111827",
                bodyColor: "#374151",
                bodyFont: { size: 13 },
                borderColor: "#E5E7EB",
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(e) {
                        const label = e.dataset.label;
                        const value = e.raw;
                        if (label.includes('속도')) {
                            return `${label}: ${value.toLocaleString()} MB/s`;
                        } else {
                            return `${label}: ${value.toLocaleString()} MB`;
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
                ticks: { font: { size: 12 }, padding: 8 }
            },
            y2: {
                position: 'right',
                beginAtZero: true,
                grid: { display: false },
                ticks: { font: { size: 12 }, padding: 8 }
            }
        },
        interaction: { intersect: false, mode: "index" }
    };
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = networkInRateData;
        chartInstance.data.datasets[1].data = networkOutRateData;
        chartInstance.data.datasets[2].data = totalNetworkInData;
        chartInstance.data.datasets[3].data = totalNetworkOutData;
        chartInstance.update();
        return chartInstance;
    } else {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { 
                        label: '수신 속도 (MB/s)',
                        data: networkInRateData,
                        borderColor: "rgb(59, 130, 246)",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderWidth: 2.5,
                        fill: false,
                        tension: 0.5,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointBackgroundColor: "rgb(59, 130, 246)",
                        pointBorderColor: "white",
                    },
                    { 
                        label: '송신 속도 (MB/s)',
                        data: networkOutRateData,
                        borderColor: "rgb(34, 197, 94)",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                        borderWidth: 2.5,
                        fill: false,
                        tension: 0.5,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointBackgroundColor: "rgb(34, 197, 94)",
                        pointBorderColor: "white"
                    },
                    { 
                        label: '전체 수신량 (MB)',
                        data: totalNetworkInData,
                        borderColor: "rgb(255, 214, 90)",
                        backgroundColor: "rgba(255, 214, 90, 0.1)",
                        borderWidth: 2.5,
                        fill: false,
                        tension: 0.5,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointBackgroundColor: "rgb(255, 214, 90)",
                        pointBorderColor: "white",
                        yAxisID: 'y2'
                    },
                    { 
                        label: '전체 송신량 (MB)',
                        data: totalNetworkOutData,
                        borderColor: "rgb(255, 106, 51)",
                        backgroundColor: "rgba(255, 106, 51, 0.1)",
                        borderWidth: 2.5,
                        fill: false,
                        tension: 0.5,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        pointBackgroundColor: "rgb(255, 106, 51)",
                        pointBorderColor: "white",
                        yAxisID: 'y2'
                    }
                ]
            },
            options: networkOptions
        });
    }
}

async function fetchJSON(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}