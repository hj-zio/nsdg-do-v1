document.addEventListener("DOMContentLoaded", async () => {
  await loadUserData()
})

async function loadUserData() {
  try {
    const userDataResponse = await getUserData()
    const gradeName = Number(JSON.parse(userDataResponse.data.schoolDetail).grade)
    const className = Number(JSON.parse(userDataResponse.data.schoolDetail).class)
    const numberName = Number(JSON.parse(userDataResponse.data.schoolDetail).number)
    if (
      userDataResponse.data.isTeacher === 0 &&
      userDataResponse.data.isMaster === 0 &&
      userDataResponse.data.g_id !== "123456789"
    ) {
      if (!gradeName) {
        createToast("error", "학적정보를 입력 후 접속할 수 있어요.")
        setTimeout(() => {
          location.href = "/myinfo"
        }, 3000)
        return
      }
      if (gradeName !== 1) {
        createToast("error", "2, 3학년은 이용할 수 없는 서비스에요.")
        setTimeout(() => {
          location.href = "/"
        }, 3000)
        return
      }
    }
    createToast(
      "success",
      `${gradeName}학년 ${className}반 ${userDataResponse.data.name}님 반갑습니다!\n제출 전 본인의 학적정보를 꼭 확인해주세요.`,
    )
    return
  } catch (error) {
    createToast("error", "사용자 정보를 불러오는 중 오류가 발생했습니다.")
  }
}

function dom(id) {
  return document.getElementById(id)
}

const subjectCredits = {
  // 3학점 과목들
  E1: 3, // 주제 탐구 독서
  E2: 3, // 인공지능 수학
  E3: 3, // 영어 발표와 토론
  F1: 3, // 매체 의사소통
  F2: 3, // 독서 토론과 글쓰기
  F3: 3, // 기하
  F4: 3, // 수학과 문화
  F5: 3, // 심화 영어
  G1: 3, // 미적분Ⅱ
  G2: 3, // 심화 영어 독해와 작문

  // 4학점 과목들
  H1: 4, // 문학과 영상
  H2: 4, // 언어생활 탐구
  H3: 4, // 수학과제 탐구
  H4: 4, // 세계 문화와 영어
  H5: 4, // 미디어 영어
}

function calculateKoreanEnglishMathCredits() {
  let totalCredits = 0

  for (let i = 0; i < semesterArray.length; i++) {
    const semesterSubjects = selectData[semesterArray[i]] || []
    for (let j = 0; j < semesterSubjects.length; j++) {
      const subjectID = semesterSubjects[j]
      if (
        (group["국어"] && group["국어"].includes(subjectID)) ||
        (group["수학"] && group["수학"].includes(subjectID)) ||
        (group["영어"] && group["영어"].includes(subjectID))
      ) {
        // 학점이 정의된 과목은 해당 학점을, 그렇지 않으면 기본 학점 사용
        const credits = subjectCredits[subjectID] || 3 
        totalCredits += credits
      }
    }
  }

  return totalCredits
}

