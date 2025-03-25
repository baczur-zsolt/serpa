const icons = {
    sale: `<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>`,
    product: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11Zm200-528 77-44-237-137-78 45 238 136Zm-160 93 78-45-237-137-78 45 237 137Z"/></svg>`,
    partner: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"/></svg>`,
    staff: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>`,
    profit: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z"/></svg>`,
    payouts: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M200-280v-280h80v280h-80Zm240 0v-280h80v280h-80ZM80-120v-80h800v80H80Zm600-160v-280h80v280h-80ZM80-640v-80l400-200 400 200v80H80Zm178-80h444-444Zm0 0h444L480-830 258-720Z"/></svg>`
    }
    document.addEventListener("DOMContentLoaded", function () {
        fetch('/vizsgamunkaMVC/cards')
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
                        <div class="flex flex-col shadow p-4 bg-white rounded-md h-full" x-show="canViewCard('Pénzügyek')">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h6 class="text-xs font-medium leading-none tracking-wider text-gray-500 uppercase">
                                        ${card.name}
                                    </h6>
                                    <span class="text-xl font-semibold">${card.value}</span>
                                    <span class="inline-block px-2 py-px ml-2 text-xs text-green-500 bg-green-100 rounded-md">
                                        +3.32%
                                    </span>
                                </div>
                                <div>
                                    <span>
                                        ${card.icon}
                                    </span>
                                </div>
                            </div>
    
                            <div class="mt-4">
                                <button class="w-3/4 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-800 flex items-center gap-2 justify-center">
                                    <span>${card.button}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3">
                                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `;
    
                    // Add hozzá a kártyát a konténerhez
                    cardsContainer.appendChild(cardElement);
                });
            })
            .catch(error => console.error("Hiba a kártyák betöltésekor: ", error));
    });
    
