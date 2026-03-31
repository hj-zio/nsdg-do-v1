'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await getAllProductList();
});

async function query() {
    await queryProductInfo();
}

async function getProductName() {
    const barcode = document.getElementById('barcode_input').value;
    const req = await fetchJSON(`/pay/getProductName?barcode=${barcode}`);
    
    if (req.success) {
        document.getElementById('name_input').value = req.data;
        return;
    }
}

function autoProductName() {
    const input = document.getElementById('barcode_input');
    if (!input) return;

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            getProductName();
        }
    });
}

function createProductModal() {
    document.getElementById('modal_title').textContent = '상품 추가';

    const modalContent = `
        <div class="flex flex-col space-y-5">
            <div class="flex flex-col space-y-2">
                <div class="pretendard-500 text-[16px] sm:text-[18px] text-gray-600">
                    <span class="text-[14px] sm:text-[16px]">바코드</span>
                    <span class="text-[12px] sm:text-[14px] text-red-500">*</span>
                </div>
                <input
                    id='barcode_input' class="p-2 rounded-md outline outline-[2px] outline-gray-200 hover:outline-blue-500 transition-all ease-in-out duration-100"
                    placeholder="바코드를 입력해주세요." maxlength=20>
            </div>
            <div class="flex flex-col space-y-2">
                <div class="pretendard-500 text-[16px] sm:text-[18px] text-gray-600">
                    <span class="text-[14px] sm:text-[16px]">상품명</span>
                    <span class="text-[12px] sm:text-[14px] text-red-500">*</span>
                </div>
                <input
                    id='name_input' class="p-2 rounded-md outline outline-[2px] outline-gray-200 hover:outline-blue-500 transition-all ease-in-out duration-100"
                    placeholder="상품명을 입력해주세요." maxlength=50>
            </div>
            <div class="flex flex-col space-y-1">
                <div class="pretendard-500 text-[16px] sm:text-[18px] text-gray-600">
                    <span class="text-[14px] sm:text-[16px]">가격</span>
                    <span class="text-[12px] sm:text-[14px] text-red-500">*</span>
                </div>
                <input
                    id='price_input' class="p-2 rounded-md outline outline-[2px] outline-gray-200 hover:outline-blue-500 transition-all ease-in-out duration-100"
                    placeholder="가격을 입력해주세요." maxlength=10>
            </div>
            <div class="flex flex-row space-x-2">
                <button onclick="closeModal()" class="ml-auto px-4 py-2 bg-gray-100 text-gray-500 rounded-lg block hover:bg-gray-200 active:scale-95 transition-all ease-in-out duration-100">
                    닫기
                </button>
                <button onclick="createProduct()" class="ml-auto px-4 py-2 bg-blue-100 text-blue-500 rounded-lg block hover:bg-blue-200 active:scale-95 transition-all ease-in-out duration-100">
                    추가
                </button>
            </div>
        </div>
    `;
    document.getElementById('modal_content').innerHTML = modalContent;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('barcode_input').focus();

    autoProductName();
}

async function changeProductModal() {
    const get_checked_values = getCheckedValues();
    if (get_checked_values.length !== 1) {
        alert('변경할 상품을 1개 선택해주세요.');
        return;
    }

    const query_product_info = await fetchJSON(`/pay/queryProductInfo?queryContent=${get_checked_values[0]}`);
    if (!query_product_info.success) {
        alert(query_product_info.message);
        return;
    }

    document.getElementById('modal_title').textContent = '상품 변경';

    const modalContent = `
        <div class="flex flex-col space-y-5">
            <div class="flex flex-col space-y-2">
                <div class="pretendard-500 text-[16px] sm:text-[18px] text-gray-600">
                    <span class="text-[14px] sm:text-[16px]">바코드</span>
                    <span class="text-[12px] sm:text-[14px] text-red-500">*</span>
                </div>
                <input
                    id='barcode_input' class="p-2 rounded-md outline outline-[2px] outline-gray-200 hover:outline-blue-500 transition-all ease-in-out duration-100"
                    placeholder="바코드를 입력해주세요." value='${query_product_info.data[0].barcode}' maxlength=20>
            </div>
            <div class="flex flex-col space-y-2">
                <div class="pretendard-500 text-[16px] sm:text-[18px] text-gray-600">
                    <span class="text-[14px] sm:text-[16px]">상품명</span>
                    <span class="text-[12px] sm:text-[14px] text-red-500">*</span>
                </div>
                <input
                    id='name_input' class="p-2 rounded-md outline outline-[2px] outline-gray-200 hover:outline-blue-500 transition-all ease-in-out duration-100"
                    placeholder="상품명을 입력해주세요." value='${query_product_info.data[0].name}' maxlength=50>
            </div>
            <div class="flex flex-col space-y-1">
                <div class="pretendard-500 text-[16px] sm:text-[18px] text-gray-600">
                    <span class="text-[14px] sm:text-[16px]">가격</span>
                    <span class="text-[12px] sm:text-[14px] text-red-500">*</span>
                </div>
                <input
                    id='price_input' class="p-2 rounded-md outline outline-[2px] outline-gray-200 hover:outline-blue-500 transition-all ease-in-out duration-100"
                    placeholder="가격을 입력해주세요." value='${query_product_info.data[0].price}' maxlength=10>
            </div>
            <div class="flex flex-row space-x-2">
                <button onclick="closeModal()" class="ml-auto px-4 py-2 bg-gray-100 text-gray-500 rounded-lg block hover:bg-gray-200 active:scale-95 transition-all ease-in-out duration-100">
                    닫기
                </button>
                <button onclick="changeProduct()" class="ml-auto px-4 py-2 bg-amber-100 text-amber-500 rounded-lg block hover:bg-amber-200 active:scale-95 transition-all ease-in-out duration-100">
                    변경
                </button>
            </div>
        </div>
    `;
    document.getElementById('modal_content').innerHTML = modalContent;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('barcode_input').focus();
}