function selectSubject(event) {
  try {
    if (!event || !event.target) {
      createToast("error", "잘못된 이벤트입니다.")
      return
    }

    const originID = event.target.id
    if (!originID) {
      createToast("error", "버튼 ID를 찾을 수 없습니다.")
      return
    }

    if (typeof subject === "undefined" || typeof group === "undefined") {
      createToast("error", "시스템 초기화가 완료되지 않았습니다. 페이지를 새로고침해주세요.")
      return
    }

    let data
    try {
      data = seperateCode(originID)
    } catch (parseError) {
      createToast("error", "버튼 ID 형식이 올바르지 않습니다.")
      return
    }

    if (!data || !Array.isArray(data) || data.length < 2) {
      createToast("error", "잘못된 버튼 ID 형식입니다.")
      return
    }

    const semesterID = data[0]
    const subjectID = data[1]

    if (!selectData || typeof selectData !== "object") {
      createToast("error", "데이터 초기화 오류입니다. 페이지를 새로고침해주세요.")
      return
    }

    if (!selectData[semesterID]) {
      selectData[semesterID] = []
    }

    let check
    try {
      check = findId_selectData(subjectID, semesterID)
    } catch (checkError) {
      createToast("error", "과목 선택 상태를 확인할 수 없습니다.")
      return
    }

    if (check === 0) {
      try {
        if (
          group["국어"] &&
          group["수학"] &&
          group["영어"] &&
          (group["국어"].includes(subjectID) || group["수학"].includes(subjectID) || group["영어"].includes(subjectID))
        ) {
          const currentSubjectCredits = subjectCredits[subjectID] || 3
          const currentTotalCredits = calculateKoreanEnglishMathCredits()

          if (currentTotalCredits + currentSubjectCredits > 21) {
            createToast("error", "전체 학기중 국영수 과목은 총 21학점까지 선택할 수 있어요.")
            return
          }
        }

        if (semesterID === "TT") {
          // 3학년 2학기 국영수 과목들 (문학과 영상, 언어생활 탐구, 수학과제 탐구, 세계 문화와 영어, 미디어 영어)
          const TTSubjects = ["H1", "H2", "H3", "H4", "H5"]

          if (TTSubjects.includes(subjectID)) {
            // 현재 3학년 2학기에서 선택된 국영수 과목 개수 확인
            const currentTTSubjects = selectData["TT"] || []
            const currentTTCount = currentTTSubjects.filter((id) =>
              TTSubjects.includes(id),
            ).length

            if (currentTTCount >= 3) {
              createToast("error", "3학년 2학기에는 국영수 과목을 최대 3과목 까지만 선택할 수 있어요.")
              return
            }
          }
        }

        if (originID.includes("TG_C") && String(selectData["TG"] || "").includes("C")) {
          createToast("error", `${findSemesterName(semesterID)}에는 제2외국어 과목군 중 1과목만 선택할 수 있어요.`)
          return
        }

        const semesterIndex = semesterArray.indexOf(semesterID)
        if (semesterIndex !== -1) {
          let maxSubjects
          switch (semesterID) {
            case "SO":
              maxSubjects = 5
              break
            case "ST":
              maxSubjects = 5
              break
            case "TO":
              maxSubjects = 4
              break
            case "TT":
              maxSubjects = 6
              break
            default:
              maxSubjects = availableSubjectNum[semesterIndex]
              break
          }
          const currentSubjectCount = selectData[semesterID].length
          if (currentSubjectCount >= maxSubjects) {
            createToast("error", `${findSemesterName(semesterID)}에는 최대 ${maxSubjects}개의 과목만 선택할 수 있어요.`)
            return
          }
        }

        if (group["교양"] && group["교양"].includes(subjectID)) {
          const currentLiberalArts = selectData[semesterID].filter((id) => group["교양"].includes(id))
          if (currentLiberalArts.length > 0) {
            createToast("error", `${findSemesterName(semesterID)}에는 교양과목을 하나만 선택할 수 있어요.`)
            return
          }
          selectData[semesterID].push(subjectID)
          const element = dom(originID)
          if (element) {
            element.classList.add("--bg-green")
          }
          updateViewing()
          return
        }

        if ((semesterID === "SO" || semesterID === "ST") && group["교양"] && !group["교양"].includes(subjectID)) {
          const hasLiberalArts = selectData[semesterID].some((id) => group["교양"].includes(id))
          const currentSubjectCount = selectData[semesterID].length
          if (!hasLiberalArts && currentSubjectCount === 4) {
            createToast("error", `${findSemesterName(semesterID)}에는 교양과목을 반드시 하나 선택해야 해요.`)
            return
          }
        }

        /************ 융합과학 선택 시 ***************/
        if (subjectID === "I3") {
          let subjectCheck = false
          const previousSemesters = getPreviousSemesters(semesterID)
          for (let i = 0; i < previousSemesters.length; i++) {
            const semesterSubjects = selectData[previousSemesters[i]] || []
            for (let x = 0; x < semesterSubjects.length; x++) {
              const data = semesterSubjects[x]
              if (group["과학2"] && group["과학2"].includes(data)) {
                subjectCheck = true
              }
            }
          }
          if (!subjectCheck) {
            createToast(
              "error",
              `${subject[subjectID]} 과목을 이수하려면,\n역학과 에너지, 물질과 에너지, 세포의 물질대사, 지구시스템 과학 중 하나를 이전학기에 먼저 이수 해야해요.`,
            )
            return
          }
        }

        /********* 선택과목 위계 조건 **********/
        const sciencePrerequisites = {
          F10: "E9",
          F11: "E10",
          F12: "E11",
          F13: "E12",
          G7: "E9",
          G8: "E10",
          G9: "E11",
          G10: "E12",
        }

        if (sciencePrerequisites[subjectID]) {
          let prerequisiteFound = false
          const prerequisiteSubject = sciencePrerequisites[subjectID]
          const previousSemesters = getPreviousSemesters(semesterID)
          for (let i = 0; i < previousSemesters.length; i++) {
            const semesterSubjects = selectData[previousSemesters[i]] || []
            if (semesterSubjects.includes(prerequisiteSubject)) {
              prerequisiteFound = true
              break
            }
          }
          if (!prerequisiteFound) {
            createToast(
              "error",
              `${subject[subjectID]} 과목을 이수하려면\n${subject[prerequisiteSubject]} 과목을 이전학기에 먼저 이수 해야해요.`,
            )
            return
          }
        }

        const computerPrerequisites = {
          I5: "E13",
          I5: "G13",
        }

        if (computerPrerequisites[subjectID]) {
          let prerequisiteFound = false
          const prerequisiteSubject = computerPrerequisites[subjectID]
          const previousSemesters = getPreviousSemesters(semesterID)
          for (let i = 0; i < previousSemesters.length; i++) {
            const semesterSubjects = selectData[previousSemesters[i]] || []
            if (semesterSubjects.includes(prerequisiteSubject)) {
              prerequisiteFound = true
              break
            }
          }
          if (!prerequisiteFound) {
            createToast(
              "error",
              `${subject[subjectID]} 과목을 이수하려면\n프로그래밍 또는 데이터 과학 과목을 이전학기에 먼저 이수 해야해요.`,
            )
            return
          }
        }

        if (findSelectNum() === totalSelectNum() - 1) {
          let soHasLiberalArts = (selectData["SO"] || []).some((id) => group["교양"] && group["교양"].includes(id))
          let stHasLiberalArts = (selectData["ST"] || []).some((id) => group["교양"] && group["교양"].includes(id))
          if (semesterID === "SO" && group["교양"] && group["교양"].includes(subjectID)) soHasLiberalArts = true
          if (semesterID === "ST" && group["교양"] && group["교양"].includes(subjectID)) stHasLiberalArts = true
          if (!soHasLiberalArts || !stHasLiberalArts) {
            createToast("error", "2학년 1학기와 2학기에는 각각 교양과목을 하나씩 반드시 선택해야 해요.")
            return
          }

          let hasTechOrLanguage = false
          const selectedTechSubjects = []
          const selectedLanguageSubjects = []
          for (let i = 0; i < semesterArray.length; i++) {
            if (["SO", "ST", "TO", "TT"].includes(semesterArray[i])) {
              const semesterSubjects = selectData[semesterArray[i]] || []
              for (let x = 0; x < semesterSubjects.length; x++) {
                const subjectID_check = semesterSubjects[x]
                if (group["기술가정"] && group["기술가정"].includes(subjectID_check)) {
                  hasTechOrLanguage = true
                  selectedTechSubjects.push(subjectID_check)
                }
                if (group["제2외국어"] && group["제2외국어"].includes(subjectID_check)) {
                  hasTechOrLanguage = true
                  selectedLanguageSubjects.push(subjectID_check)
                }
              }
            }
          }
          if (["SO", "ST", "TO", "TT"].includes(semesterID)) {
            if (group["기술가정"] && group["기술가정"].includes(subjectID)) {
              hasTechOrLanguage = true
              selectedTechSubjects.push(subjectID)
            }
            if (group["제2외국어"] && group["제2외국어"].includes(subjectID)) {
              hasTechOrLanguage = true
              selectedLanguageSubjects.push(subjectID)
            }
          }
          if (!hasTechOrLanguage) {
            createToast(
              "error",
              "2,3학년 선택군 중 [기술가정] 및 [제2외국어] 과목 중에서 최소 1과목을 반드시 선택해야 해요.",
            )
            return
          }
        }

        selectData[semesterID].push(subjectID)
        const element = dom(originID)
        if (element) {
          element.classList.add("--bg-green")
        } else {
        }
      } catch (selectionError) {
        createToast("error", "과목 선택 중 오류가 발생했습니다: " + selectionError.message)
        return
      }
    } else if (check === 1) {
      try {
        const counting = []
        if (group["과학2"] && group["과학2"].includes(subjectID)) {
          let subjectCheck = false
          let subjectCheck2 = false
          for (let i = 0; i < semesterArray.length; i++) {
            const semesterSubjects = selectData[semesterArray[i]] || []
            for (let x = 0; x < semesterSubjects.length; x++) {
              const data = semesterSubjects[x]
              if (data === "I3") {
                subjectCheck = true
              }
              if (group["과학2"].includes(data)) {
                subjectCheck2 = true
                counting.push(data)
              }
            }
          }
          if (subjectCheck) {
            if (subjectCheck2 && counting.length === 1) {
              createToast(
                "error",
                `위계상 ${subject[subjectID]} 과목을 취소할 수 없어요.\n융합과학 탐구 과목을 먼저 취소해 주세요.`,
              )
              return
            }
          }
        }

        const sciencePrerequisites = {
          F10: "E9",
          F11: "E10",
          F12: "E11",
          F13: "E12",
          G7: "E9",
          G8: "E10",
          G9: "E11",
          G10: "E12",
        }

        const computerPrerequisites = {
          I5: "E13",
          I5: "G13",
        }

        const dependentSubjects = []
        for (const [dependent, prerequisite] of Object.entries(sciencePrerequisites)) {
          if (prerequisite === subjectID) {
            dependentSubjects.push(dependent)
          }
        }
        for (const [dependent, prerequisite] of Object.entries(computerPrerequisites)) {
          if (prerequisite === subjectID) {
            dependentSubjects.push(dependent)
          }
        }

        if (dependentSubjects.length > 0) {
          // 모든 학기에서 위계 과목들이 선택되어 있는지 확인
          for (const dependent of dependentSubjects) {
            // 현재 학기에서 위계 과목 확인
            const currentSemesterSubjects = selectData[semesterID] || []
            if (currentSemesterSubjects.includes(dependent)) {
              createToast(
                "error",
                `위계상 ${subject[subjectID]} 과목을 취소할 수 없어요.\n${subject[dependent]} 과목을 먼저 취소해 주세요.`,
              )
              return
            }

            // 이후 학기들에서 의존 과목 확인
            const currentSemesterIndex = semesterArray.indexOf(semesterID)
            for (let i = currentSemesterIndex + 1; i < semesterArray.length; i++) {
              const futureSemesterSubjects = selectData[semesterArray[i]] || []
              if (futureSemesterSubjects.includes(dependent)) {
                createToast(
                  "error",
                  `위계상 ${subject[subjectID]} 과목을 취소할 수 없어요.\n${findSemesterName(semesterArray[i])}의 ${subject[dependent]} 과목을 먼저 취소해 주세요.`,
                )
                return
              }
            }
          }

          const allSelection = getAllSelection()
          for (const dependent of dependentSubjects) {
            if (allSelection.includes(dependent)) {
              let foundInPreviousSemester = false
              const currentSemesterIndex = semesterArray.indexOf(semesterID)
              for (let i = 0; i < currentSemesterIndex; i++) {
                const previousSemesterSubjects = selectData[semesterArray[i]] || []
                if (previousSemesterSubjects.includes(dependent)) {
                  foundInPreviousSemester = true
                  break
                }
              }

              if (!foundInPreviousSemester) {
                // 이미 위에서 현재/이후 학기는 체크했으므로 여기 도달하면 안됨
                createToast(
                  "error",
                  `위계상 ${subject[subjectID]} 과목을 취소할 수 없어요.\n${subject[dependent]} 과목을 먼저 취소해 주세요.`,
                )
                return
              }
            }
          }
        }

        if (selectData[semesterID] && Array.isArray(selectData[semesterID])) {
          removeFromArray(selectData[semesterID], subjectID)
        } else {
          createToast("error", "데이터 구조 오류입니다.")
          return
        }

        const element = dom(originID)
        if (element) {
          element.classList.remove("--bg-green")
        } else {
        }
      } catch (cancellationError) {
        createToast("error", "과목 취소 중 오류가 발생했습니다: " + cancellationError.message)
        return
      }
    } else if (check === 2) {
      const old_subjectId = findSubjectId_selectData(subjectID, semesterID)
      createToast(
        "error",
        `${subject[subjectID]} 과목은 이미 ${findSemesterName(old_subjectId)}에 신청하셨어요.\n해당 과목은 한 학기만 신청이 가능해요.`,
      )
    }

    try {
      updateViewing()
    } catch (updateError) {
    }
  } catch (e) {
    createToast("error", `과목 선택 중 오류가 발생했습니다: ${e.message || "알 수 없는 오류"}`)
  }
}

