// api.js
export function apiRequest(url, method = "GET", data = null) {
    // Ha van adat, akkor JSON-ként küldjük el
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: data ? JSON.stringify(data) : null
    };

    // Fetch kérés küldése
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // Válasz JSON-ként
        });
}