document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();  // Megakadályozza az alapértelmezett form küldést

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const emailErrorElement = document.getElementById('email-error');
    const passwordErrorElement = document.getElementById('password-error');
    const generalErrorElement = document.getElementById('general-error');

    // Hibaüzenetek törlése
    emailErrorElement.textContent = '';
    passwordErrorElement.textContent = '';
    generalErrorElement.textContent = '';

    let hasError = false;

    if (!email) {
        emailErrorElement.textContent = 'Az email mező kitöltése kötelező!';
        hasError = true;
    }

    if (!password) {
        passwordErrorElement.textContent = 'A jelszó mező kitöltése kötelező!';
        hasError = true;
    }

    if (hasError) {
        return;  // Ha van hiba, ne küldjük el az űrlapot
    }

    // Ha nincs hiba, küldjük el a bejelentkezési adatokat fetch-el
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    fetch('/vizsgamunkaMVC/login', {
        method: 'POST',
        body: formData,  // A form adatokat küldjük
    })
    .then(response => response.json())  // A válasz JSON formátumban
    .then(data => {
        if (data.response === 'error') {
            // Ha a válasz hibát jelez
            generalErrorElement.textContent = 'Nem megfelelő email cím vagy jelszó';
        } else if (data.response === 'success') {
            // Ha a bejelentkezés sikeres
            window.location.href = '/vizsgamunkaMVC/dashboard';  // Ide irányítsuk át a felhasználót
        }
    })
    .catch(error => {
        console.error('Hiba történt:', error);
        generalErrorElement.textContent = 'Hiba történt a bejelentkezés során.';
    });
});
