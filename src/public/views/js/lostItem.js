let currentTab = "all" // 'all' 또는 'my'
let isLoading = false
let currentOffset = 0
const POSTS_PER_PAGE = 10
let hasMorePosts = true
let currentPostTypeFilter = "all" // 'all', 'lost', 'found'

document.addEventListener("DOMContentLoaded", async () => {
  const currentPath = window.location.pathname.toLowerCase()

  if (currentPath === "/lostitem") {
    await initLostItemList()
  } else if (currentPath === "/lostitem/post") {
    await initLostItemPost()
  } else if (currentPath.startsWith("/lostitem/edit/")) {
    await initLostItemEdit()
  } else {
  }
})

// 목록 페이지 초기화
async function initLostItemList() {
  const createPostBtn = document.getElementById("createPostBtn")
  const allPostsTab = document.getElementById("allPostsTab")
  const myPostsTab = document.getElementById("myPostsTab")
  const loadMoreBtn = document.getElementById("loadMoreBtn")
  const filterAll = document.getElementById("filterAll")
  const filterLost = document.getElementById("filterLost")
  const filterFound = document.getElementById("filterFound")
  const postTypeFilter = document.getElementById("postTypeFilter")

  createPostBtn.addEventListener("click", async () => {
    const userData = await getUserData()
    if (userData && userData.g_id === "123456789") {
      alert("게스트 계정은 글 작성이 불가능해요.")
      return
    }
    showCreatePostModal()
  })

  if (allPostsTab && myPostsTab) {
    allPostsTab.addEventListener("click", () => {
      currentTab = "all"
      updateTabUI()
      if (postTypeFilter) postTypeFilter.classList.remove("hidden")
      loadPosts()
    })

    myPostsTab.addEventListener("click", () => {
      currentTab = "my"
      updateTabUI()
      if (postTypeFilter) postTypeFilter.classList.add("hidden")
      loadPosts()
    })
  }

  if (filterAll) {
    filterAll.addEventListener("click", () => {
      currentPostTypeFilter = "all"
      updateFilterUI()
      loadPosts()
    })
  }

  if (filterLost) {
    filterLost.addEventListener("click", () => {
      currentPostTypeFilter = "lost"
      updateFilterUI()
      loadPosts()
    })
  }

  if (filterFound) {
    filterFound.addEventListener("click", () => {
      currentPostTypeFilter = "found"
      updateFilterUI()
      loadPosts()
    })
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      if (hasMorePosts) {
        loadPosts(true)
      }
    })
  }

  await loadPosts()
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 작성 모달 표시
function showCreatePostModal() {
  const modal = document.getElementById("createPostModal")
  const closeModalBtn = document.getElementById("closeModalBtn")
  const modalSubmitBtn = document.getElementById("modalSubmitBtn")
  const modalTitle = document.getElementById("modalTitle")
  const modalContent = document.getElementById("modalContent")
  const modalImageFile = document.getElementById("modalImageFile")
  const modalProductLink = document.getElementById("modalProductLink")
  const imagePreview = document.getElementById("imagePreview")
  const previewImg = document.getElementById("previewImg")

  const postTypeLost = document.getElementById("postTypeLost")
  const postTypeFound = document.getElementById("postTypeFound")
  let selectedPostType = "찾는_중" // default

  modal.classList.remove("hidden")

  modalTitle.value = ""
  modalContent.value = ""
  if (modalImageFile) modalImageFile.value = ""
  if (modalProductLink) modalProductLink.value = ""
  if (imagePreview) imagePreview.classList.add("hidden")

  if (postTypeLost && postTypeFound) {
    postTypeLost.className =
      "flex-1 py-3 px-4 border-2 border-blue-600 bg-blue-50 text-blue-600 rounded-lg pretendard-600 transition-all"
    postTypeFound.className =
      "flex-1 py-3 px-4 border-2 border-gray-300 bg-white text-gray-600 rounded-lg pretendard-600 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all"

    postTypeLost.onclick = () => {
      selectedPostType = "찾는_중"
      postTypeLost.className =
        "flex-1 py-3 px-4 border-2 border-blue-600 bg-blue-50 text-blue-600 rounded-lg pretendard-600 transition-all"
      postTypeFound.className =
        "flex-1 py-3 px-4 border-2 border-gray-300 bg-white text-gray-600 rounded-lg pretendard-600 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
    }

    postTypeFound.onclick = () => {
      selectedPostType = "찾아줌"
      postTypeFound.className =
        "flex-1 py-3 px-4 border-2 border-blue-600 bg-blue-50 text-blue-600 rounded-lg pretendard-600 transition-all"
      postTypeLost.className =
        "flex-1 py-3 px-4 border-2 border-gray-300 bg-white text-gray-600 rounded-lg pretendard-600 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
    }
  }

  // 이미지 미리보기
  if (modalImageFile) {
    modalImageFile.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        // 파일 크기 제한 체크 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
          alert("이미지 파일은 10MB 이하만 업로드 가능해요.")
          modalImageFile.value = ""
          imagePreview.classList.add("hidden")
          return
        }

        // 미리보기 표시
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImg.src = e.target.result
          imagePreview.classList.remove("hidden")
        }
        reader.readAsDataURL(file)
      } else {
        imagePreview.classList.add("hidden")
      }
    })
  }

  closeModalBtn.onclick = () => {
    modal.classList.add("hidden")
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
    }
  }

  modalSubmitBtn.onclick = async () => {
    const title = modalTitle.value.trim()
    const content = modalContent.value.trim()
    const imageFile = modalImageFile ? modalImageFile.files[0] : null
    const product_link = modalProductLink ? modalProductLink.value.trim() : ""

    if (!title) {
      alert("제목을 입력해주세요.")
      modalTitle.focus()
      return
    }

    if (!content) {
      alert("내용을 입력해주세요.")
      modalContent.focus()
      return
    }

    // 파일 크기 제한 체크 (10MB 제한)
    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      alert("이미지 파일은 10MB 이하만 업로드 가능해요.")
      return
    }

    try {
      modalSubmitBtn.disabled = true
      modalSubmitBtn.textContent = "등록 중..."

      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      const response = await fetch("/api/createLostItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          post_type: selectedPostType,
          image_base64: imageBase64,
          product_link,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("게시글이 등록되었어요.")
        modal.classList.add("hidden")
        await loadPosts()
      } else {
        alert(result.message || "게시글 등록에 실패했어요.")
      }
    } catch (error) {
      alert("게시글 등록 중 오류가 발생했어요.")
    } finally {
      modalSubmitBtn.disabled = false
      modalSubmitBtn.textContent = "등록"
    }
  }
}

