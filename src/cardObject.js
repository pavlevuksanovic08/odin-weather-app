export class DayCard {
    constructor() {
        this.array = [];
    }

    addCard(card, data) {
        if (this.array.length > 7) {
            throw new Error("Array overflow");
        }
        this.array.push({card: card, data: data.forecast.forecastday[0]});
    }

    getCard(id) {
        for (let item of this.array) {
            if (item.card.id === id) {
                return item;
            }
        }
    }
}