import axios from "axios";

let client = axios.create({
    baseURL: `${process.env.OCCUPATION_PREDICTOR_HOST}:${process.env.OCCUPATION_PREDICTOR_PORT}`,
});

export const getCurrentOccupation = async (basket: number): Promise<number> => {
    let res = await client.get(`/api/occupation`, {
        params: {
            basket,
            t: new Date().toISOString()
        }
    });
    return res.data;
}

export const forecastOccupation = async (basket: number, time: Date, history_days: number): Promise<number> => {
    let now = new Date();
    let res = await client.get(`/api/occupation`, {
        params: {
            basket,
            t: time.toISOString(),
            present: now.toISOString(),
            num_history_days: history_days,
            num_predicted_days: Math.ceil((time.getTime() - now.getTime())/1000/60/60/24)
        }
    });
    return res.data;
}
