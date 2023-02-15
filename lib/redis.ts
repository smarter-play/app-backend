import {createClient} from 'redis';
import HTTPError from './HTTPError';

const client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.connect();

// general

export const getRunningGames = async (): Promise<number[]> => {
    let raw = await client.lRange('running_games', 0, -1);
    return raw.map((el) => parseInt(el));
}

export const addRunningGame = async (game_id: number) => {
    await client.lPush('running_games', `${game_id}`);
}

export const endGame = async (game_id: number) => {
    await client.lRem('running_games', 0, `${game_id}`);
}

// MQTT state machine

export const setHasScored = async (game_id: number) => {
    await client.set(`game:${game_id}:has_scored`, '1');
}

export const getHasScored = async (game_id: number): Promise<boolean> => {
    let raw = await client.get(`game:${game_id}:has_scored`);
    return raw == '1';
}

export const resetHasScored = async (game_id: number) => {
    await client.del(`game:${game_id}:has_scored`);
}

// match creation

export const addToTeam = async (basket_id: number, team: number, user_id: number) => {
    if(team != 1 && team != 2) throw new HTTPError("Team must be 1 or 2", 400);
    
    // check if user is already in a team and delete its entry
    let team1 = await getTeam(basket_id, 1);
    let team2 = await getTeam(basket_id, 2);

    if(team1.includes(user_id)) {
        await removeFromTeam(basket_id, 1, user_id);
    } else if(team2.includes(user_id)) {
        await removeFromTeam(basket_id, 2, user_id);
    }

    await client.lPush(`basket:${basket_id}:team:${team}`, `${user_id}`);
}

export const removeFromTeam = async (basket_id: number, team: number, user_id: number) => {
    if(team != 1 && team != 2) throw new HTTPError("Team must be 1 or 2", 400);
    await client.lRem(`basket:${basket_id}:team:${team}`, 0, `${user_id}`);
}

export const getTeam = async (basket_id: number, team: number): Promise<number[]> => {
    if(team != 1 && team != 2) throw new HTTPError("Team must be 1 or 2", 400);
    let raw = await client.lRange(`basket:${basket_id}:team:${team}`, 0, -1);
    return raw.map((x) => parseInt(x));
}

export const setReady = async (basket_id: number, team: number, user: number, ready: string) => {
    if(team != 1 && team != 2) throw new HTTPError("Team must be 1 or 2", 400);
    if (ready != '1' && ready != '0') throw new HTTPError("Ready must be 1 or 0", 400);
    await client.set(`basket:${basket_id}:team:${team}:user:${user}:ready`, ready);
}

export const getReady = async (basket_id: number): Promise<boolean> => {
    let team1 = await getTeam(basket_id, 1);
    let team2 = await getTeam(basket_id, 2);

    for(let i = 0; i < team1.length; i++) {
        let raw = await client.get(`basket:${basket_id}:team:1:user:${team1[i]}:ready`);
        if(raw != '1') return false;
    }

    for(let i = 0; i < team2.length; i++) {
        let raw = await client.get(`basket:${basket_id}:team:2:user:${team2[i]}:ready`);
        if(raw != '1') return false;
    }

    return true;
}

export const resetBasket = async (basket_id: number) => {
    // reset ready status
    let team1 = await getTeam(basket_id, 1);
    let team2 = await getTeam(basket_id, 2);

    for(let i = 0; i < team1.length; i++) {
        await client.del(`basket:${basket_id}:team:1:user:${team1[i]}:ready`);
    }

    for(let i = 0; i < team2.length; i++) {
        await client.del(`basket:${basket_id}:team:2:user:${team2[i]}:ready`);
    }

    // reset team
    await client.del(`basket:${basket_id}:team:1`);
    await client.del(`basket:${basket_id}:team:2`);
}