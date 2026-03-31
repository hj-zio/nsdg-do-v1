'use strict';

async function getUserData() {
    try {
        const data = await fetch('/api/getUserData', {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((data) => data)
            .catch((error) => console.error(error));

        return data;
    } catch (e) {
        return;
    }
}

async function getServerStatus() {
    try {
        const data = await fetch('/api/getServerStatus', {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((data) => data)
            .catch((error) => console.error(error));

        return data;
    } catch (e) {
        return;
    }
}

function createToast(type, message) {
    try {
        const color = {
            'success': '#4054d6',
            'error': '#e74c3c'
        };

        Toastify({
            text: message,
            duration: 4000,
            newWindow: true,
            close: false,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: color[type],
                borderRadius: '10px',
            },
        }).showToast();

    } catch (e) {
        return;
    }
}