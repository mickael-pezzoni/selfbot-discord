export async function createAndInitalizeClass<T extends { new(...args: any[]): T, initialize(): Promise<unknown> }>
(classRef: T, 
    ...args: unknown[]
): Promise<T> {
    const instance = new classRef(...args);
    await instance.initialize();

    return instance;

}