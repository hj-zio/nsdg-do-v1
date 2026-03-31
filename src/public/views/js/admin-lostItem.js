let dataTable = null
let allPosts = []

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPosts()
})

async function loadAllPosts() {
  try {
    const response = await fetch("/admin/getAllLostItems")
    const text = await response.text()
    const result = JSON.parse(text)

    if (result.success && result.data) {
      allPosts = result.data
      updateStatistics()
      initDataTable()
    } else {
      alert("게시글을 불러오는데 실패했어요.")
    }
  } catch (error) {
    alert("게시글을 불러오는 중 오류가 발생했어요.")
  }
}

function updateStatistics() {
  const total = allPosts.length
  const active = allPosts.filter((p) => !p.is_hidden && !p.is_deleted).length
  const hidden = allPosts.filter((p) => p.is_hidden && !p.is_deleted).length
  const deleted = allPosts.filter((p) => p.is_deleted).length

  document.getElementById("totalCount").textContent = total
  document.getElementById("activeCount").textContent = active
  document.getElementById("hiddenCount").textContent = hidden
  document.getElementById("deletedCount").textContent = deleted
}

function initDataTable() {
  if (dataTable) {
    dataTable.destroy()
  }

  const tableData = allPosts.map((post) => {
    let studentNumber = ""
    if (post.schoolDetail) {
      try {
        const schoolDetail = typeof post.schoolDetail === "string" ? JSON.parse(post.schoolDetail) : post.schoolDetail
        const grade = schoolDetail.grade || ""
        const classNum = schoolDetail.class || ""
        const number = schoolDetail.number || ""
        if (grade && classNum && number) {
          studentNumber = `${grade}${classNum}${number.padStart(2, "0")}`
        }
      } catch (e) {
        // 학번 파싱 실패 시 무시
      }
    }

    const date = new Date(post.created_at)
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`

    const postTypeText = post.post_type === "찾아줌" ? "분실물 찾아줌" : "분실물 찾는 중"
    const postTypeClass = post.post_type === "찾아줌" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"

    const statusText = post.status === "찾음" ? "찾음" : "찾는 중"
    const statusClass = post.status === "찾음" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"

    let status = "활성"
    let statusClass2 = "bg-green-100 text-green-800"
    if (post.is_deleted) {
      status = "삭제됨"
      statusClass2 = "bg-red-100 text-red-800"
    } else if (post.is_hidden) {
      status = "숨김"
      statusClass2 = "bg-orange-100 text-orange-800"
    }

    return [
      post.id,
      post.title,
      post.name,
      studentNumber,
      dateStr,
      `<div class="flex flex-col gap-1">
        <span class="px-2 py-1 text-[12px] rounded ${postTypeClass} pretendard-600">${postTypeText}</span>
        <span class="px-2 py-1 text-[12px] rounded ${statusClass} pretendard-600">${statusText}</span>
      </div>`,
      `<span class="px-2 py-1 text-[12px] rounded ${statusClass2} pretendard-600">${status}</span>`,
      `
                <div class="flex gap-2">
                    <button onclick="showDetail(${post.id})" class="px-2 py-1 text-[12px] text-blue-600 border border-blue-600 rounded hover:bg-blue-50 pretendard-600">
                        상세
                    </button>
                    <button onclick="showHistory(${post.id})" class="px-2 py-1 text-[12px] text-purple-600 border border-purple-600 rounded hover:bg-purple-50 pretendard-600">
                        이력
                    </button>
                    ${
                      !post.is_deleted
                        ? `
                        <button onclick="toggleHide(${post.id}, ${!post.is_hidden})" class="px-2 py-1 text-[12px] text-orange-600 border border-orange-600 rounded hover:bg-orange-50 pretendard-600">
                            ${post.is_hidden ? "표시" : "숨김"}
                        </button>
                        <button onclick="changeStatus(${post.id}, '${post.status === "찾음" ? "찾는_중" : "찾음"}')" class="px-2 py-1 text-[12px] text-green-600 border border-green-600 rounded hover:bg-green-50 pretendard-600">
                            ${post.status === "찾음" ? "찾는 중으로" : "찾음 처리"}
                        </button>
                        <button onclick="deletePost(${post.id})" class="px-2 py-1 text-[12px] text-red-600 border border-red-600 rounded hover:bg-red-50 pretendard-600">
                            삭제
                        </button>
                    `
                        : ""
                    }
                </div>
            `,
    ]
  })

  const $ = window.jQuery
  dataTable = $("#lostItemTable").DataTable({
    data: tableData,
    order: [[0, "desc"]],
    pageLength: 25,
    language: {
      search: "검색:",
      lengthMenu: "_MENU_ 개씩 보기",
      info: "_START_-_END_ / _TOTAL_개",
      infoEmpty: "0개",
      infoFiltered: "(전체 _MAX_개 중)",
      paginate: {
        first: "처음",
        last: "마지막",
        next: "다음",
        previous: "이전",
      },
    },
  })
}

function showDetail(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  let studentNumber = ""
  if (post.schoolDetail) {
    try {
      const schoolDetail = typeof post.schoolDetail === "string" ? JSON.parse(post.schoolDetail) : post.schoolDetail
      const grade = schoolDetail.grade || ""
      const classNum = schoolDetail.class || ""
      const number = schoolDetail.number || ""
      if (grade && classNum && number) {
        studentNumber = `${grade}${classNum}${number.padStart(2, "0")}`
      }
    } catch (e) {
      // 학번 파싱 실패 시 무시
    }
  }

  const createdDate = new Date(post.created_at)
  const createdStr = `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, "0")}.${String(createdDate.getDate()).padStart(2, "0")} ${String(createdDate.getHours()).padStart(2, "0")}:${String(createdDate.getMinutes()).padStart(2, "0")}`

  let updatedStr = ""
  if (post.updated_at && post.updated_at !== post.created_at) {
    const updatedDate = new Date(post.updated_at)
    updatedStr = `${updatedDate.getFullYear()}.${String(updatedDate.getMonth() + 1).padStart(2, "0")}.${String(updatedDate.getDate()).padStart(2, "0")} ${String(updatedDate.getHours()).padStart(2, "0")}:${String(updatedDate.getMinutes()).padStart(2, "0")}`
  }

  let deletedStr = ""
  if (post.is_deleted && post.deleted_at) {
    const deletedDate = new Date(post.deleted_at)
    deletedStr = `${deletedDate.getFullYear()}.${String(deletedDate.getMonth() + 1).padStart(2, "0")}.${String(deletedDate.getDate()).padStart(2, "0")} ${String(deletedDate.getHours()).padStart(2, "0")}:${String(deletedDate.getMinutes()).padStart(2, "0")}`
  }

  const detailContent = document.getElementById("detailContent")
  detailContent.innerHTML = `
        <div class="space-y-4">
            <div>
                <div class="text-[14px] text-gray-600 pretendard-600 mb-1">제목</div>
                <div class="text-[18px] text-gray-800 pretendard-700">${escapeHtml(post.title)}</div>
            </div>
            <div>
                <div class="text-[14px] text-gray-600 pretendard-600 mb-1">작성자</div>
                <div class="text-[16px] text-gray-800 pretendard-500">${escapeHtml(post.name)} ${studentNumber ? `(${studentNumber})` : ""}</div>
            </div>
            ${
              post.email
                ? `
            <div>
                <div class="text-[14px] text-gray-600 pretendard-600 mb-1">이메일</div>
                <div class="text-[16px] text-gray-800 pretendard-500">${escapeHtml(post.email)}</div>
            </div>
            `
                : ""
            }
            <div>
                <div class="text-[14px] text-gray-600 pretendard-600 mb-1">내용</div>
                <div class="text-[16px] text-gray-800 pretendard-400 whitespace-pre-wrap leading-relaxed p-4 bg-gray-50 rounded">${escapeHtml(post.content)}</div>
            </div>
            ${
              post.image_url
                ? `
                <div>
                    <div class="text-[14px] text-gray-600 pretendard-600 mb-1">이미지</div>
                    <img src="${escapeHtml(post.image_url)}" alt="게시글 이미지" class="max-w-full rounded border border-gray-200">
                </div>
            `
                : ""
            }
            ${
              post.product_link
                ? `
                <div>
                    <div class="text-[14px] text-gray-600 pretendard-600 mb-1">상품 링크</div>
                    <a href="${escapeHtml(post.product_link)}" target="_blank" class="text-[16px] text-blue-600 pretendard-500 hover:underline">${escapeHtml(post.product_link)}</a>
                </div>
            `
                : ""
            }
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                    <div class="text-[14px] text-gray-600 pretendard-600 mb-1">작성일</div>
                    <div class="text-[14px] text-gray-800 pretendard-500">${createdStr}</div>
                </div>
                ${
                  updatedStr
                    ? `
                    <div>
                        <div class="text-[14px] text-gray-600 pretendard-600 mb-1">수정일</div>
                        <div class="text-[14px] text-gray-800 pretendard-500">${updatedStr}</div>
                    </div>
                `
                    : ""
                }
                ${
                  deletedStr
                    ? `
                    <div>
                        <div class="text-[14px] text-gray-600 pretendard-600 mb-1">삭제일</div>
                        <div class="text-[14px] text-red-600 pretendard-500">${deletedStr}</div>
                    </div>
                    <div>
                        <div class="text-[14px] text-gray-600 pretendard-600 mb-1">삭제자</div>
                        <div class="text-[14px] text-red-600 pretendard-500">${escapeHtml(post.deleted_by || "")}</div>
                    </div>
                `
                    : ""
                }
            </div>
            <div class="pt-4 border-t border-gray-200">
                <div class="text-[14px] text-gray-600 pretendard-600 mb-2">게시글 정보</div>
                <div class="flex gap-2 flex-wrap">
                    <span class="px-3 py-1 text-[14px] rounded ${post.post_type === "찾아줌" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"} pretendard-600">
                        ${post.post_type === "찾아줌" ? "분실물 찾아줌" : "분실물 찾는 중"}
                    </span>
                    <span class="px-3 py-1 text-[14px] rounded ${post.status === "찾음" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} pretendard-600">
                        ${post.status === "찾음" ? "찾음" : "찾는 중"}
                    </span>
                    <span class="px-3 py-1 text-[14px] rounded ${post.is_hidden ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"} pretendard-600">
                        ${post.is_hidden ? "숨김" : "표시"}
                    </span>
                    <span class="px-3 py-1 text-[14px] rounded ${post.is_deleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} pretendard-600">
                        ${post.is_deleted ? "삭제됨" : "활성"}
                    </span>
                </div>
            </div>
        </div>
    `

  document.getElementById("detailModal").classList.remove("hidden")
}

function closeDetailModal() {
  document.getElementById("detailModal").classList.add("hidden")
}

async function showHistory(postId) {
  try {
    const response = await fetch(`/admin/getLostItemHistory/${postId}`)
    const result = await response.json()

    if (!result.success) {
      alert("수정 이력을 불러오는데 실패했어요.")
      return
    }

    const historyContent = document.getElementById("historyContent")

    if (!result.data || result.data.length === 0) {
      historyContent.innerHTML = `
                <div class="text-center py-8 text-gray-500 pretendard-500">
                    수정 이력이 없어요.
                </div>
            `
    } else {
      const historyHtml = result.data
        .map((history) => {
          const date = new Date(history.created_at)
          const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

          const fieldNames = {
            title: "제목",
            content: "내용",
            image_token: "이미지",
            product_link: "상품 링크",
            post_type: "게시글 타입",
            status: "상태",
          }

          let oldValueHtml = ""
          let newValueHtml = ""

          if (history.field_name === "image_token") {
            // Use old_value_token and new_value_token for images
            oldValueHtml = history.old_value_token
              ? `<img src="/i?id=${escapeHtml(history.old_value_token)}" alt="이전 이미지" class="max-w-[300px] max-h-[300px] rounded border border-gray-200">`
              : `<div class="text-gray-500 pretendard-400">(이미지 없음)</div>`

            newValueHtml = history.new_value_token
              ? `<img src="/i?id=${escapeHtml(history.new_value_token)}" alt="새 이미지" class="max-w-[300px] max-h-[300px] rounded border border-gray-200">`
              : `<div class="text-gray-500 pretendard-400">(이미지 없음)</div>`
          } else if (history.field_name === "post_type") {
            // Use old_value_text and new_value_text for post_type
            const formatPostType = (value) => {
              if (value === "찾는_중") return "분실물 찾는 중"
              if (value === "찾아줌") return "분실물 찾아줌"
              return value || "(없음)"
            }

            oldValueHtml = `<div class="text-[14px] text-gray-800 pretendard-400">${formatPostType(history.old_value_text)}</div>`
            newValueHtml = `<div class="text-[14px] text-gray-800 pretendard-400">${formatPostType(history.new_value_text)}</div>`
          } else if (history.field_name === "status") {
            // Use old_value_text and new_value_text for status
            const formatStatus = (value) => {
              if (value === "찾는_중") return "찾는 중"
              if (value === "찾음") return "찾음"
              return value || "(없음)"
            }

            oldValueHtml = `<div class="text-[14px] text-gray-800 pretendard-400">${formatStatus(history.old_value_text)}</div>`
            newValueHtml = `<div class="text-[14px] text-gray-800 pretendard-400">${formatStatus(history.new_value_text)}</div>`
          } else {
            // Use old_value_text and new_value_text for title, content, product_link
            oldValueHtml = `<div class="text-[14px] text-gray-800 pretendard-400 whitespace-pre-wrap">${escapeHtml(history.old_value_text || "(없음)")}</div>`
            newValueHtml = `<div class="text-[14px] text-gray-800 pretendard-400 whitespace-pre-wrap">${escapeHtml(history.new_value_text || "(없음)")}</div>`
          }

          return `
                    <div class="border-b border-gray-200 pb-4 mb-4 last:border-0">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[14px] text-gray-800 pretendard-600">${fieldNames[history.field_name] || history.field_name} 수정</span>
                            <span class="text-[12px] text-gray-500 pretendard-400">${dateStr}</span>
                        </div>
                        <div class="text-[14px] text-gray-600 pretendard-500 mb-1">수정자: ${escapeHtml(history.name)}</div>
                        <div class="bg-gray-50 rounded p-3 space-y-2">
                            <div>
                                <div class="text-[12px] text-gray-600 pretendard-600 mb-1">이전 값</div>
                                ${oldValueHtml}
                            </div>
                            <div>
                                <div class="text-[12px] text-gray-600 pretendard-600 mb-1">새로운 값</div>
                                ${newValueHtml}
                            </div>
                        </div>
                    </div>
                `
        })
        .join("")

      historyContent.innerHTML = historyHtml
    }

    document.getElementById("historyModal").classList.remove("hidden")
  } catch (error) {
    alert("수정 이력을 불러오는 중 오류가 발생했어요.")
  }
}

function closeHistoryModal() {
  document.getElementById("historyModal").classList.add("hidden")
}

async function toggleHide(postId, isHidden) {
  if (!confirm(`게시글을 ${isHidden ? "숨김" : "표시"} 처리하시겠습니까?`)) {
    return
  }

  try {
    const response = await fetch("/admin/hideLostItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId, is_hidden: isHidden }),
    })

    const result = await response.json()

    if (result.success) {
      alert(`게시글이 ${isHidden ? "숨김" : "표시"} 처리되었어요.`)
      await loadAllPosts()
    } else {
      alert(result.message || "처리에 실패했어요.")
    }
  } catch (error) {
    alert("처리 중 오류가 발생했어요.")
  }
}

async function deletePost(postId) {
  if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없어요.")) {
    return
  }

  try {
    const response = await fetch("/admin/adminDeleteLostItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId }),
    })

    const result = await response.json()

    if (result.success) {
      alert("게시글이 삭제되었어요.")
      await loadAllPosts()
    } else {
      alert(result.message || "삭제에 실패했어요.")
    }
  } catch (error) {
    alert("삭제 중 오류가 발생했어요.")
  }
}

async function changeStatus(postId, newStatus) {
  const statusText = newStatus === "찾음" ? "찾음" : "찾는 중"
  if (!confirm(`게시글을 "${statusText}" 상태로 변경하시겠습니까?`)) {
    return
  }

  try {
    const response = await fetch("/admin/updateLostItemStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId, status: newStatus }),
    })

    const result = await response.json()

    if (result.success) {
      alert(`게시글 상태가 "${statusText}"(으)로 변경되었어요.`)
      await loadAllPosts()
    } else {
      alert(result.message || "상태 변경에 실패했어요.")
    }
  } catch (error) {
    alert("상태 변경 중 오류가 발생했어요.")
  }
}

function escapeHtml(text) {
  if (!text) return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
