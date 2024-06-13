import {Data, MessageEvent, WebSocket} from 'ws'
import { Auth, CreateMessageEvent, DataEvent, HelloEvent } from '../model';
import { createHeaders } from '../utils/request.utils';
import { MessageDto } from './message-dto';

export class MsgEvent implements Omit<MessageEvent, 'data'> {
    data!: DataEvent;
    type!: string;
    target!: WebSocket;
    #auth: Required<Auth>;
    constructor(json: object, auth: Required<Auth>) {
        Object.assign(this, json);
        this.#auth = auth;
    }


    isHelloEvent(data: DataEvent = this.data): data is HelloEvent {
        return data.op === 10;
    }

    isMsgEvent(data: DataEvent = this.data): data is CreateMessageEvent {
        return data.t === 'MESSAGE_CREATE';
    }

    async reply(channelId: string, content: string): Promise<unknown> {
        const data = this.data as CreateMessageEvent;
        const oldSnowflake = data.d.id;
        const message = new MessageDto(channelId, {
            content,
            id: oldSnowflake
        },  this.#auth);
        const result = await message.send()

        return result;

    }


}
