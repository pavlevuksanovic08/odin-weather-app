import { format } from "date-fns";

export class UsersData {
    constructor() {
        this.time;
        this.date;
        this.day;
        this.timezone;
        this.location;

        this.setTimestamp();
        this.setLocation();

    }

    static async init () {
        const instance = new UsersData();
        instance.setTimestamp();
        await instance.setLocation();
        return instance;
    }

    setTimestamp() {
        const now = new Date(Date.now())
        this.time = format(now, "HH:mm");
        this.date = format(now, "dd.MM.yyyy");
        this.day = format(now, "EEEE");
        this.timezone = format(now, "OOOO");
    }

    async setLocation() {
        
        try {
            const position = await this.getPositon();
            
            //let data = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${position.lat}&lon=${position.long}&apiKey=82044b6f0cfd4f8194819869cb67c48f`);
            data = await data.json();
            this.location = data.features[0].properties.county;
        } catch(err) {
            console.log(err)
        }
        
    }

    getPositon() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (result) => {
                  const lat = result.coords.latitude;
                  const long = result.coords.longitude;
                  resolve({ lat, long });
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              reject(new Error("Geolocation not supported by this browser."));
            }
        });
    }
}