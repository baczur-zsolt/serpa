import { API_URL } from './config.js';   


    
    
    document.addEventListener("DOMContentLoaded", function () {
        fetch(`${API_URL}cards`)
            .then(response => response.json())
            .then(data => {
                const cardContainer = document.getElementById("card-container");
                cardContainer.innerHTML = ""; // Töröljük a korábbi kártyákat
    
                // Adjunk hozzá egy grid konténert
                const cardsContainer = document.createElement("div");
                cardsContainer.classList.add("grid", "grid-cols-1", "gap-8", "p-10", "lg:grid-cols-2", "xl:grid-cols-4");
                cardContainer.appendChild(cardsContainer);
    
                data.forEach(card => {
                    const cardElement = document.createElement("div");
                    cardElement.classList.add("card");
    
                    cardElement.innerHTML = `
                        <div class="flex flex-col shadow p-4 bg-white rounded-md h-full">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h6 class="text-xs font-medium leading-none tracking-wider text-gray-500 uppercase">
                                        ${card.name}
                                    </h6>
                                    <span class="text-xl font-semibold">${card.value}</span>
                                    
                                </div>
                                <div>
                                    <span>${card.icon}</span>
                                </div>
                            </div>
    
                            <div class="mt-4">
                                <a href="${card.URL}" class="w-3/4 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-800 flex items-center gap-2 justify-center">
                                    <span>${card.button}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3">
                                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    `;
    
                    // Add hozzá a kártyát a konténerhez
                    cardsContainer.appendChild(cardElement);
                });
            })
            .catch(error => console.error("Hiba a kártyák betöltésekor: ", error));
    });
    
    