// 탭 UI 업데이트
function updateTabUI() {
  const allPostsTab = document.getElementById("allPostsTab")
  const myPostsTab = document.getElementById("myPostsTab")

  if (!allPostsTab || !myPostsTab) return

  if (currentTab === "all") {
    allPostsTab.className =
      "flex-1 py-3 text-[14px] pretendard-600 border-b-2 border-blue-600 text-blue-600 transition-colors"
    myPostsTab.className =
      "flex-1 py-3 text-[14px] pretendard-600 border-b-2 border-gray-200 text-gray-500 transition-colors"
  } else {
    allPostsTab.className =
      "flex-1 py-3 text-[14px] pretendard-600 border-b-2 border-gray-200 text-gray-500 transition-colors"
    myPostsTab.className =
      "flex-1 py-3 text-[14px] pretendard-600 border-b-2 border-blue-600 text-blue-600 transition-colors"
  }
}

function updateFilterUI() {
  const filterAll = document.getElementById("filterAll")
  const filterLost = document.getElementById("filterLost")
  const filterFound = document.getElementById("filterFound")

  if (!filterAll || !filterLost || !filterFound) return

  const activeClass = "bg-blue-600 text-white"
  const inactiveClass = "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"

  filterAll.className = `flex-1 py-2 px-3 text-[13px] pretendard-600 rounded-lg transition-colors ${currentPostTypeFilter === "all" ? activeClass : inactiveClass}`
  filterLost.className = `flex-1 py-2 px-3 text-[13px] pretendard-600 rounded-lg transition-colors ${currentPostTypeFilter === "lost" ? activeClass : inactiveClass}`
  filterFound.className = `flex-1 py-2 px-3 text-[13px] pretendard-600 rounded-lg transition-colors ${currentPostTypeFilter === "found" ? activeClass : inactiveClass}`
}

