'use strict';

let cpuChart, memoryChart, diskChart, networkChart, responseChart;

document.addEventListener("DOMContentLoaded", async function () {
    await setData();
    await getDatabaseList();
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

    // 데이터셋 준비
    const cpuUsageData = data.map(item => item.cpu_usage);
    const memoryUsageData = data.map(item => item.memory_usage);
    const diskUsageData = data.map(item => item.disk_usage);
    const networkInRateData = data.map(item => (item.network_in_rate * 10) / (1024 * 1024));
    const networkOutRateData = data.map(item => (item.network_out_rate * 10) / (1024 * 1024));
    const totalNetworkInData = data.map(item => (item.network_in * 10) / (1024 * 1024));
    const totalNetworkOutData = data.map(item => (item.network_out * 10) / (1024 * 1024));

    // 차트 업데이트 또는 생성
    cpuChart = updateOrCreateLineChart(cpuChart, 'cpuChart', 'CPU 사용량', labels, cpuUsageData, "rgb(59, 130, 246)", "rgba(59, 130, 246, 0.1)");
    memoryChart = updateOrCreateLineChart(memoryChart, 'memoryChart', '메모리 사용량', labels, memoryUsageData, "rgb(59, 130, 246)", "rgba(59, 130, 246, 0.1)");
    diskChart = updateOrCreateLineChart(diskChart, 'diskChart', '디스크 사용량', labels, diskUsageData, "rgb(59, 130, 246)", "rgb(59, 130, 246, 0.1)");
    networkChart = updateOrCreateNetworkChart(networkChart, 'networkChart', labels, networkInRateData, networkOutRateData, totalNetworkInData, totalNetworkOutData);
}

function updateRequestStats(data2) {
    const totalRequest = data2.length;
    const successRequest = data2.filter(item => item.status === 'SUCCESS').length;
    const failRequest = data2.filter(item => item.status === 'FAIL').length;
    const avgExecution = Math.round(data2.reduce((acc, curr) => acc + curr.execution_at, 0) / data2.length);

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
    container.innerHTML = '';
    statusList.forEach(({ endpoint, status, avgResponse }) => {
        const statusClass =
            status === '정상' ? 'text-green-600 bg-green-50' :
            status === '혼잡' ? 'text-yellow-600 bg-yellow-50' :
            'text-red-600 bg-red-50';
        const html = `
          <div class="flex justify-between items-center">
            <div class="w-[50%] text-[12px] lg:text-[14px] mx-1 text-left text-[--gray-70] pretendard-500 bg-[--gray-0] p-2 truncate">
              ${endpoint}
            </div>
            <div class="w-[25%] text-[12px] md:text-[14px] text-center text-[--gray-70] pretendard-500 bg-[--gray-0] p-2 box-border truncate">
              <span class="px-2 py-1 rounded-full ${statusClass}">${status}</span>
            </div>
            <div class="w-[25%] text-[12px] lg:text-[14px] text-center text-[--gray-70] pretendard-500 bg-[--gray-0] p-2 box-border truncate">
              ${avgResponse.toFixed(0)}ms
            </div>
          </div>
        `;
        container.innerHTML += html;
    });
}

function formatTimestamp(timestamp) {
    const time = new Date(timestamp);
    const hours = (time.getUTCHours()) % 24;
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

async function searchDB() {
    const database = document.getElementById('db-select').value;
    const table = document.getElementById('table-select').value;
    const where1_column = document.getElementById('where1-column').value;
    const where1_operand = document.getElementById('where1-operand').value;
    const where1_value = document.getElementById('where1-value').value;
    const where2_column = document.getElementById('where2-column').value;
    const where2_operand = document.getElementById('where2-operand').value;
    const where2_value = document.getElementById('where2-value').value;
    const manualQuery = document.getElementById('query-input').value;
    const limit = document.getElementById('limit-input').value;

    // 수동 쿼리 우선 처리
    if (manualQuery !== '') {
        const query = await fetchJSON(`/admin/querySQL?c=${manualQuery};&p=[]`);
        if (!query.success) {
            alert(query.message);
            return;
        }
        const result = createTable(query.data);
        if (!result) {
            document.getElementById('content-table').innerHTML = `
            <div class="px-3 py-2 text-[18px] text-[--gray-70] pretendard-600 bg-[--gray-10]">처리결과</div>
            <div class="px-3 py-2 text-[16px] text-[--gray-70] pretendard-500">${JSON.stringify(query.data)}</div>
            `;
        }
        return;
    }

    if (database === '' || table === '') {
        alert('DB와 테이블은 필수항목입니다.');
        return;
    }

    let autoQuery = `SELECT * FROM ${table}`;
    let whereQuery = '';

    if ((where1_column && where1_operand && where1_value) && !(where2_column && where2_operand && where2_value)) {
        whereQuery = ` WHERE ${where1_column}${where1_operand}${where1_value}`;
    } else if (!(where1_column && where1_operand && where1_value) && (where2_column && where2_operand && where2_value)) {
        whereQuery = ` WHERE ${where2_column}${where2_operand}${where2_value}`;
    } else if (where1_column && where1_operand && where1_value && where2_column && where2_operand && where2_value) {
        whereQuery = ` WHERE ${where1_column}${where1_operand}${where1_value} AND ${where2_column}${where2_operand}${where2_value}`;
    }

    const limitQuery = limit ? ` LIMIT ${limit}` : '';
    const query = await fetchJSON(`/admin/querySQL?c=${autoQuery}${whereQuery}${limitQuery};&p=[]`);
    if (!query.success) {
        alert(query.message);
        return;
    }
    createTable(query.data);
}

async function getDatabaseList() {
    // 현재 주석 처리된 데이터베이스 조회 부분 (필요시 주석 해제)
    // const initQuery = await fetchJSON(`/admin/querySQL?c=SHOW DATABASES;&p=[]`);
    // if (!initQuery.success) {
    //     alert(initQuery.message);
    //     return;
    // }
    // const databases = initQuery.data.map(item => item.Database);
    // const databaseElement = document.getElementById('db-select');
    // if (!databases.every(db => databaseElement.outerHTML.includes(`value="${db}"`))) {
    //     databaseElement.innerHTML = databases.map(db => `<option value="${db}">${db}</option>`).join('');
    // }
    return;
}

async function getTableList() {
    const databaseElement = document.getElementById('db-select');
    if (!databaseElement.value) {
        alert('DB를 먼저 선택해주세요.');
        return;
    }
    const tableList = await fetchJSON(`/admin/querySQL?c=SHOW TABLES FROM ${databaseElement.value};&p=[]`);
    if (!tableList.success) {
        alert(tableList.message);
        return;
    }
    const tables = tableList.data.map(item => item.Tables_in_DB);
    const tableElement = document.getElementById('table-select');
    if (!tables.every(tbl => tableElement.outerHTML.includes(`value="${tbl}"`))) {
        tableElement.innerHTML = tables.map(tbl => `<option value="${tbl}">${tbl}</option>`).join('');
    }
}

async function getColumnList() {
    const databaseElement = document.getElementById('db-select');
    const tableElement = document.getElementById('table-select');
    if (!databaseElement.value || !tableElement.value) {
        alert('DB와 테이블을 먼저 선택해주세요.');
        return;
    }
    const columnList = await fetchJSON(`/admin/querySQL?c=SHOW COLUMNS FROM ${tableElement.value};&p=[]`);
    if (!columnList.success) {
        alert(columnList.message);
        return;
    }
    const columns = columnList.data.map(item => item.Field);
    const columnElement = document.getElementById('where1-column');
    const column2Element = document.getElementById('where2-column');
    if (!columns.every(col => columnElement.outerHTML.includes(`value="${col}"`))) {
        columnElement.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
    }
    if (!columns.every(col => column2Element.outerHTML.includes(`value="${col}"`))) {
        column2Element.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
    }
}

function createTable(data) {
    try {
        if (data.length === 0) {
            document.getElementById('content-table').innerHTML = `
            <div class="px-3 py-2 text-[18px] text-[--gray-70] pretendard-600 bg-[--gray-10]">처리결과</div>
            <div class="px-3 py-2 text-[16px] text-[--gray-70] pretendard-500">해당하는 데이터가 없습니다.</div>
            `;
            return;
        }

        let tableHTML = '<table class="w-full table-auto"><thead><tr>';
        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            tableHTML += `<th class="px-2 py-3 text-[14px] text-[--gray-70] pretendard-600 bg-[--gray-10]">${key}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        data.forEach(row => {
            tableHTML += '<tr>';
            keys.forEach(key => {
                tableHTML += `
                    <td class="p-2 max-w-[150px] truncate text-[14px] text-[--gray-70] pretendard-500 bg-[--gray-0] whitespace-nowrap group relative">
                        ${row[key]}
                        <span class="fixed p-2 hidden max-w-[500px] h-auto text-[14px] text-[--gray-10] pretendard-500 bg-[--gray-70] opacity-80 p-1 group-hover:block top-3 right-3 z-10 rounded-md whitespace-normal word-wrap break-word">
                            ${row[key]}
                        </span>
                    </td>
                `;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        document.getElementById('content-table').innerHTML = tableHTML;
        return true;
    } catch (e) {
        return false;
    }
}

async function createInsSchedule() {
    const endpoint = document.getElementById("endpoint").value;
    const type = document.getElementById("type").value;
    const status = document.getElementById("status").value;
    const startYear = document.getElementById("startYear").value;
    const startMonth = document.getElementById("startMonth").value;
    const startDay = document.getElementById("startDay").value;
    const startHour = document.getElementById("startHour").value;
    const startMinute = document.getElementById("startMinute").value;
    const endYear = document.getElementById("endYear").value;
    const endMonth = document.getElementById("endMonth").value;
    const endDay = document.getElementById("endDay").value;
    const endHour = document.getElementById("endHour").value;
    const endMinute = document.getElementById("endMinute").value;
    const durationHour = document.getElementById("durationHour").value;
    const durationMinute = document.getElementById("durationMinute").value;

    if (!endpoint || !type || !status || !startYear || !startMonth || !startDay || !startHour || !startMinute || !endYear || !endMonth || !endDay || !endHour || !endMinute || !durationHour || !durationMinute) {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    const createInsSchedule = await fetch(`/admin/createInsSchedule?endpoint=${endpoint}&type=${type}&status=${status}&startDate=${startYear}-${startMonth}-${startDay} ${startHour}:${startMinute}&endDate=${endYear}-${endMonth}-${endDay} ${endHour}:${endMinute}&duration=${durationHour}시간 ${durationMinute}분`, {
        method: 'GET'
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error));

    if (!createInsSchedule.success) {
        alert(createInsSchedule.message);
        return;
    }

    console.log(createInsSchedule);
}

async function uploadMeal() {
    let input = document.getElementById('admin_file_input');
    let file = input.files[0];

    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (!file) {
        alert('파일을 선택해주세요.');
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        let base64String = reader.result.split(",")[1]; // Base64 데이터 추출

        let response = await fetch(`/admin/uploadMeal?startDate=${startDate}&endDate=${endDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file: base64String })
        });

        let result = await response.json();
        if (response.ok) {
            alert('파일 업로드 성공: ' + JSON.stringify(result.data));
        } else {
            alert('업로드 실패: ' + result.error);
        }
    };
    reader.onerror = function (error) {
        console.error("파일 읽기 오류:", error);
        alert("파일을 읽는 중 오류가 발생했습니다.");
    };
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