async function check() {
  try {
    const checks = await fetch("/api/getSelectHistory", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        throw error
      })

    if (checks.data.length === 0) {
      createToast("error", "아직 제출하신 이력이 없어요.")
      return
    }

    if (checks.success) {
      const selData = checks.data[0]
      const data = JSON.parse(selData.data)
      createToast("success", checks.message)
      const result = []
      for (let i = 0; i < semesterArray.length; i++) {
        let str = semesterArray[i]
          .replace("SO", "2학년 1학기")
          .replace("ST", "2학년 2학기")
          .replace("SOY", "2학년 1학기 예술")
          .replace("STY", "2학년 2학기 예술")
          .replace("TO", "3학년 1학기")
          .replace("TT", "3학년 2학기")
          .replace("TOY", "3학년 1학기 예술")
          .replace("TTY", "3학년 2학기 예술")
        for (let x = 0; x < data[semesterArray[i]].length; x++) {
          str += "<br>" + subject[data[semesterArray[i]][x]]
        }
        result.push(str)
      }
      const studentDataElement = document.getElementById("student_data")
      const studentModalElement = document.getElementById("student_modal")
      if (studentDataElement) {
        studentDataElement.innerHTML = result.join("<br><br>")
      }
      if (studentModalElement) {
        studentModalElement.style.display = "block"
      }
    } else {
      createToast("error", checks.message)
    }
  } catch (error) {
    createToast("error", "이력 조회 중 오류가 발생했습니다.")
  }
}