// 게시글 로드
async function loadPosts(append = false) {
  if (isLoading) {
    return
  }

  const postList = document.getElementById("postList")
  const emptyState = document.getElementById("emptyState")
  const loadingState = document.getElementById("loadingState")
  const loadMoreBtn = document.getElementById("loadMoreBtn")

  if (!postList || !emptyState || !loadingState) {
    return
  }

  isLoading = true
  loadingState.classList.remove("hidden")
  emptyState.classList.add("hidden")

  if (!append) {
    postList.innerHTML = ""
    currentOffset = 0
    hasMorePosts = true
  }

  try {
    const endpoint = currentTab === "all" ? "/api/getLostItems" : "/api/getMyLostItems"
    const url = `${endpoint}?offset=${currentOffset}&limit=${POSTS_PER_PAGE}`

    const response = await fetch(url)
    const result = await response.json()

    loadingState.classList.add("hidden")

    if (result.success && result.data && result.data.length > 0) {
      let filteredPosts = result.data
      if (currentTab === "all" && currentPostTypeFilter !== "all") {
        const filterType = currentPostTypeFilter === "lost" ? "찾는_중" : "찾아줌"
        filteredPosts = result.data.filter((post) => post.post_type === filterType)
      }

      filteredPosts.forEach((post) => {
        const postCard = createPostCard(post, currentTab === "my")
        postList.appendChild(postCard)
      })

      if (result.data.length < POSTS_PER_PAGE) {
        hasMorePosts = false
        if (loadMoreBtn) loadMoreBtn.classList.add("hidden")
      } else {
        hasMorePosts = true
        if (loadMoreBtn) loadMoreBtn.classList.remove("hidden")
      }

      currentOffset += result.data.length

      if (filteredPosts.length === 0 && !append) {
        emptyState.classList.remove("hidden")
        const emptyText = emptyState.querySelector("p")
        if (emptyText) {
          emptyText.textContent = "해당 조건의 게시글이 없어요."
        }
      }
    } else {
      if (!append) {
        emptyState.classList.remove("hidden")
        const emptyText = emptyState.querySelector("p")
        if (emptyText) {
          emptyText.textContent = currentTab === "my" ? "작성한 게시글이 없어요." : "아직 등록된 분실물이 없어요."
        }
      }
      hasMorePosts = false
      if (loadMoreBtn) loadMoreBtn.classList.add("hidden")
    }
  } catch (error) {
    loadingState.classList.add("hidden")
    if (!append) {
      emptyState.classList.remove("hidden")
    }
    hasMorePosts = false
    if (loadMoreBtn) loadMoreBtn.classList.add("hidden")
  } finally {
    isLoading = false
  }
}

