const db = require("../config/db.js")
const { keys } = require("../config/keys.js")
const { notice } = require("../config/notice.js")

const url = require("url")
const axios = require("axios")

/**
 * DB에 저장된 사진 불러오는 함수
 * @param {string} token
 * @param {object} trace
 * @returns
 */
async function getImage(token, trace) {
  try {
    const query = await db.querySQL("SELECT * FROM IMAGEDB WHERE token = ?;", [token], trace)
    if (!query) {
      return {
        success: false,
        data: null,
        message: notice.client.QUERY_ERROR,
        error: null,
      }
    }

    if (query[0].length === 0) {
      return {
        success: false,
        data: null,
        message: notice.client.URL_NOT_FOUND,
        error: null,
      }
    }

    return {
      success: true,
      data: query[0].image,
      message: notice.client.SUCCESS,
      error: null,
    }
  } catch (e) {
    await db.recordErrorLog(notice.IMAGE.GET_100.CODE, e.message, e.stack, trace)
    return {
      success: false,
      data: null,
      message: notice.client.SERVER_ERROR,
      error: null,
    }
  }
}

async function uploadImage(imageURL, trace) {
  try {
    const parsedURL = url.parse(imageURL)
    if (!parsedURL.protocol || !parsedURL.hostname) {
      return {
        success: false,
        data: null,
        message: notice.client.URL_NOT_VALID,
        error: null,
      }
    }

    const token = generateToken()
    const response = await axios.get(imageURL, {
      responseType: "arraybuffer",
    })

    const imageBuffer = Buffer.from(response.data, "binary")
    const base64Image = imageBuffer.toString("base64")

    const query = await db.querySQL("INSERT INTO IMAGEDB (token, image) VALUES (?, ?)", [token, base64Image], trace)
    if (!query) {
      return {
        success: false,
        data: null,
        message: notice.client.QUERY_ERROR,
        error: null,
      }
    }

    return {
      success: true,
      data: token,
      message: notice.client.SUCCESS,
      error: null,
    }
  } catch (e) {
    await db.recordErrorLog(notice.IMAGE.UPLOAD_100.CODE, e.message, e.stack, trace)
    return {
      success: false,
      data: null,
      message: notice.client.SERVER_ERROR,
      error: null,
    }
  }
}

/**
 * Base64 이미지를 IMAGEDB에 저장하는 함수
 * @param {string} base64Image - Base64 인코딩된 이미지 데이터 (Data URL 또는 순수 Base64)
 * @param {object} trace - 추적 객체
 * @returns {object} - { success, data: token, message, error }
 */
async function uploadImageWithBase64(base64Image, trace) {
  try {
    if (!base64Image) {
      return {
        success: false,
        data: null,
        message: "이미지 데이터가 없습니다.",
        error: null,
      }
    }

    let pureBase64 = base64Image
    if (base64Image.includes(",")) {
      // data:image/jpeg;base64,/9j/4AAQ... 형식에서 /9j/4AAQ... 부분만 추출
      pureBase64 = base64Image.split(",")[1]
    }

    const token = generateToken()

    const query = await db.querySQL("INSERT INTO IMAGEDB (token, image) VALUES (?, ?)", [token, pureBase64], trace)
    if (!query) {
      return {
        success: false,
        data: null,
        message: notice.client.QUERY_ERROR,
        error: null,
      }
    }

    return {
      success: true,
      data: token,
      message: notice.client.SUCCESS,
      error: null,
    }
  } catch (e) {
    await db.recordErrorLog(notice.IMAGE.UPLOAD_100.CODE, e.message, e.stack, trace)
    return {
      success: false,
      data: null,
      message: notice.client.SERVER_ERROR,
      error: null,
    }
  }
}

/**
 * 임의의 토큰 생성하는 함수
 * @returns - 8 Digit Token
 */
function generateToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    token += chars[randomIndex]
  }
  return token
}

module.exports = {
  getImage,
  uploadImage,
  uploadImageWithBase64,
}
