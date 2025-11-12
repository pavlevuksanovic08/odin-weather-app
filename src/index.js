import { UsersData } from "./timedatelocation";
import { sub, format, add, differenceInCalendarDays } from "date-fns";
import { DayCard } from "./cardObject";
import lowTemp from "./images/mainDataImages/low-temperature.png";
import highTemp from "./images/mainDataImages/high-temperature.png";
import chanceOfRain from "./images/mainDataImages/chance_of_rain.png";
import chanceOfSnow from "./images/mainDataImages/chance_of_snow.png";
import humidity from "./images/mainDataImages/humidity.png";
import visibility from "./images/mainDataImages/visibility.png";
import precipitation from "./images/mainDataImages/precipitation.png";
import snow from "./images/mainDataImages/snow.png";
import wind from "./images/mainDataImages/wind.png";
import uv from "./images/mainDataImages/uv.png";
import sunrise from "./images/mainDataImages/sunrise.png";
import sunset from "./images/mainDataImages/sunset.png";
import moonrise from "./images/mainDataImages/moonrise.png";
import moonset from "./images/mainDataImages/moonset.png";
import "./layout.css";
import "./backgrounds.css";
import "./styles.css";

const user = await UsersData.init();
const storage = new DayCard();
let standard = "c";

class loadPage {
    constructor() {
        this.time = document.getElementById("time");
        this.date = document.getElementById("date");
        this.day = document.getElementById("day");
        this.location = document.getElementById("location");
        
        this.#loadTimestamp();
        this.#makeCards();
        this.#toggleStandard();
    }

