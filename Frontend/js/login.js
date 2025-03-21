/****************************************************************************************************
 *                                   Bejelentkezés gomb validációja                                 *
 ****************************************************************************************************/

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const emailErrorElement = document.getElementById('email-error');
    const passwordErrorElement = document.getElementById('password-error');
    const generalErrorElement = document.getElementById('general-error');

    

    // Hibaüzenetek törlése
    emailErrorElement.innerHTML = '';
    passwordErrorElement.innerHTML = '';
    generalErrorElement.innerHTML = '';

    let hasError = false;

    // Egyszerű kliens oldali validáció
    if (!email) {
        emailErrorElement.textContent = 'Az email mező kitöltése kötelező!';
        hasError = true;
    }

    if (!password) {
        passwordErrorElement.textContent = 'A jelszó mező kitöltése kötelező!';
        hasError = true;
    }

    if (hasError) return; // Ne küldje el a kérést, ha van hiba

    try {
        const response = await fetch('../../backend/loginAPI.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (result.success) {
            // Sikeres bejelentkezés -> átirányítás
            window.location.href = '../pages/dashboard.html';
        } else {
            // Általános szerveroldali hiba megjelenítése
            generalErrorElement.textContent = result.error || 'Hiba történt a bejelentkezés során.';
        }
    } catch (error) {
        console.error('Hiba:', error);
        generalErrorElement.textContent = 'Hálózati hiba történt. Próbáld újra később!';
    }
});




