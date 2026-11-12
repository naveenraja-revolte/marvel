const baseUrl = 'https://akabab.github.io/superhero-api/api';
let allHeroes = [];

async function fetchAllHeroes() {
    try {
        const res = await fetch(`${baseUrl}/all.json`);
        allHeroes = await res.json();
        displayAllHeroes();
    } catch (err) {
        console.log("Error Loading the Heroes");
        alert("Cannot display hero");
    }
}

fetchAllHeroes();

function debounce(func,delay){
let timeout;
return function(...args){
    clearTimeout(timeout);
    timeout=setTimeout(()=> func.apply(this,args),delay);
};

}

function displayAllHeroes() {
        const allCardsContainer = document.querySelector(".get-all-cards");
        if (!allCardsContainer) {
            console.error("Container not found!");
            return;
        }
        allCardsContainer.innerHTML = "";
        allHeroes.forEach(hero => {
            const card = document.createElement("div");
            card.classList.add("all-card");
            card.innerHTML = `
        <div class="card">
            <h2>${hero.name}</h2>
            <img src="${hero.images.lg}" alt="${hero.name}">
            <h3>Powerstats</h3>
            <pre>Intelligence: ${hero.powerstats.intelligence}
Strength: ${hero.powerstats.strength}
Speed: ${hero.powerstats.speed}
Durability: ${hero.powerstats.durability}
Power: ${hero.powerstats.power}
Combat: ${hero.powerstats.combat}</pre>
            <h3>Biography</h3>
            <p>Full Name: ${hero.biography.fullName}</p>
            <p>Publisher: ${hero.biography.publisher}</p>
            <button class="appearanceBtn">Appearance</button>
            <button class="workBtn">Work</button>
        </div>
    `;
            allCardsContainer.appendChild(card);
        });
    }

let selectedHero = null; 
function showDetail(type) {
    const displayCard = document.getElementById("displayCard");
    const detailCard = document.getElementById("appearanceCard");

    displayCard.style.display = "none";
    detailCard.style.display = "flex";

    if (type === "appearance") {
        detailCard.innerHTML = `
            <div class="card">
                <button id="backBtn">Back</button>
                <h2>${selectedHero.name}</h2>
                <h3>Appearance</h3>
                <img src="${selectedHero.images.lg}" alt="${selectedHero.name}">
                <p>Gender: ${selectedHero.appearance.gender}</p>
                <p>Race: ${selectedHero.appearance.race}</p>
                <p>Height: ${selectedHero.appearance.height.join(", ")}</p>
                <p>Weight: ${selectedHero.appearance.weight.join(", ")}</p>
                <p>Eye Color: ${selectedHero.appearance.eyeColor}</p>
                <p>Hair Color: ${selectedHero.appearance.hairColor}</p>
            </div>
        `;
    } else {
        detailCard.innerHTML = `
            <div class="card">
                <button id="backBtn">Back</button>
                <h2>${selectedHero.name}</h2>
                <h3>Work</h3>
                <img src="${selectedHero.images.lg}" alt="${selectedHero.name}">
                <p>Occupation: ${selectedHero.work.occupation}</p>
                <p>Base: ${selectedHero.work.base}</p>
            </div>
        `;
    }
    const innerCard = detailCard.querySelector(".card");
innerCard.classList.add("open-animation");



    document.getElementById("backBtn").addEventListener("click", () => {
        detailCard.style.display = "none";
        displayCard.style.display = "flex";
    });
}

function searchHeroByName(searchValue) {
    const displayCard = document.getElementById("displayCard");
    const detailCard = document.getElementById("appearanceCard");
    detailCard.style.display = "none";

    if (!searchValue) {
        displayCard.innerHTML = `<p>Type a hero's name...</p>`;
        return;
    }

    const matchedHeroes = allHeroes.filter(hero =>
        hero.name.toLowerCase().startsWith(searchValue.toLowerCase())
    );

    if (matchedHeroes.length === 0) {
        displayCard.innerHTML = `<p>No heroes found!</p>`;
        return;
    }

    displayCard.style.display = "flex";
    displayCard.innerHTML = ""; 

    matchedHeroes.forEach(hero => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <h2>${hero.name}</h2>
            <img src="${hero.images.lg}" alt="${hero.name}">
            <h3>Powerstats</h3>
            <pre>Intelligence: ${hero.powerstats.intelligence}
Strength: ${hero.powerstats.strength}
Speed: ${hero.powerstats.speed}
Durability: ${hero.powerstats.durability}
Power: ${hero.powerstats.power}
Combat: ${hero.powerstats.combat}</pre>
            <h3>Biography</h3>
            <p>Full Name: ${hero.biography.fullName}</p>
            <p>Publisher: ${hero.biography.publisher}</p>
            <button class="appearanceBtn">Appearance</button>
            <button class="workBtn">Work</button>
        `;
        card.classList.add("search-animate");
        
displayCard.appendChild(card);

    });
}




const searchBox = document.getElementById("searchBox");
const debouncedSearch = debounce((value) => {
    searchHeroByName(value);
}, 500);

searchBox.addEventListener("keyup", (e) => {
    debouncedSearch(e.target.value);
});


document.addEventListener("click", (e) => {
    if (e.target.classList.contains("appearanceBtn")) {
        const name = e.target.parentElement.querySelector("h2").textContent;
        selectedHero = allHeroes.find(h => h.name === name);
        showDetail("appearance");
    }

    if (e.target.classList.contains("workBtn")) {
        const name = e.target.parentElement.querySelector("h2").textContent;
        selectedHero = allHeroes.find(h => h.name === name);
        showDetail("work");
    }
});

document.getElementById("searchBtn").addEventListener("click", () => {
    searchHeroByName(searchBox.value);
});
