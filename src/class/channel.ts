import { createHeaders } from "../utils/request.utils";
import { ChannelModel, ChannelType } from "../channel.model";
import { DISCORD_API_URL } from "./discord_client";
import { MessageDto } from "./message-dto";

export class Channel {
    id: string;
    #token: string;
    #channelEntity?: ChannelModel;
    constructor(id: string, token: string) {
        this.id = id;
        this.#token = token;
    }

    async initialize(): Promise<void> {
        try {
            this. #channelEntity = await this.get();
        }
        catch(err) {
            console.error(err);
        }
    }

    get channelEntity(): ChannelModel {
        if (this.#channelEntity === undefined) {
            throw new Error('')
        }
        return this.#channelEntity
    }

    isDmMessage(): boolean {
        return this.channelEntity?.type === ChannelType.DM;
    }

    isGroupDm(): boolean {
        return this.channelEntity?.type === ChannelType.GROUP_DM;
    }

    isGuildMessage(): boolean {
        return this.channelEntity?.type === ChannelType.GUILD_TEXT;
    }


    async get(): Promise<ChannelModel> {
        const result = await fetch(`${DISCORD_API_URL}/channels/${this.id}`, {headers: createHeaders(this.#token)});
    
        if (result.status !== 200) {
            throw new Error(`Get channel`)
        }

        return result.json();
    }

    async sendMessage(dto: MessageDto): Promise<unknown> {
        const response = await fetch(`${DISCORD_API_URL}/channels/${this.id}/messages`,
            { method: 'POST', body: JSON.stringify(dto.body), headers: createHeaders(this.#token)})


        if (response.status !== 200) {
            throw new Error(`Cannot send message {${response.statusText}}`);
        }

        return response.json();
    }



}