async function submit() {
  try {
    if (findSelectNum() !== totalSelectNum()) {
      createToast("error", "제출 전 과목 선택을 모두 완료해야 해요.")
      return
    }

    const soHasLiberalArts = (selectData["SO"] || []).some((id) => group["교양"] && group["교양"].includes(id))
    const stHasLiberalArts = (selectData["ST"] || []).some((id) => group["교양"] && group["교양"].includes(id))
    if (!soHasLiberalArts || !stHasLiberalArts) {
      createToast("error", "2학년 1학기와 2학기에는 각각 교양과목을 하나씩 반드시 선택해야 해요.")
      return
    }

    let hasTechOrLanguage = false
    const selectedTechSubjects = []
    const selectedLanguageSubjects = []
    for (let i = 0; i < semesterArray.length; i++) {
      if (["SO", "ST", "TO", "TT"].includes(semesterArray[i])) {
        const semesterSubjects = selectData[semesterArray[i]] || []
        for (let x = 0; x < semesterSubjects.length; x++) {
          const subjectID = semesterSubjects[x]
          if (group["기술가정"] && group["기술가정"].includes(subjectID)) {
            hasTechOrLanguage = true
            selectedTechSubjects.push(subjectID)
          }
          if (group["제2외국어"] && group["제2외국어"].includes(subjectID)) {
            hasTechOrLanguage = true
            selectedLanguageSubjects.push(subjectID)
          }
        }
      }
    }

    if (!hasTechOrLanguage) {
      createToast("error", "2,3학년 선택군 중 [기술가정] 및 [제2외국어] 과목 중에서 최소 1과목을 반드시 선택해야 해요.")
      return
    }

    const submitSelect = await fetch("/api/submitSelect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: selectData,
      }),
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        throw error
      })

    if (submitSelect.success) {
      createToast("success", submitSelect.message)
    } else {
      createToast("error", submitSelect.message)
    }
  } catch (error) {
    createToast("error", "제출 중 오류가 발생했습니다.")
  }
}

