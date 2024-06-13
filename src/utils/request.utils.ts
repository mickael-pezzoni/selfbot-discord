export function createHeaders(token: string) {
    return {
        'Authorization': token,
        'Content-Type': 'application/json'
    } as const;
}