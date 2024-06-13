import { Auth, Author, CreateMessageDto, Message } from "../model";
import { createHeaders } from "../utils/request.utils";
import { Snowflake } from "./snowflake";

const DISCORD_MSG_URL = 'https://discord.com/api/v9/channels';

export class MessageDto implements CreateMessageDto {
    type = 0
    tts = false
    timestamp = new Date().toDateString()
    pinned = false
    nonce?: string;
    mentions = [];
    mention_roles = [];
    mention_everyone = false;
    id?: string;
    flags = 0;
    embeds = []
    edited_timestamp = null;
    components = [];
    channel_id: string;
    author: Author;
    attachments = [];
    content: string;
    #auth: Auth;
    constructor(channelId: string, body: {content: string, id: string}, auth: Required<Auth>) {
        this.channel_id = channelId;
        this.author = auth.user;
        this.content = body.content;
        //this.id = new Snowflake(body.id).next().toString();
        this.#auth = auth;
    }

    private get body(): object {
        return Object.fromEntries(Object.entries(this).filter(([key]) => key !== '#auth'))
    }

    async send(): Promise<unknown> {
        const response = await fetch(`${DISCORD_MSG_URL}/${this.channel_id}/messages`,
            { method: 'POST', body: JSON.stringify(this.body), headers: createHeaders(this.#auth.token)})


        if (response.status !== 200) {
            throw new Error(`Cannot send message {${response.statusText}}` ,);
        }

        return response.json();
    }

}
