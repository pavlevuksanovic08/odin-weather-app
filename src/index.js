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

    }

    static mainDayData = [
        {text: "Minimum temperature", value: `mintemp_${standard}`, unit: `°${standard.toUpperCase()}`, image: lowTemp, parent: "day"}, {text: "Maximum temperature", value: `maxtemp_${standard}`, unit: `°${standard.toUpperCase()}`, image: highTemp, parent: "day"},
        {text: "Daily chance of rain", value: "daily_chance_of_rain", unit: "%", image: chanceOfRain, parent: "day"}, {text: "Daily chance of snow", value: "daily_chance_of_snow", unit: "%", image: chanceOfSnow, parent: "day"},
        {text: "Average humidity", value: "avghumidity", unit: "%", image:humidity, parent: "day"}, {text: "Average visibility", value: "avgvis_km", unit: "km", image: visibility, parent: "day"}, 
        {text: "Total precipitation", value: "totalprecip_mm", unit: "mm", image: precipitation, parent: "day"}, {text: "Total snow", value: "totalsnow_cm", unit: "cm", image: snow, parent: "day"},
        {text: "Maximum wind", value: "maxwind_kph", unit: "kph", image: wind, parent: "day"}, {text: "UV", value: "uv", unit: "", image: uv, parent: "day"},
        {text: "Sunrise", value: "sunrise", unit: "", image: sunrise, parent: "astro"}, {text: "Sunset", value: "sunset", unit: "", image: sunset, parent: "astro"},
        {text: "Moonrise", value: "moonrise", unit: "", image: moonrise, parent: "astro"}, {text: "Moonset", value: "moonset", unit: "", image: moonset, parent: "astro"}
    ];

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

    static #loadMainDisplay(data) {
        const mainPlacehodler = document.getElementById("secondary-data");
        mainPlacehodler.innerHTML = "";

        for (let info of this.mainDayData) {
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

    static async loadCity(cityName) {
        this.#clearCards();
        try {
            await this.#loadHistoryAndPresent(cityName);
            await this.#loadForecast(cityName);
            const today = storage.getDatawDate(format(new Date(), "yyyy-MM-dd"));
            this.#selectCard(today.card);
            this.#loadMainDisplay(today.data);
        } catch(err) {
            console.log(err);
        }
    }

    static async #loadHistoryAndPresent(city) {
        try {
            for (let i = 2; i >= 0; i--) {
                const dt = format(sub(new Date(), {days: i}), "yyyy-MM-dd");
                let data = await fetch(`https://api.weatherapi.com/v1/history.json?key=61b2b1c062454b8196c74023252809&q=${city}&dt=${dt}`);
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

    static async #loadForecast(city) {
        try {
            for (let i = 1; i <= 3; i++) {
                let dt = format(add(new Date(), {days: i}), "yyyy-MM-dd");
                let data = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=61b2b1c062454b8196c74023252809&q=${city}&dt=${dt}`);
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

        //DISPLAY TITLE
        card.querySelector(".card-title").innerText = getDayText(data.date);

        card.querySelector(".card-temp").innerText = data.day[`avgtemp_${standard}`] + `°${standard.toUpperCase()}`;

        card.querySelector(".card-img").src = data.day.condition.icon;

        card.addEventListener("click", () => {
            this.#loadMainDisplay(data);
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
