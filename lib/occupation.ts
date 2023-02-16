import axios from "axios";

let client = axios.create({
    baseURL: `${process.env.OCCUPATION_PREDICTOR_HOST}:${process.env.OCCUPATION_PREDICTOR_PORT}`,
});

export const getCurrentOccupation = async (basket: number): Promise<{[key: string]: any}> => {
    console.log({
        basket,
        t: new Date().toISOString().substring(0, 19),
    });
    
    let res = await client.get(`/api/occupation`, {
        params: {
            basket,
            t: new Date().toISOString().substring(0, 19),
        }
    });
    return res.data;
}

export const forecastOccupation = async (basket: number, time: Date, history_days: number): Promise<{[key: string]: any}> => {
    let now = new Date();
    let res = await client.get(`/api/occupation`, {
        params: {
            basket,
            t: time.toISOString().substring(0, 19),
            present: now.toISOString().substring(0, 19),
            num_history_days: history_days,
            num_predicted_days: Math.ceil((time.getTime() - now.getTime())/1000/60/60/24)
        }
    });
    return res.data;
}
