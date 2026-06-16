import { DiscordError } from "../channel.model";
import { AsyncFunction } from "../model";
import { isDiscordError } from "../utils/request.utils";

export class Queue {
  #inProgress = false;
  operations: AsyncFunction<unknown, unknown | DiscordError>[] = [];
  constructor() {}

  add(...operation: AsyncFunction<unknown, unknown>[]): void {
    this.operations.push(...operation);
    if (!this.#inProgress) {
      this.#execute();
    }
  }

  async #execute(): Promise<void> {
    this.#inProgress = true;
    const result = await this.operations[0]();
    if (isDiscordError(result)) {
      await this.#sleep((result.retryAfter ?? 1) * 1000);
      this.#inProgress = false;
      this.#execute();
    } else {
      this.operations.shift();
      if (this.operations.length === 0) {
        this.#inProgress = false;
      } else {
        this.#execute();
      }
    }
  }

  #sleep(time: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