// 게시글 카드 생성
function createPostCard(post, isMyPost = false) {
  const card = document.createElement("div")
  card.className =
    "w-full p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"

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
    } catch (e) {}
  }

  const isEdited = post.updated_at && post.updated_at !== post.created_at
  const displayTime = isEdited ? post.updated_at : post.created_at
  const date = new Date(displayTime)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  const authorInfo = studentNumber ? `${studentNumber} ${post.name}` : post.name

  const postTypeBadge =
    post.post_type === "찾아줌"
      ? '<span class="px-2 py-1 text-[11px] bg-green-100 text-green-700 rounded pretendard-600">분실물 찾아줌</span>'
      : '<span class="px-2 py-1 text-[11px] bg-blue-100 text-blue-700 rounded pretendard-600">분실물 찾는 중</span>'

  const statusBadge =
    post.status === "찾음"
      ? '<span class="px-2 py-1 text-[11px] bg-gray-100 text-gray-700 rounded pretendard-600">찾음</span>'
      : ""

  const hasImage = post.image_token ? "📷" : ""

  card.innerHTML = `
        <div class="flex flex-col gap-2">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        ${postTypeBadge}
                        ${statusBadge}
                        ${hasImage ? '<span class="text-[14px]">📷</span>' : ""}
                    </div>
                    <h3 class="text-[16px] pretendard-700 text-gray-800 line-clamp-1 hover:text-blue-600">
                        ${escapeHtml(post.title)}
                    </h3>
                </div>
                ${
                  isMyPost
                    ? `
                    <div class="flex gap-2">
                        ${
                          post.status !== "찾음"
                            ? `
                        <button class="status-btn px-3 py-1 text-[12px] text-green-600 border border-green-600 rounded hover:bg-green-50 pretendard-600" data-id="${post.id}">
                            찾음
                        </button>
                        `
                            : ""
                        }
                        <button class="edit-btn px-3 py-1 text-[12px] text-blue-600 border border-blue-600 rounded hover:bg-blue-50 pretendard-600" data-id="${post.id}">
                            수정
                        </button>
                        <button class="delete-btn px-3 py-1 text-[12px] text-red-600 border border-red-600 rounded hover:bg-red-50 pretendard-600" data-id="${post.id}">
                            삭제
                        </button>
                    </div>
                `
                    : ""
                }
            </div>
            <div class="flex items-center justify-between mt-1">
                <span class="text-[14px] text-gray-700 pretendard-600">${escapeHtml(authorInfo)}</span>
                <div class="flex items-center gap-2">
                    <span class="text-[12px] text-gray-400 pretendard-400">${dateStr}</span>
                    ${isEdited ? '<span class="text-[11px] text-gray-400 pretendard-500">수정됨</span>' : ""}
                </div>
            </div>
        </div>
    `

  if (isMyPost) {
    const statusBtn = card.querySelector(".status-btn")
    const editBtn = card.querySelector(".edit-btn")
    const deleteBtn = card.querySelector(".delete-btn")

    if (statusBtn) {
      statusBtn.addEventListener("click", async (e) => {
        e.stopPropagation()
        const postId = statusBtn.dataset.id
        if (confirm("분실물을 찾으셨나요?")) {
          await updatePostStatus(postId, "찾음")
        }
      })
    }

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        const postId = editBtn.dataset.id
        location.href = `/lostitem/edit/${postId}`
      })
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation()
        const postId = deleteBtn.dataset.id
        if (confirm("정말 삭제하시겠습니까?")) {
          await deletePost(postId)
        }
      })
    }
  }

  // 카드 클릭 시 상세보기
  card.addEventListener("click", async (e) => {
    const userData = await getUserData()
    if (userData && userData.g_id === "123456789") {
      alert("게스트 계정은 게시글 상세 내용을 볼 수 없어요.")
      return
    }
    showPostDetail(post)
  })

  return card
}

async function updatePostStatus(postId, status) {
  try {
    const response = await fetch("/api/updateLostItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: postId,
        status: status,
      }),
    })

    const result = await response.json()

    if (result.success) {
      alert("상태가 변경되었어요.")
      await loadPosts()
    } else {
      alert(result.message || "상태 변경에 실패했어요.")
    }
  } catch (error) {
    alert("상태 변경 중 오류가 발생했어요.")
  }
}