function getPreviousSemesters(currentCode) {
  const semesterCodes = ["SO", "ST", "TO", "TT", "SOY", "STY", "TOY", "TTY"]
  const currentIndex = semesterCodes.indexOf(currentCode)
  if (currentIndex === -1) {
    return []
  }
  return semesterCodes.slice(0, currentIndex)
}

function getAllSelection() {
  const arr = []
  try {
    for (let i = 0; i < semesterArray.length; i++) {
      const semesterSubjects = selectData[semesterArray[i]] || []
      for (let y = 0; y < semesterSubjects.length; y++) {
        arr.push(semesterSubjects[y])
      }
    }
  } catch (error) {}
  return arr
}

function findSelectNum() {
  let sum = 0
  try {
    for (let i = 0; i < semesterArray.length; i++) {
      const semesterSubjects = selectData[semesterArray[i]] || []
      sum += semesterSubjects.length
    }
  } catch (error) {}
  return sum
}

function totalSelectNum() {
  try {
    return availableSubjectNum.reduce((acc, current) => acc + current, 0)
  } catch (error) {
    return 0
  }
}

function closeModal() {
  const studentModalElement = document.getElementById("student_modal")
  if (studentModalElement) {
    studentModalElement.style.display = "none"
  }
}

function findId_selectData(subjectID, semesterID) {
  try {
    for (const key in selectData) {
      const semesterSubjects = selectData[key] || []
      if (semesterSubjects.includes(subjectID)) {
        if (semesterID === key) {
          return 1
        } else {
          return 2
        }
      }
    }
    return 0
  } catch (error) {
    return 0
  }
}

