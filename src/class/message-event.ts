import { Auth, Message } from '../model';
import { createHeaders } from '../utils/request.utils';
import { MessageDto } from './message-dto';
import { Channel } from './channel';
import { DISCORD_API_URL } from './discord_client';
import { DiscordWsEventImpl } from './ws-event';
import { FunctionMessageType } from '../channel.model';

export class DiscordMsgEvent extends DiscordWsEventImpl{
    data!: Message
    #channel?: Channel;
    #auth: Required<Auth>;
    #functionByChannel: FunctionMessageType;
    constructor(json: Message, auth: Required<Auth>, functionByChannel: FunctionMessageType) {
        super()
        this.data = json;
        this.#auth = auth;
        this.#functionByChannel = functionByChannel;
    }

    async initialize(): Promise<void> {
        this.#channel = new Channel(this.data.channel_id, this.#auth.token);
        await this.#channel.initialize();
    }

    get channel(): Channel {
        if (!this.#channel) {
            throw new Error('Channel not found')
        }
        return this.#channel;
    }

    async edit(content: string): Promise<unknown> {
        try {

            const response = await fetch(`${DISCORD_API_URL}/channels/${this.data.channel_id}/messages/${this.data.id}`, 
            { body: JSON.stringify({ content }), method: 'PATCH', headers: createHeaders(this.#auth.token) });

            if (response.status.toString().at(0) !== '2') {
                console.log(await response.text())
                throw new Error(`Cannot edit message {${response.statusText}}`);
            }
            return response.json();
        }
        catch (err) {
            console.error(err);
        }
    }

    async reply(content: string): Promise<Message | undefined> {
        const oldSnowflake = this.data.id;
        const message = new MessageDto(this.data.channel_id, {
            content,
            referencesMessages: this.data,
            id: oldSnowflake
        }, this.#auth);
        try {
            const result = await this.channel.sendMessage(message)
            return result;

        }
        catch (err) {
            console.error(err);
        }
    }
    async #addReaction(emoji: string): Promise<unknown> {
        const response = await fetch(`${DISCORD_API_URL}/channels/${this.data.channel_id}/messages/${this.data.id}/reactions/${emoji}/@me`,
            { method: 'PUT', headers: createHeaders(this.#auth.token) })

        if (response.status !== 200 && response.status !== 204) {
            throw new Error(`Cannot add reaction {${response.statusText}}`);
        }

        return;
    }


    async react(emoji: string): Promise<void> {
        try {
            await this.#addReaction(emoji)
        }
        catch (err) {
            console.error(err);
        }
        return;
    }

    async execute(): Promise<void> {
        console.log(`${[new Date().toISOString()]}: ${this.data.content}` )
        await this.initialize();
        const type = this.channel.channelEntity.type;
        const isNotMe = this.data.author.id !== this.#auth.user?.id;
        const isMe = this.data.author.id === this.#auth.user?.id;
        if (type !== undefined && type in this.#functionByChannel && isMe) {
            await this.#functionByChannel?.[type]?.(this);
        }
    }


}
