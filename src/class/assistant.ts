import { Message } from "../model";

export abstract class Assistant {

    #instruction: string;
    #messages: {role: 'system' | 'user' | 'assistant', content: string, author?: string}[] = [];
    constructor(instruction: string) {
        this.#instruction = instruction;
        this.#messages.push({
            role: 'system',
            content: instruction

        })
    }

    get messages(): {role: 'system' | 'user' | 'assistant', content: string, author?: string}[] {
        return this.#messages;
    }

    clearMessages(): void {
        this.#messages = [];
    }

    addMessages(messages: (Message & {isBoot: boolean})[]): Assistant {
        this.#messages.push(...messages.map((message) => ({
            role: (!message.isBoot? 'user' as const : 'assistant' as const),
//            content: !message.isBoot ? `${message.author.global_name}: ${message.content}` : message.content,
            content: message.content,

            author: message.author.global_name
        })));
        return this;
    }

    abstract completion(): Promise<{
        role: 'assistant',
        content: string,
      }>;


}