    static #getMainDayData() {
        return [
            {text: "Minimum temperature", value: `mintemp_${standard}`, unit: `°${standard.toUpperCase()}`, image: lowTemp, parent: "day"}, {text: "Maximum temperature", value: `maxtemp_${standard}`, unit: `°${standard.toUpperCase()}`, image: highTemp, parent: "day"},
            {text: "Daily chance of rain", value: "daily_chance_of_rain", unit: "%", image: chanceOfRain, parent: "day"}, {text: "Daily chance of snow", value: "daily_chance_of_snow", unit: "%", image: chanceOfSnow, parent: "day"},
            {text: "Average humidity", value: "avghumidity", unit: "%", image:humidity, parent: "day"}, {text: "Average visibility", value: "avgvis_km", unit: "km", image: visibility, parent: "day"}, 
            {text: "Total precipitation", value: "totalprecip_mm", unit: "mm", image: precipitation, parent: "day"}, {text: "Total snow", value: "totalsnow_cm", unit: "cm", image: snow, parent: "day"},
            {text: "Maximum wind", value: "maxwind_kph", unit: "kph", image: wind, parent: "day"}, {text: "UV", value: "uv", unit: "", image: uv, parent: "day"},
            {text: "Sunrise", value: "sunrise", unit: "", image: sunrise, parent: "astro"}, {text: "Sunset", value: "sunset", unit: "", image: sunset, parent: "astro"},
            {text: "Moonrise", value: "moonrise", unit: "", image: moonrise, parent: "astro"}, {text: "Moonset", value: "moonset", unit: "", image: moonset, parent: "astro"}
        ];
    };

    #loadTimestamp() {
        this.time.innerText = `${user.time} ${user.timezone}`;
        this.date.innerText = user.date;
        this.day.innerText = user.day;
        this.location.innerText = user.location;
    }

    #makeCards() {
        const cards = document.getElementById("cards-section");
        for (let i = 0; i < 6; i++) {
            const placeholder = document.createElement("div");
            placeholder.id = `c${i}`;
            placeholder.className = "card";
            placeholder.value = false;

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
    
    static #loadMainDisplay(data, city) {
        const mainPlacehodler = document.getElementById("secondary-data");
        mainPlacehodler.innerHTML = "";

        document.getElementById("city-name").innerText = city.name;

        for (let info of this.#getMainDayData()) {
            const placeholder = document.createElement("div");
            placeholder.classList.add("scd-info");

            const text = document.createElement("p");
            text.innerText = info.text + ":";
            placeholder.appendChild(text);
            
            const value = document.createElement("p");
            value.innerText = data[info.parent][info.value] + info.unit;
            placeholder.appendChild(value);

            const image = document.createElement("img");
            image.src = info.image;
            placeholder.appendChild(image);

            mainPlacehodler.appendChild(placeholder);
        }
    }

    static async loadCity(city, lat, lon) {
        this.#clearCards();
        try {
            await this.#loadHistoryAndPresent(city, lat, lon);
            await this.#loadForecast(city, lat, lon);
            const today = storage.getDatawDate(format(new Date(), "yyyy-MM-dd"));
            this.#selectCard(today.card);
            this.#loadMainDisplay(today.data, today.city);
        } catch(err) {
            console.log(err);
        }
    }

    static async #loadHistoryAndPresent(city, lat, lon) {
        try {
            for (let i = 2; i >= 0; i--) {
                const dt = format(sub(new Date(), {days: i}), "yyyy-MM-dd");
                let data;
                if (lat && lon) data = await fetch(`https://api.weatherapi.com/v1/history.json?key=61b2b1c062454b8196c74023252809&q=${lat}, ${lon}&dt=${dt}`);
                else data = await fetch(`https://api.weatherapi.com/v1/history.json?key=61b2b1c062454b8196c74023252809&q=${city}&dt=${dt}`);                
                data = await data.json();
                console.log(data);
                let card = this.#findEmptyCard();    
                storage.addCard(card, data);
                this.#displayCard(storage.getCard(card.id));
            }
        } catch (err) {
            throw new Error(err);
        }
        
    }

    static async #loadForecast(city, lat, lon) {
        try {
            for (let i = 1; i <= 3; i++) {
                let dt = format(add(new Date(), {days: i}), "yyyy-MM-dd");
                let data;
                if (lat && lon) data = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=61b2b1c062454b8196c74023252809&q=${lat}, ${lon}&dt=${dt}`);
                else data = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=61b2b1c062454b8196c74023252809&q=${city}&dt=${dt}`);
                data = await data.json();
                let card = this.#findEmptyCard();
                storage.addCard(card, data);
                this.#displayCard(storage.getCard(card.id));
            }
        } catch (err) {
            console.log(err);
        }
        
    }

    static #displayCard(cardData) {
        const card = cardData.card;
        const data = cardData.data;
        const city = cardData.city;
        //DISPLAY TITLE
        card.querySelector(".card-title").innerText = getDayText(data.date);

        card.querySelector(".card-temp").innerText = data.day[`avgtemp_${standard}`] + `°${standard.toUpperCase()}`;

        card.querySelector(".card-img").src = data.day.condition.icon;

        card.addEventListener("click", () => {
            this.#loadMainDisplay(data, city);
            changeBackground(findWeather(data.day.condition.code));
            this.#selectCard(card);
        })
    }

    static #findEmptyCard() {
        const cards = document.querySelectorAll(".card");
        for (let card of cards) {
            if (!card.value) {
                card.value = true;
                return card;
            }
        }
    }

    static #clearCards() {
        const cards = document.querySelectorAll(".card");
        for (let card of cards) {
                card.value = false;
                storage.array = [];
            }
    }

    static #selectCard(c) {
        for (let item of storage.array) {
            if (item.card.classList.contains("selected")) {
                item.card.classList.remove("selected");
            }
        }
        c.classList.add("selected");
    }

    #toggleStandard() {
        document.querySelectorAll("input[name='standard'").forEach(radio => {
            radio.addEventListener("change", () => {
                if (standard == "c") {
                    standard = "f";
                } else {
                    standard = "c";
                }
                const today = storage.getDatawDate(format(new Date(), "yyyy-MM-dd"));
                loadPage.loadCity(today.city.name, today.city.lat, today.city.lon);
            });
        });
    }

}

class Search {
    constructor() {
        this.searchBar = document.getElementById("search");
        this.btn = document.getElementById("search-btn");
        this.suggestionsDiv = document.getElementById("suggestions");
        this.suggestions;
        this.#dynamicLocationSearch();
        this.#handleBtnClick();
    }