async function deleteProductModal() {
    const get_checked_values = getCheckedValues();
    if (get_checked_values.length === 0) {
        alert('삭제할 상품을 선택해주세요.');
        return;
    }

    document.getElementById('modal_title').textContent = '상품 삭제';

    const modalContent = `
        <div class="flex flex-col space-y-5">
            <div class='flex flex-col space-y-1'>
                상품을 정말로 삭제할까요?
                <span class='text-[14px] text-[16px] text-red-500 pretendard-600'>삭제 후에는 되돌릴 수 없어요.</span>
            </div>
            <div class="flex flex-row space-x-2">
                <button onclick="closeModal()" class="ml-auto px-4 py-2 bg-gray-100 text-gray-500 rounded-lg block hover:bg-gray-200 active:scale-95 transition-all ease-in-out duration-100">
                    닫기
                </button>
                <button onclick="deleteProduct()" class="ml-auto px-4 py-2 bg-red-100 text-red-500 rounded-lg block hover:bg-red-200 active:scale-95 transition-all ease-in-out duration-100">
                    삭제
                </button>
            </div>
        </div>
    `;
    document.getElementById('modal_content').innerHTML = modalContent;
    document.getElementById('modal').classList.remove('hidden');
}

async function createProduct() {
    try {
        const product_name = document.getElementById('name_input').value;
        const product_barcode = document.getElementById('barcode_input').value;
        const product_price = document.getElementById('price_input').value;

        if (product_barcode === '' || product_name === '' || product_price === '' || product_barcode.length > 20 || product_name.length > 50 || !/^\d+$/.test(product_price)) {
            alert('데이터 타입이 유효하지 않아요.');
            return;
        }

        const create_product = await fetchJSON(`/store/create-product?name=${product_name}&barcode=${product_barcode}&price=${product_price}`);
        if (!create_product.success) {
            alert(create_product.message);
            return;
        }

        await getAllProductList();
        createProductModal();
        return;
    } catch (e) {
        console.log(e);
    }
}

async function changeProduct() {
    try {
        const get_checked_values = getCheckedValues();
        if (get_checked_values.length !== 1) {
            alert('변경할 상품을 1개 선택해주세요.');
            return;
        }

        const product_name = document.getElementById('name_input').value;
        const product_barcode = document.getElementById('barcode_input').value;
        const product_price = document.getElementById('price_input').value;

        if (product_barcode === '' || product_name === '' || product_price === '' || product_barcode.length > 20 || product_name.length > 50 || !/^\d+$/.test(product_price)) {
            alert('데이터 타입이 유효하지 않아요.');
            return;
        }

        const change_product = await fetchJSON(`/store/change-product?name=${product_name}&originBarcode=${get_checked_values[0]}&barcode=${product_barcode}&price=${product_price}`);
        if (!change_product.success) {
            alert(change_product.message);
            return;
        }

        alert(change_product.message);
        closeModal();
        await getAllProductList();
        return;
    } catch (e) {
    }
}

