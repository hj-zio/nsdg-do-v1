'use strict';

const notice = {
    client: {
        SUCCESS: '정상적으로 처리했어요.',
        PAY_SUCCESS: '결제를 완료했어요.',
        REQ_ERROR: '요청을 처리할 수 없어요.',
        QUERY_ERROR: '쿼리에 문제가 발생했어요.',
        SERVER_ERROR: '서버에 문제가 발생했어요.',
        SYSTEM_CONGESTION: '서비스 처리가 지연되고 있어요. 잠시 후 다시 시도해주세요.',
        INS_IN_PROGRESS: '해당 서비스를 점검하고 있어요.',
        INVALID_ACCESS: '올바른 접근이 아니에요.',
        NOT_PERMISSION: '서비스 접근권한이 없어요.',
        INVALID_TYPE_DATA: '데이터 타입이 유효하지 않아요.',
        NOT_VALID_VALUE: '값이 올바르지 않아요.',
        URL_NOT_FOUND: '해당하는 URL을 찾을 수 없어요.',
        PAGE_NOT_FOUND: '해당하는 페이지를 찾을 수 없어요.',
        STORE_NOT_FOUND: '등록한 매장이 없어요.',
        USER_NOT_FOUND: '사용자를 찾을 수 없어요.',
        SCHOOL_NUMBER_NOT_FOUND: '학적정보를 찾을 수 없어요.',
        NOT_SCOOL_ACCOUNT: '논산대건고등학교 구글 계정이 아니에요.',
        NOT_REUSE_IDEM_KEY: '이미 사용된 멱등키에요.',
        IDEM_KEY_NOT_FOUND: '멱등키를 찾을 수 없어요.',
        NOT_MATCH_STORE_ID_IN_IDEM_KEY: '멱등키에 등록된 매장 ID가 아니에요.',
        NOT_MATCH_CUSTOMER_ID_IN_IDEM_KEY: '멱등키에 등록된 사용자 ID가 아니에요.',
        NOT_MATCH_PASSWORD: '비밀번호가 일치하지 않아요.',
        DB_LOCK_CONFLICT: '다른 요청이 해당 리소스의 락을 보유하고 있어 접근할 수 없어요.',
        DB_LOCK_NO_PERMISSION: '해당 리소스에 대한 락을 부여받지 않았어요.',
        DB_LOCK_GRANTED: '해당 리소스에 대한 락을 부여했어요.',
        DB_LOCK_REVOKED: '해당 리소스에 대한 락을 해제했어요.',
        DB_LOCK_ALREADY_GRANTED: '이미 해당 리소스에 대한 락을 보유하고 있어요.',
        DB_LOCK_NOT_FOUND: '해당 리소스에 활성화된 락이 없습니다.',
        CHARGE_NOT_FOUND: '처리 가능한 충전 신청건이 아니에요.',
        TRANSACTION_NOT_FOUND: '처리 가능한 트랜잭션이 아니에요.',
        INSUFFICIENT_BALANCE: '잔액이 부족해요.',
        AMOUNT_NOT_FOUND_ON_TRANSACTION: '트랜잭션 기반 잔액을 찾을 수 없어요.',
        PRICE_NOT_FOUND: '결제 금액을 알아내지 못했어요.',
        NOT_MATCH_ORDER: '상품 정보가 DB와 일치하지 않아요.',
        PRODUCT_NAME_NOT_FOUND: '제품명을 찾을 수 없어요.',
        PRODUCT_NOT_FOUND: '상품을 찾을 수 없어요.',
        PRODUCT_MAX_ONE: '동일 상품은 최대 1개까지 등록할 수 있어요.',
        DUPLICATE_PRODUCT_BARCODE: '해당 바코드로 등록된 상품이 이미 있어요.',
        STORE_MAX_ONE: '매장은 최대 1개까지 등록할 수 있어요.',
        PENDING_CHARGE: '이전 충전 요청이 아직 처리 중이에요.',
        CHECK_CHARGE: '송금한 계좌, 예금주명, 금액 등을 다시 확인하세요.',
        NOT_UPLOAD_PROFILE_IMAGE: '프로필 이미지를 등록할 수 없어요.',
        NOT_UPLOAD_FILE: '파일에 문제가 있어요.',
        FACE_NOT_DETECT: '얼굴이 감지되지 않았어요.',
        NOT_USE_GUEST: '게스트 계정으로 이용할 수 없는 기능이에요.'
    },    

    AUTH: {
        ROUTE_100: {
            CODE: 'ERR_AUTH_ROUTE_100',
            MESSAGE: '인증 요청을 라우터가 처리할 수 없어요.'
        },

        CTRL_100: {
            CODE: 'ERR_AUTH_CTRL_100',
            MESSAGE: '인증 요청을 컨트롤러에서 처리할 수 없어요.'
        },

        SESSION_100: {
            CODE: 'ERR_AUTH_SESSION_100',
            MESSAGE: '이전 로그인 세션을 삭제할 수 없어요.'
        },

        LOGIN_100: {
            CODE: 'ERR_AUTH_LOGIN_100',
            MESSAGE: '로그인 요청을 처리할 수 없어요.'
        },

        LOGIN_101: {
            CODE: 'ERR_AUTH_LOGIN_101',
            MESSAGE: '게스트 로그인 요청을 처리할 수 없어요.'
        },

        REGISTER_100: {
            CODE: 'ERR_AUTH_REGISTER_100',
            MESSAGE: '회원가입 요청을 처리할 수 없어요.'
        },

        LOGOUT_100: {
            CODE: 'ERR_AUTH_LOGOUT_100',
            MESSAGE: '로그아웃 요청을 처리할 수 없어요.'
        },
    },

    API: {
        REQEUST_100: {
            CODE: 'ERR_REQUEST_100',
            MESSAGE: 'API 요청을 처리할 수 없어요.'
        }
    },

    PAY: {
        REQEUST_100: {
            CODE: 'ERR_PAY_REQUEST_100',
            MESSAGE: 'PAY 요청을 처리할 수 없어요.'
        },

        REQEUST_200: {
            CODE: 'ERR_PAY_REQUEST_200',
            MESSAGE: '임베딩 요청을 처리할 수 없어요.'
        },

        REQEUST_300: {
            CODE: 'ERR_PAY_REQUEST_300',
            MESSAGE: '얼굴 등록 요청을 처리할 수 없어요.'
        },

        REQEUST_400: {
            CODE: 'ERR_PAY_REQUEST_400',
            MESSAGE: '비밀번호 비교 요청을 처리할 수 없어요.'
        },

        REQEUST_500: {
            CODE: 'ERR_PAY_REQUEST_500',
            MESSAGE: '해시화 요청을 처리할 수 없어요.'
        },

        REQEUST_600: {
            CODE: 'ERR_PAY_REQUEST_600',
            MESSAGE: '충전 요청을 처리할 수 없어요.'
        },

        REQEUST_700: {
            CODE: 'ERR_PAY_REQUEST_700',
            MESSAGE: '거래기록 요청을 처리할 수 없어요.'
        },

        REQEUST_800: {
            CODE: 'ERR_PAY_REQUEST_800',
            MESSAGE: '매장 생성 요청을 처리할 수 없어요.'
        },

        REQEUST_900: {
            CODE: 'ERR_PAY_REQUEST_900',
            MESSAGE: '매장 삭제 요청을 처리할 수 없어요.'
        },

        REQEUST_1000: {
            CODE: 'ERR_PAY_REQUEST_1000',
            MESSAGE: '상품 생성 요청을 처리할 수 없어요.'
        },

        REQEUST_1100: {
            CODE: 'ERR_PAY_REQUEST_1100',
            MESSAGE: '상품 변경 요청을 처리할 수 없어요.'
        },

        REQEUST_1200: {
            CODE: 'ERR_PAY_REQUEST_1200',
            MESSAGE: '상품 삭제 요청을 처리할 수 없어요.'
        },

        REQEUST_1300: {
            CODE: 'ERR_PAY_REQUEST_1300',
            MESSAGE: '상품 조회 요청을 처리할 수 없어요.'
        },

        REQEUST_1400: {
            CODE: 'ERR_PAY_REQUEST_1400',
            MESSAGE: '충전 리스트 요청을 처리할 수 없어요.'
        },

        REQEUST_1500: {
            CODE: 'ERR_PAY_REQUEST_1500',
            MESSAGE: '충전 승인 요청을 처리할 수 없어요.'
        },

        REQEUST_1600: {
            CODE: 'ERR_PAY_REQUEST_1600',
            MESSAGE: '충전 거부 요청을 처리할 수 없어요.'
        },

        REQEUST_1700: {
            CODE: 'ERR_PAY_REQUEST_1700',
            MESSAGE: '상품 총액을 계산할 수 없어요.'
        },

        REQEUST_1800: {
            CODE: 'ERR_PAY_REQUEST_1800',
            MESSAGE: '매장 조회 요청을 처리할 수 없어요.'
        },

        REQEUST_1900: {
            CODE: 'ERR_PAY_REQUEST_1900',
            MESSAGE: '매장 비밀번호 등록 요청을 처리할 수 없어요.'
        },

        REQEUST_2000: {
            CODE: 'ERR_PAY_REQUEST_2000',
            MESSAGE: '상품명 검색 요청을 처리할 수 없어요.'
        },

        REQEUST_2100: {
            CODE: 'ERR_PAY_REQUEST_2100',
            MESSAGE: '상품 검색 요청을 처리할 수 없어요.'
        },

        REQEUST_2200: {
            CODE: 'ERR_PAY_REQUEST_2200',
            MESSAGE: '결제 승인 요청을 처리할 수 없어요.'
        },
        
        REQEUST_2300: {
            CODE: 'ERR_PAY_REQUEST_2300',
            MESSAGE: '결제 환불 요청을 처리할 수 없어요.'
        },
        
        REQEUST_2400: {
            CODE: 'ERR_PAY_REQUEST_2400',
            MESSAGE: '잔액 조회 요청을 처리할 수 없어요.'
        },

        REQEUST_2500: {
            CODE: 'ERR_PAY_REQUEST_2500',
            MESSAGE: '멱등키 생성 요청을 처리할 수 없어요.'
        },

        REQEUST_2600: {
            CODE: 'ERR_PAY_REQUEST_2600',
            MESSAGE: '멱등키 상태 변경 요청을 처리할 수 없어요.'
        },

        REQEUST_2700: {
            CODE: 'ERR_PAY_REQUEST_2700',
            MESSAGE: '거래내역 조회 요청을 처리할 수 없어요.'
        },
    },

    USER: {
        GET_100: {
            CODE: 'ERR_USER_GET_100',
            MESSAGE: '사용자 정보를 불러올 수 없어요.'
        },

        GET_200: {
            CODE: 'ERR_USER_GET_200',
            MESSAGE: '사용자 접근권한을 불러올 수 없어요.'
        }
    },

    IMAGE: {
        GET_100: {
            CODE: 'ERR_IMAGE_GET_100',
            MESSAGE: '이미지를 불러올 수 없어요.'
        },

        UPLOAD_100: {
            CODE: 'ERR_IMAGE_UPLOAD_100',
            MESSAGE: '이미지를 업로드할 수 없어요.'
        }
    },

    INFO: {
        GET_100: {
            CODE: 'ERR_INFO_GET_100',
            MESSAGE: '학사일정을 불러올 수 없어요.'
        }
    },

    TIMETABLE: {
        GET_100: {
            CODE: 'ERR_TIMETABLE_GET_100',
            MESSAGE: '시간표를 불러올 수 없어요.'
        },
        
        GET_101: {
            CODE: 'ERR_TIMETABLE_GET_101',
            MESSAGE: '개인별 선택과목을 불러올 수 없어요.'
        },

        CONVERT_100: {
            CODE: 'ERR_TIMETABLE_CONVERT_100',
            MESSAGE: '개인별 선택과목를 변환할 수 없어요.'
        }
    },

    PAGE: {
        RENDER_100: {
            CODE: 'ERR_PAGE_RENDER_100',
            MESSAGE: '페이지를 렌더링 할 수 없어요.'
        }
    },

    QUERY: {
        REQEUST_100: {
            CODE: 'ERR_QUERY_REQUEST_100',
            MESSAGE: '쿼리 요청을 처리할 수 없어요.'
        },

        REQEUST_200: {
            CODE: 'ERR_QUERY_REQUEST_200',
            MESSAGE: '락 획득 요청을 처리할 수 없어요.'
        },

        REQEUST_300: {
            CODE: 'ERR_QUERY_REQUEST_300',
            MESSAGE: '락 해제 요청을 처리할 수 없어요.'
        }
    },

    TRANSACTION: {
        INVAILD_PASSWORD: '결제 비밀번호 검증 실패',
        INVAILD_IDEM_KEY: '결제 멱등성 검증 실패'
    }
}

module.exports = {
    notice
}