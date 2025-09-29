import { UsersData } from "./timedatelocation";
import { sub } from "date-fns";

const user = await UsersData.init();
console.log(user)

class loadPage {
    constructor() {
        this.time = document.getElementById("time");
        this.date = document.getElementById("date");
        this.day = document.getElementById("day");
        this.location = document.getElementById("location");

        this.#loadTimestamp();
        this.#makeCards();

    }

    #loadTimestamp() {
        this.time.innerText = `${user.time} ${user.timezone}`;
        this.date.innerText = user.date;
        this.day.innerText = user.day;
        this.location.innerText = user.location;
    }

    #makeCards() {
        const cards = document.getElementById("cards-section");
        for (let i = 0; i < 7; i++) {
            const placeholder = document.createElement("div");
            placeholder.id = `c${i}`;
            placeholder.className = "card";

            const title = document.createElement("p");
            title.className = "card-title";
            placeholder.appendChild(title);

            const temp = document.createElement("p");
            temp.className = "card-temp";
            placeholder.appendChild(temp);

            const img = document.createElement("img");
            img.className = "card-img";
            placeholder.appendChild(img);;

            cards.appendChild(placeholder);
        }
    }

    #makeMainDisplay() {
        // COMPLETE WHEN YOU HAVE ALL DATA
    }

    /*static async loadCity(cityName) {
        try {
            await this.#loadHistory(cityName)
        } catch(err) {
            console.log(err);
        }
    }

    static async #loadHistory(city) {
        try {
            for (let i = 0; i < 2; i++) {
                const dt = sub(new Date(Date.now()), day, i + 1);
                let data = await fetch(`https://api.weatherapi.com/v1/history.json?key=61b2b1c062454b8196c74023252809&q=${city}&dt=${dt}`);
                data = await data.json();
                let card = this.#findEmptyCard();
                console.log(card.id);
            }
        } catch (err) {
            console.log(err);
        }
        
    }

    static #findEmptyCard() {
        const cards = document.querySelectorAll("card");
        cards.forEach( card => {
            if (card.innerHTML == "") {
                return card;
            }
        })
    }*/
}

class Search {
    constructor() {
        this.searchBar = document.getElementById("search");
        this.btn = document.getElementById("search-btn");

        this.#dynamicLocationSearch();
        this.#handleBtnClick();
    }

    async #dynamicLocationSearch() {
        this.searchBar.addEventListener("input", async (event) => {
            try {
                let suggestions = await fetch(`https://api.weatherapi.com/v1/search.json?key=61b2b1c062454b8196c74023252809&q=${event.target.value}`);
                suggestions = await suggestions.json();
                console.log(suggestions);
                this.#loadSuggestions(suggestions);
            } catch(err) {
                console.log(err);
            }
        })
    }

    #loadSuggestions(suggestions) {
        const suggestionsDiv = document.getElementById("suggestions");
        suggestionsDiv.innerHTML = "";
        for (let suggestion of suggestions) {

            const placeholder = document.createElement("div");
            placeholder.className = "suggestion";

            const cityName = document.createElement("p");
            cityName.className = "city-name";
            cityName.innerText = `${suggestion.name}, ${suggestion.country}`;
            placeholder.appendChild(cityName);
            
            suggestionsDiv.appendChild(placeholder);

            placeholder.addEventListener("click", () => {
                this.searchBar.value = suggestion.name;
            })

        }
    }

    #handleBtnClick() {
        this.btn.addEventListener("click", () => {
            if (!this.searchBar.validity.valueMissing) {
                let city = this.searchBar.value;
                loadPage.loadCity(city);
            } else {
                this.searchBar.setCustomValidity("Name of the city is required.");
                this.searchBar.reportValidity();
            }
        });
        this.searchBar.addEventListener("input", () => {
            this.searchBar.setCustomValidity("");
            this.searchBar.reportValidity();
        })
    }

}

new loadPage();
new Search();

/*try {
    let data = await fetch("https://api.weatherapi.com/v1/forecast.json?key=61b2b1c062454b8196c74023252809&q=Belgrade");
    data = await data.json();
    console.log(data);
} catch(err) {
    console.log(err);
}*/
