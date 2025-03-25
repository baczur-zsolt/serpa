document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

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

    if (hasError) {return};

    // Ha nincs hiba, engedjük az űrlap elküldését
    e.target.submit();
});
