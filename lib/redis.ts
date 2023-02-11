import {createClient} from 'redis';

const client = createClient({
    url: 'redis://redis:6379',
});

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