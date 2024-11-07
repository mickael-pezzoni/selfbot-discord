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
    message_reference?: {channel_id: string, message_id: string, type: number};
    referencesMessages?: Message;
    constructor(channelId: string, body: {content: string, id?: string, referencesMessages?: Message}, auth: Required<Auth>) {
        this.channel_id = channelId;
        this.author = auth.user;
        this.content = body.content;
        this.referencesMessages = body.referencesMessages;
        this.setReferenceMessage();
        //this.id = new Snowflake(body.id).next().toString();
        this.#auth = auth;
    }

    setReferenceMessage(): void {
        if (this.referencesMessages) {
            this.message_reference = {
                channel_id: this.channel_id,
                message_id: this.referencesMessages?.id ?? '',
                type: 0
            }
        }
    }

    get body(): object {
        return Object.fromEntries(Object.entries(this).filter(([key]) => key !== '#auth'))
    }


}