async function deleteProduct() {
    try {
        const get_checked_values = getCheckedValues();
        if (get_checked_values.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }

        const deleteProduct = await fetch("/store/delete-product", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                barcodeArray: get_checked_values,
            }),
        })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error));

        alert(deleteProduct.message);
        closeModal();
        await getAllProductList();
        return;
    } catch (e) {
    }
}

async function getAllProductList() {
    try {
        const get_all_product_list = await fetchJSON(`/pay/getAllProductList`);

        if (!get_all_product_list.success) {
            alert(get_all_product_list.message);
            return;
        }

        const data = get_all_product_list.data;

        if (data.length === 0) {
            document.getElementById('product_table').innerHTML = '';
            document.getElementById('status').innerHTML = '등록된 상품이 없습니다.';
            return;
        }
        
        document.getElementById('status').innerHTML = '';
        const tableHTML = `
            <table class="min-w-full table-fixed">
                <thead class="bg-gray-100 border-t border-gray-300">
                    <tr>
                        <th class="w-2/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">선택</th>
                        <th class="w-3/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">바코드</th>
                        <th class="w-4/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">상품명</th>
                        <th class="w-4/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">가격</th>
                        <th class="hidden md:table-cell w-3/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">최근 수정일</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        data.map((item, index) => {
                            const isLast = index === data.length - 1;
                            const rowBorder = isLast ? "border-y" : "border-t";
                            const updatedAt = new Date(item.updated_at).toISOString().split('T')[0];
                            return `
                                <tr class="${rowBorder} border-gray-300">
                                    <td class="w-2/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        <input type="checkbox" class='checkbox' value="${item.barcode}" />
                                    </td>
                                    <td class="w-3/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        ${item.barcode}
                                    </td>
                                    <td class="w-4/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        ${item.name}
                                    </td>
                                    <td class="w-4/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        ${String(item.price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
                                    </td>
                                    <td class="hidden md:table-cell w-3/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left ${rowBorder} border-gray-300">
                                        ${updatedAt}
                                    </td>
                                </tr>
                            `;
                        }).join('')
                    }
                </tbody>
            </table>
        `;

        document.getElementById('product_table').innerHTML = tableHTML;
    } catch (e) {
    }
}

function getCheckedValues() {
    return Array.from(document.querySelectorAll('input.checkbox:checked'))
        .map(checkbox => checkbox.value);
}

async function queryProductInfo() {
    try {
        const queryContent = document.getElementById('product_input').value;
        if (queryContent === '') {
            await getAllProductList();
            return;
        }
        const query_product_info = await fetchJSON(`/pay/queryProductInfo?queryContent=${queryContent}`);

        if (!query_product_info.success) {
            alert(query_product_info.message);
            return;
        }

        const data = query_product_info.data;
        if (data.length === 0) {
            document.getElementById('product_table').innerHTML = '';
            document.getElementById('status').innerHTML = '등록된 상품이 없습니다.';
            return;
        }

        document.getElementById('status').innerHTML = '';
        const tableHTML = `
            <table class="min-w-full table-fixed">
                <thead class="bg-gray-100 border-t border-gray-300">
                    <tr>
                        <th class="w-2/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">선택</th>
                        <th class="w-3/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">바코드</th>
                        <th class="w-4/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">상품명</th>
                        <th class="w-4/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">가격</th>
                        <th class="hidden md:table-cell w-3/16 text-[12px] sm:text-[14px] pretendard-600 text-gray-600 px-4 py-3 text-left">최근 수정일</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        data.map((item, index) => {
                            const isLast = index === data.length - 1;
                            const rowBorder = isLast ? "border-y" : "border-t";
                            const updatedAt = new Date(item.updated_at).toISOString().split('T')[0];
                            return `
                                <tr class="${rowBorder} border-gray-300">
                                    <td class="w-2/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        <input type="checkbox" class='checkbox' value="${item.barcode}" />
                                    </td>
                                    <td class="w-3/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        ${item.barcode}
                                    </td>
                                    <td class="w-4/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        ${item.name}
                                    </td>
                                    <td class="w-4/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left">
                                        ${String(item.price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
                                    </td>
                                    <td class="hidden md:table-cell w-3/16 text-[12px] sm:text-[14px] pretendard-500 text-gray-600 px-4 py-3 text-left ${rowBorder} border-gray-300">
                                        ${updatedAt}
                                    </td>
                                </tr>
                            `;
                        }).join('')
                    }
                </tbody>
            </table>
        `;

        document.getElementById('product_table').innerHTML = tableHTML;
    } catch (e) {
    }
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("hidden");
}

async function fetchJSON(url) {
    try {
        const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, message: e.message };
    }
}