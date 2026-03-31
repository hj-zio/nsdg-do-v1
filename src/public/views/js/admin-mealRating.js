'use strict';

// 페이지 로드 시 오늘 날짜로 초기화
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("selectedDate").value = today
  loadMealRatingData()
})

// 차트 인스턴스들을 저장할 변수
const charts = {
  breakfast: null,
  lunch: null,
  dinner: null,
}

// 급식 평가 데이터 로드
async function loadMealRatingData() {
  const selectedDate = document.getElementById("selectedDate").value

  if (!selectedDate) {
    alert("날짜를 선택해주세요.")
    return
  }

  showLoading(true)
  hideCharts()
  hideNoData()

  try {
    const response = await fetch(`/admin/getMealRating?date=${selectedDate}`)
    const result = await response.json()

    showLoading(false)

    if (result.success) {

      const { chartData, summaryData } = result.data
      

      // 데이터가 있는지 확인
      const hasData = summaryData && Object.values(summaryData).some((summary) => summary && summary.totalCount > 0)

      if (hasData) {
        displayCharts(chartData, summaryData)
      } else {
        showNoData()
      }
    } else {
      alert("데이터 조회 중 오류가 발생했습니다: " + result.message)
    }
  } catch (error) {
    showLoading(false)
    alert("데이터 조회 중 오류가 발생했습니다.")
  }
}

// 차트 표시
function displayCharts(chartData, summaryData) {
  showCharts()

  // 기존 차트 제거
  Object.values(charts).forEach((chart) => {
    if (chart) {
      chart.destroy()
    }
  })

  // 조식 차트
  if (summaryData.breakfast.totalCount > 0) {
    charts.breakfast = createPieChart("breakfastChart", chartData.breakfast, "조식")
    document.getElementById("breakfastChart").style.display = "block"
    document.getElementById("breakfastNoData").style.display = "none"
  } else {
    document.getElementById("breakfastChart").style.display = "none"
    document.getElementById("breakfastNoData").style.display = "flex"
  }
  updateSummary("breakfastSummary", summaryData.breakfast)

  // 중식 차트
  if (summaryData.lunch.totalCount > 0) {
    charts.lunch = createPieChart("lunchChart", chartData.lunch, "중식")
    document.getElementById("lunchChart").style.display = "block"
    document.getElementById("lunchNoData").style.display = "none"
  } else {
    document.getElementById("lunchChart").style.display = "none"
    document.getElementById("lunchNoData").style.display = "flex"
  }
  updateSummary("lunchSummary", summaryData.lunch)

  // 석식 차트
  if (summaryData.dinner.totalCount > 0) {
    charts.dinner = createPieChart("dinnerChart", chartData.dinner, "석식")
    document.getElementById("dinnerChart").style.display = "block"
    document.getElementById("dinnerNoData").style.display = "none"
  } else {
    document.getElementById("dinnerChart").style.display = "none"
    document.getElementById("dinnerNoData").style.display = "flex"
  }
  updateSummary("dinnerSummary", summaryData.dinner)
}

// 원형 차트 생성
function createPieChart(canvasId, data, mealType) {
  const ctx = document.getElementById(canvasId).getContext("2d")

  // 데이터가 있는 평점만 필터링
  const filteredData = Object.entries(data).filter(([rating, count]) => count > 0)

  if (filteredData.length === 0) {
    return null
  }

  const labels = filteredData.map(([rating]) => `${rating}점`)
  const values = filteredData.map(([, count]) => count)

  // 평점별 색상 설정
  const colors = {
    1: "#dc3545", // 빨강 (매우 나쁨)
    2: "#fd7e14", // 주황 (나쁨)
    3: "#ffc107", // 노랑 (보통)
    4: "#28a745", // 초록 (좋음)
    5: "#007bff", // 파랑 (매우 좋음)
  }

  const backgroundColors = filteredData.map(([rating]) => colors[rating])

  return new window.Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.parsed / total) * 100).toFixed(1)
              return `${context.label}: ${context.parsed}명 (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

// 요약 정보 업데이트
function updateSummary(elementId, summaryData) {
  const element = document.getElementById(elementId)
  if (summaryData && summaryData.totalCount > 0) {
    element.innerHTML = `
            총 평가 수: <strong>${summaryData.totalCount}명</strong><br>
            평균 평점: <strong>${summaryData.averageRating}점</strong>
        `
  } else {
    element.innerHTML = "수집된 데이터가 없습니다."
  }
}

// UI 상태 관리 함수들
function showLoading(show) {
  document.getElementById("loadingMessage").style.display = show ? "block" : "none"
}

function showCharts() {
  document.getElementById("chartsContainer").style.display = "grid"
}

function hideCharts() {
  document.getElementById("chartsContainer").style.display = "none"
}

function showNoData() {
  document.getElementById("noDataMessage").style.display = "block"
}

function hideNoData() {
  document.getElementById("noDataMessage").style.display = "none"
}