function findSubjectId_selectData(subjectID, semesterID) {
  try {
    for (const key in selectData) {
      const semesterSubjects = selectData[key] || []
      if (semesterSubjects.includes(subjectID)) {
        if (semesterID === key) {
          return null
        } else {
          return key
        }
      }
    }
    return null
  } catch (error) {
    return null
  }
}

function removeFromArray(array, value) {
  try {
    if (!Array.isArray(array)) {
      return
    }
    const index = array.indexOf(value)
    if (index !== -1) {
      array.splice(index, 1)
    }
  } catch (error) {}
}

function findSemesterName(semesterID) {
  try {
    if (!semesterID) return "알 수 없는 학기"
    return semesterID
      .replace("SO", "2학년 1학기")
      .replace("ST", "2학년 2학기")
      .replace("TO", "3학년 1학기")
      .replace("TT", "3학년 2학기")
      .replace("SOY", "2학년 1학기 예술")
      .replace("STY", "2학년 2학기 예술")
      .replace("TOY", "3학년 1학기 예술")
      .replace("TTY", "3학년 2학기 예술")
  } catch (error) {
    return "알 수 없는 학기"
  }
}

function updateViewing() {
  try {
    initViewing()
    for (let i = 0; i < semesterArray.length; i++) {
      const semesterID = semesterArray[i]
      const semesterSubjects = selectData[semesterID] || []
      for (let x = 0; x < semesterSubjects.length; x++) {
        const subjectID = semesterSubjects[x]
        const subjectName = subject[subjectID]
        const viewElementId = semesterID + "_" + String(x + 1)
        const viewElement = document.getElementById(viewElementId)
        if (viewElement) {
          viewElement.innerHTML = subjectName
        } else {
          const alternativeId = `${semesterID.toLowerCase()}_${x + 1}`
          const alternativeElement = document.getElementById(alternativeId)
          if (alternativeElement) {
            alternativeElement.innerHTML = subjectName
          } else {
            const alternativeId2 = `${semesterID}${x + 1}`
            const alternativeElement2 = document.getElementById(alternativeId2)
            if (alternativeElement2) {
              alternativeElement2.innerHTML = subjectName
            }
          }
        }
      }
    }
  } catch (error) {}
}

function resetData() {
  location.href = "/choose"
  return
}

function seperateCode(data) {
  try {
    if (!data || typeof data !== "string") {
      throw new Error("유효하지 않은 데이터입니다")
    }
    const split = data.split("_")
    if (split.length < 2) {
      throw new Error("ID 형식이 올바르지 않습니다")
    }
    return split
  } catch (error) {
    throw error
  }
}

