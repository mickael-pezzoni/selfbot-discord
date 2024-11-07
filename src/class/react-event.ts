import { Reaction } from "../channel.model";
import { Auth, EventEntity } from "../model";
import { Channel } from "./channel";
import { DiscordWsEventImpl } from "./ws-event";

export class DiscordReactEvent extends DiscordWsEventImpl {
    data: Reaction;
    #channel?: Channel;
    #auth: Required<Auth>;
    #userFunction: (param: DiscordReactEvent) => void | Promise<void>;
    constructor(data: Reaction, userFunction: (param: DiscordReactEvent) => void | Promise<void>, auth: Required<Auth>) {
        super();
        this.data = data;
        this.#auth = auth;
        this.#userFunction = userFunction;
    }

    get channel(): Channel {
        if (!this.#channel) {
            throw new Error('Channel not found')
        }
        return this.#channel;
    }

    async initialize(): Promise<void> {
        this.#channel = new Channel(this.data.channel_id, this.#auth.token);
        await this.#channel.initialize();
    }
    async execute(): Promise<void> {
        console.log(this.data.emoji.name);
        this.#userFunction(this);
    }
}