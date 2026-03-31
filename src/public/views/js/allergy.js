function toggleAllergy(el) {
    el.classList.toggle('bg-blue-100');
    el.classList.toggle('text-blue-700');
    el.classList.toggle('border-blue-300');
}

function getSelectedAllergyCodes() {
    const selected = [];
    document.querySelectorAll('#allergy-select span.bg-blue-100').forEach(el => {
        selected.push(el.getAttribute('data-value'));
    });
    return selected.join(',');
}

async function submitAllergy() {
    const selectedCodes = [];
    document.querySelectorAll('#allergy-select span.bg-blue-100').forEach(el => {
        selectedCodes.push(el.getAttribute('data-value'));
    });

    const result = selectedCodes.join(',');

    const submitAllergy = await fetch("/api/submitAllergy", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            data: result,
        }),
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error))

    if (!submitAllergy.success) {
        alert(submitAllergy.message);
        return;
    }

    alert(submitAllergy.message);
    location.href = '/meal';
}