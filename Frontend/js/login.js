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

    // Egyszerű kliensoldali validáció
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
        const response = await fetch('/vizsgamunkaMVC/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ email, password })
        });

        const result = await response.json();

        if (response.status === 202) {
            // Sikeres bejelentkezés -> átirányítás
            window.location.href = 'dashboard';
        } else {
            generalErrorElement.textContent = 'Hibás bejelentkezési adatok';
        }
    } catch (error) {
        console.error('Hiba:', error);
        generalErrorElement.textContent = 'Hálózati hiba történt. Próbáld újra később!';
    }
});


//Teszt komment
//Merge tesztelés

//Frontend Branch tesztelés

//Új változtatás frontenden