// 게시글 상세 보기 (모달)
async function showPostDetail(post) {
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
    } catch (e) {}
  }

  const isEdited = post.updated_at && post.updated_at !== post.created_at
  const displayTime = isEdited ? post.updated_at : post.created_at
  const date = new Date(displayTime)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  const authorInfo = studentNumber ? `${studentNumber} ${post.name}` : post.name

  const emailInfo = post.email
    ? `<div class="text-[14px] text-gray-600 pretendard-400">📧 ${escapeHtml(post.email)}</div>`
    : ""

  const postTypeBadge =
    post.post_type === "찾아줌"
      ? '<span class="px-2 py-1 text-[12px] bg-green-100 text-green-700 rounded pretendard-600">분실물 찾아줌</span>'
      : '<span class="px-2 py-1 text-[12px] bg-blue-100 text-blue-700 rounded pretendard-600">분실물 찾는 중</span>'

  const statusBadge =
    post.status === "찾음"
      ? '<span class="px-2 py-1 text-[12px] bg-gray-100 text-gray-700 rounded pretendard-600">찾음</span>'
      : ""

  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-[600px] w-full max-h-[80vh] overflow-y-auto p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    ${postTypeBadge}
                    ${statusBadge}
                </div>
                <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <h2 class="text-[20px] pretendard-700 text-gray-800 mb-4">${escapeHtml(post.title)}</h2>
            <div class="flex flex-col gap-2 mb-4">
                <div class="flex items-center gap-2 text-[14px] text-gray-600">
                    <span class="pretendard-600">${escapeHtml(authorInfo)}</span>
                    <span>•</span>
                    <span class="pretendard-400">${dateStr}</span>
                    ${isEdited ? '<span class="text-[12px] text-gray-400 pretendard-500">수정됨</span>' : ""}
                </div>
                ${emailInfo}
            </div>
            <div class="text-[16px] text-gray-700 pretendard-400 whitespace-pre-line leading-6 mb-4">
                ${escapeHtml(post.content)}
            </div>
            <div id="imageContainer-${post.id}" class="mb-4 hidden">
                <div class="flex items-center justify-center py-4">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
            ${
              post.product_link
                ? `<div class="mb-4">
                    <a href="${escapeHtml(post.product_link)}" target="_blank" rel="noopener noreferrer" 
                       class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors pretendard-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        상품 링크 보기
                    </a>
                </div>`
                : ""
            }
        </div>
    `

  document.body.appendChild(modal)

  const imageContainer = modal.querySelector(`#imageContainer-${post.id}`)
  if (imageContainer && post.image_token) {
    imageContainer.classList.remove("hidden")
    imageContainer.innerHTML = `<img src="/i?id=${escapeHtml(post.image_token)}" alt="게시글 이미지" class="w-full rounded-lg object-cover" onerror="this.parentElement.classList.add('hidden')">`
  } else if (imageContainer) {
    imageContainer.classList.add("hidden")
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
}

// 게시글 삭제
async function deletePost(postId) {
  try {
    const response = await fetch("/api/deleteLostItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId }),
    })

    const result = await response.json()

    if (result.success) {
      alert("게시글이 삭제되었어요.")
      await loadPosts()
    } else {
      alert(result.message || "게시글 삭제에 실패했어요.")
    }
  } catch (error) {
    alert("게시글 삭제 중 오류가 발생했어요.")
  }
}

// 작성 페이지 초기화
async function initLostItemPost() {
  const userData = await getUserData()

  if (userData && userData.g_id === "123456789") {
    alert("게스트 계정은 글 작성이 불가능해요.")
    location.href = "/lostItem"
    return
  }

  const submitPostBtn = document.getElementById("submitPostBtn")
  const titleInput = document.getElementById("title")
  const contentInput = document.getElementById("content")
  const image_urlInput = document.getElementById("image_url")
  const product_linkInput = document.getElementById("product_link")

  submitPostBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim()
    const content = contentInput.value.trim()
    const imageFile = image_urlInput ? image_urlInput.files[0] : null
    const product_link = product_linkInput ? product_linkInput.value.trim() : ""

    if (!title) {
      alert("제목을 입력해주세요.")
      titleInput.focus()
      return
    }

    if (!content) {
      alert("내용을 입력해주세요.")
      contentInput.focus()
      return
    }

    // 파일 크기 제한 체크 (10MB 제한)
    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      alert("이미지 파일은 10MB 이하만 업로드 가능해요.")
      return
    }

    try {
      submitPostBtn.disabled = true
      submitPostBtn.textContent = "등록 중..."

      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile)
      }

      const response = await fetch("/api/createLostItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          image_base64: imageBase64,
          product_link,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("게시글이 등록되었어요.")
        location.href = "/lostItem"
      } else {
        alert(result.message || "게시글 등록에 실패했어요.")
        submitPostBtn.disabled = false
        submitPostBtn.textContent = "등록"
      }
    } catch (error) {
      alert("게시글 등록 중 오류가 발생했어요.")
      submitPostBtn.disabled = false
      submitPostBtn.textContent = "등록"
    }
  })
}

