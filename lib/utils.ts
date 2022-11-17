import argon2 from 'argon2';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

export async function checkPassword(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
}