function initViewing() {
  try {
    for (let i = 0; i < semesterArray.length; i++) {
      for (let x = 0; x < availableSubjectNum[i]; x++) {
        const viewElementId = semesterArray[i] + "_" + String(x + 1)
        const viewElement = document.getElementById(viewElementId)
        if (viewElement) {
          viewElement.innerHTML = ""
        }
      }
    }
  } catch (error) {}
}

const availableSubjectNum = [5, 5, 4, 6, 1, 1, 1, 1]
const semesterArray = ["SO", "ST", "TO", "TT", "SOY", "STY", "TOY", "TTY"]
const selectData = {
  SO: [],
  ST: [],
  TO: [],
  TT: [],
  SOY: [],
  STY: [],
  TOY: [],
  TTY: [],
}

const group = {
  국어: ["E1", "F1", "F2", "H1", "H2"],
  수학: ["E2", "F3", "F4", "G1", "H3"],
  영어: ["E3", "F5", "G2", "H4", "H5"],
  사회: ["E4", "E5", "E6", "E7", "E8", "F6", "F7", "F8", "F9", "G3", "G4", "G5", "G6", "I1", "I2"],
  과학: ["E9", "E10", "E11", "E12", "F10", "F11", "F12", "F13", "G7", "G8", "G9", "G10", "I3", "I4"],
  과학2: ["F10", "F11", "F12", "F13", "G7", "G8", "G9", "G10"],
  기술가정: ["E13", "F14", "F15", "G13", "I5"],
  제2외국어: ["E14", "E15", "F16", "F17", "G11", "G12", "I6", "I7"],
  교양: ["D1", "D2", "D3", "D4"],
  예술: ["A1", "A2", "A3", "B1", "B2", "C1", "C2"],
}

const subject = {
  A1: "음악",
  A2: "미술",
  A3: "삶과 종교",
  B1: "음악 연주와 창작",
  B2: "미술 창작",
  C1: "음악 감상과 비평",
  C2: "미술 감상과 비평",
  D1: "교육의 이해",
  D2: "인간과 철학",
  D3: "논술",
  D4: "인간과 심리",
  E1: "주제 탐구 독서",
  E2: "인공지능 수학",
  E3: "영어 발표와 토론",
  E4: "세계시민과 지리",
  E5: "세계사",
  E6: "사회와 문화",
  E7: "정치",
  E8: "현대사회와 윤리",
  E9: "물리학",
  E10: "화학",
  E11: "생명과학",
  E12: "지구과학",
  E13: "프로그래밍",
  E14: "일본어",
  E15: "중국어",
  F1: "매체 의사소통",
  F2: "독서 토론과 글쓰기",
  F3: "기하",
  F4: "수학과 문화",
  F5: "심화 영어",
  F6: "한국지리 탐구",
  F7: "동아시아 역사 기행",
  F8: "법과 사회",
  F9: "윤리와 사상",
  F10: "역학과 에너지",
  F11: "물질과 에너지",
  F12: "세포와 물질대사",
  F13: "지구시스템과학",
  F14: "정보과학",
  F15: "소프트웨어와 생활",
  F16: "일본어 회화",
  F17: "중국어 회화",
  G1: "미적분Ⅱ",
  G2: "심화 영어 독해와 작문",
  G3: "도시의 미래 탐구",
  G4: "역사로 탐구하는 현대 세계",
  G5: "경제",
  G6: "인문학과 윤리",
  G7: "전자기와 양자",
  G8: "화학 반응의 세계",
  G9: "생물의 유전",
  G10: "행성우주과학",
  G11: "일본 문화",
  G12: "중국 문화",
  G13: "데이터 과학",
  H1: "문학과 영상",
  H2: "언어생활 탐구",
  H3: "수학과제 탐구",
  H4: "세계 문화와 영어",
  H5: "미디어 영어",
  I1: "사회문제 탐구",
  I2: "윤리문제 탐구",
  I3: "융합과학 탐구",
  I4: "기후변화와 환경생태",
  I5: "인공지능 일반",
  I6: "심화 일본어",
  I7: "심화 중국어",
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    selectSubject,
    check,
    submit,
    closeModal,
    resetData,
    findSelectNum,
    totalSelectNum,
    getAllSelection,
    getPreviousSemesters,
    findSemesterName,
    updateViewing,
    initViewing,
  }
}