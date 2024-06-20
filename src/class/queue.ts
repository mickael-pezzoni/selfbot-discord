import { AsyncFunction } from "../model";

export class Queue {
    #inProgress = false;
    operations: AsyncFunction<unknown, unknown>[] = []
    constructor() {}


    add(operation: AsyncFunction<unknown, unknown>): void{
        this.operations.push(operation);
        console.log('nb operations ', this.operations.length);
        if (!this.#inProgress) {
            this.#execute();
        }
    }

    async #execute(): Promise<void> {
        this.#inProgress = true;
        console.log('excute operations')
        await this.operations[0]();
        await this.#sleep(1000)
        this.operations.shift()
        if (this.operations.length === 0) {
            this.#inProgress = false;
        } else {
            this.#execute()
        }
    }

    #sleep(time: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time)
        })
    }


}