// 수정 페이지 초기화
async function initLostItemEdit() {
  try {
    const userData = await getUserData()

    if (userData && userData.g_id === "123456789") {
      alert("게스트 계정은 글 수정이 불가능해요.")
      location.href = "/lostItem"
      return
    }

    const pathParts = window.location.pathname.split("/")
    const postId = pathParts[pathParts.length - 1]

    if (!postId || isNaN(postId)) {
      alert("잘못된 접근이에요.")
      location.href = "/lostItem"
      return
    }

    const response = await fetch(`/api/getLostItem/${postId}`)
    const result = await response.json()

    if (!result.success || !result.data) {
      alert("게시글을 찾을 수 없어요.")
      location.href = "/lostItem"
      return
    }

    const post = result.data

    if (post.uuid !== userData.g_id) {
      alert("본인의 게시글만 수정할 수 있어요.")
      location.href = "/lostItem"
      return
    }

    const titleInput = document.getElementById("title")
    const contentInput = document.getElementById("content")
    const imageFileInput = document.getElementById("image_url")
    const currentImageDiv = document.getElementById("currentImage")
    const currentImageImg = document.getElementById("currentImageImg")
    const product_linkInput = document.getElementById("product_link")

    if (!titleInput || !contentInput) {
      alert("페이지 로드 오류가 발생했어요.")
      return
    }

    titleInput.value = post.title
    contentInput.value = post.content

    if (post.image_token && currentImageDiv && currentImageImg) {
      currentImageImg.src = `/i?id=${post.image_token}`
      currentImageDiv.classList.remove("hidden")

      currentImageImg.onerror = () => {
        currentImageDiv.classList.add("hidden")
      }
    }

    if (product_linkInput) {
      product_linkInput.value = post.product_link || ""
    }

    if (imageFileInput) {
      imageFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            alert("이미지 파일은 10MB 이하만 업로드 가능해요.")
            imageFileInput.value = ""
            return
          }

          const reader = new FileReader()
          reader.onload = (e) => {
            if (currentImageImg && currentImageDiv) {
              currentImageImg.src = e.target.result
              currentImageDiv.classList.remove("hidden")
            }
          }
          reader.readAsDataURL(file)
        }
      })
    }

    const submitPostBtn = document.getElementById("submitPostBtn")

    if (!submitPostBtn) {
      return
    }

    submitPostBtn.textContent = "수정"

    submitPostBtn.addEventListener("click", async () => {
      const title = titleInput.value.trim()
      const content = contentInput.value.trim()
      const imageFile = imageFileInput ? imageFileInput.files[0] : null
      const product_link = product_linkInput ? product_linkInput.value.trim() : ""

      if (!title) {
        alert("제목을 입력해주세요.")
        return
      }

      if (!content) {
        alert("내용을 입력해주세요.")
        return
      }

      if (imageFile && imageFile.size > 10 * 1024 * 1024) {
        alert("이미지 파일은 10MB 이하만 업로드 가능해요.")
        return
      }

      try {
        submitPostBtn.disabled = true
        submitPostBtn.textContent = "수정 중..."

        let imageBase64 = null
        if (imageFile) {
          imageBase64 = await fileToBase64(imageFile)
        }

        const requestData = {
          id: postId,
          title,
          content,
          image_base64: imageBase64,
          product_link,
        }

        const response = await fetch("/api/updateLostItem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })

        const result = await response.json()

        if (result.success) {
          alert("게시글이 수정되었어요.")
          location.href = "/lostItem"
        } else {
          alert(result.message || "게시글 수정에 실패했어요.")
          submitPostBtn.disabled = false
          submitPostBtn.textContent = "수정"
        }
      } catch (error) {
        alert("게시글 수정 중 오류가 발생했어요.")
        submitPostBtn.disabled = false
        submitPostBtn.textContent = "수정"
      }
    })
  } catch (error) {
    alert("게시글을 불러오는 중 오류가 발생했어요.")
    location.href = "/lostItem"
  }
}

async function getUserData() {
  try {
    const response = await fetch("/api/getUserData")
    const result = await response.json()
    if (result.success) {
      return result.data
    }
    return null
  } catch (error) {
    return null
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