    async #dynamicLocationSearch() {
        this.searchBar.addEventListener("input", async (event) => {
            try {
                if (this.searchBar.validity.valueMissing) {
                    this.suggestionsDiv.style.visibility = "hidden";
                    return;
                }
                this.suggestionsDiv.style.visibility = "visible";
                this.suggestions = await fetch(`https://api.weatherapi.com/v1/search.json?key=61b2b1c062454b8196c74023252809&q=${event.target.value}`);
                this.suggestions = await this.suggestions.json();              
                this.#loadSuggestions(this.suggestions);
                this.#selectSuggestion(this.suggestions[0]);
            } catch(err) {
                console.log(err);
            }
        })
    }

    #loadSuggestions(suggestions) {
        this.suggestionsDiv.innerHTML = "";
        for (let suggestion of suggestions) {

            const placeholder = document.createElement("div");
            placeholder.className = "suggestion";
            placeholder.id = suggestion.id;
            placeholder.value = suggestion.name;
            placeholder.lat = suggestion.lat;
            placeholder.lon = suggestion.lon;

            const cityName = document.createElement("p");
            cityName.className = "city-name";
            cityName.innerText = `${suggestion.name}, ${suggestion.country}`;
            placeholder.appendChild(cityName);
            
            this.suggestionsDiv.appendChild(placeholder);

            placeholder.addEventListener("click", () => {
                this.searchBar.value = suggestion.name;
                this.searchBar.lat = suggestion.lat;
                this.searchBar.lon = suggestion.lon;
            });
            placeholder.addEventListener("mouseenter", () => {
                this.#selectSuggestion(suggestion);
            });
            document.addEventListener("keydown", (event) => {
                if (event.key == "Enter") {
                    this.searchBar.value = document.querySelector(".selected-suggestion").value;
                    this.searchBar.lat = document.querySelector(".selected-suggestion").lat;
                    this.searchBar.lon = document.querySelector(".selected-suggestion").lon;
                }
            })
        }
    }

    #selectSuggestion(s) { //fetch value
        let suggestions = document.querySelectorAll(".suggestion"); //DOM value
        for (let suggestion of suggestions) {
            if (suggestion.classList.contains("selected-suggestion")) {
                suggestion.classList.remove("selected-suggestion");
            }
            if (suggestion.id == s.id) {
                suggestion.classList.add("selected-suggestion");
            }
        }
    }

    #handleBtnClick() {
        this.btn.addEventListener("click", () => {
            if (!this.searchBar.validity.valueMissing) {
                let city = this.searchBar.value;
                let lat = this.searchBar.lat;
                let lon = this.searchBar.lon;
                loadPage.loadCity(city, lat, lon);
                this.suggestionsDiv.style.visibility = "hidden";
                this.searchBar.value = "";
                this.searchBar.lat = ""
                this.searchBar.lon = ""
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

function getDayText(date) {
    const today = format(new Date(), "yyyy-MM-dd");
    if (date === today) {
        return "Today";
    } else if (differenceInCalendarDays(date, today) === -1) {
        return "Yesterday";
    } else if (differenceInCalendarDays(date, today) === 1) {
        return "Tomorrow";
    } else if (differenceInCalendarDays(date, today) < 1) {
        return `${Math.abs(differenceInCalendarDays(date, today))} days ago`;
    } else if (differenceInCalendarDays(date, today) > 1) {
        return `in ${differenceInCalendarDays(date, today)} days`;
    }
}

function findWeather(code) {
    let weather;
    if (code === 1000) {
        weather = "sunny";
    } else if (code === 1003) {
        weather = "partly-cloudy";
    } else if ([1006, 1009].includes(code)) {
        weather = "cloudy";
    } else if ([1030, 1135, 1147].includes(code)) {
        weather = "fog";
    } else if ([1063, 1150, 1153, 1180, 1183, 1186].includes(code)) {
        weather = "light-rain";
    } else if ([1189, 1192, 1195, 1204, 1240, 1243].includes(code)) {
        weather = "heavy-rain";
    } else if ([1087, 1273, 1276, 1279].includes(code)) {
        weather = "thunder";
    } else if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1255, 1258].includes(code)) {
        weather = "snow";
    } else if ([1207, 1237, 1249, 1252, 1261].includes(code)) {
        weather = "sleet";
    } else {
        weather = "default"; // fallback background
    }

    return weather;
}

function changeBackground(weather) {
    document.querySelector("body").style.backgroundImage = `url("/backgrounds/${weather}.jpg")`;
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
