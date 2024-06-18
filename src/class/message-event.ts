import {Data, MessageEvent, WebSocket} from 'ws'
import { Auth, CreateMessageEvent, DataEvent, HelloEvent } from '../model';
import { createHeaders } from '../utils/request.utils';
import { MessageDto } from './message-dto';
import { Channel } from './channel';
import { DISCORD_API_URL } from './discord_client';

export class MsgEvent implements Omit<MessageEvent, 'data'> {
    data!: DataEvent;
    type!: string;
    target!: WebSocket;
    channel?: Channel;
    #auth: Required<Auth>;
    constructor(json: object, auth: Required<Auth>) {
        Object.assign(this, json);
        this.#auth = auth;
    }

    async initialize(): Promise<void> {
        if (this.isMsgEvent(this.data)) {
            this.channel = new Channel(this.data.d.channel_id, this.#auth.token);
            await this.channel.initialize();
        }

        return Promise.resolve();
    }

    isHelloEvent(data: DataEvent = this.data): data is HelloEvent {
        return data.op === 10;
    }

    isMsgEvent(data: DataEvent = this.data): data is CreateMessageEvent {
        return data.t === 'MESSAGE_CREATE';
    }

    async reply(content: string): Promise<unknown> {
        const data = this.data as CreateMessageEvent;
        const oldSnowflake = data.d.id;
        const message = new MessageDto(data.d.channel_id, {
            content,
            referencesMessages: data.d,
            id: oldSnowflake
        },  this.#auth);
        try {
            const result = await this.channel?.sendMessage(message)
            return result;

        }
        catch(err) {
            console.error(err);
        }
    }
    async #addReaction(emoji: string): Promise<unknown> {
        const data = this.data as CreateMessageEvent;
        const response = await fetch(`${DISCORD_API_URL}/channels/${data.d.channel_id}/messages/${data.d.id}/reactions/${emoji}/@me`,
        { method: 'PUT', headers: createHeaders(this.#auth.token)})

        if (response.status !== 200 && response.status !== 204) {
            throw new Error(`Cannot add reaction {${response.statusText}}`);
        }

        return;
    }


    async react(emoji: string): Promise<void> {
        try {
            await this.#addReaction(emoji)
        }
        catch(err) {
            console.error(err);
        }
        return;
    }


}
