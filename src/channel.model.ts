import { DiscordMsgEvent } from "./class/message-event";
import { User } from "./model";

  interface Role {
    id: string; // snowflake
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: {
      bot_id?: string;
      integration_id?: string;
      premium_subscriber?: null;
    };
  }
  
  interface Attachment {
    id: string; // snowflake
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number;
    width?: number;
    content_type?: string;
  }
 export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUNCEMENT = 5,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD = 11,
    PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
    GUILD_MEDIA = 16
}

export type FunctionMessageType = Partial<
  Record<ChannelType, (event: DiscordMsgEvent) => Promise<void> | void>
>;
type EventFunction1 = (event: DiscordMsgEvent) => Promise<void> 
export type EventCallback = Partial<
  Record<ChannelType, 
  EventFunction1 | {
    channel?: Record<string, EventFunction1>,
    guild?: Record<string, EventFunction1>,
    user?: Record<string, EventFunction1>
  }
  >
>;

  
  interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string; // ISO8601 timestamp
    color?: number;
    footer?: {
      text: string;
      icon_url?: string;
      proxy_icon_url?: string;
    };
    image?: {
      url: string;
      proxy_url?: string;
      height?: number;
      width?: number;
    };
    thumbnail?: {
      url: string;
      proxy_url?: string;
      height?: number;
      width?: number;
    };
    video?: {
      url?: string;
      height?: number;
      width?: number;
    };
    provider?: {
      name?: string;
      url?: string;
    };
    author?: {
      name?: string;
      url?: string;
      icon_url?: string;
      proxy_icon_url?: string;
    };
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  }
  
  export interface Reaction {
    //count: number;
    message_id: string;
    user_id: string;
    channel_id: string;
    //me: boolean;
    emoji: {
      id?: string; // snowflake
      name: string;
      animated?: boolean;
    };
  }
  
  interface MessageActivity {
    type: number;
    party_id?: string;
  }
  
  interface MessageApplication {
    id: string; // snowflake
    cover_image?: string;
    description: string;
    icon: string;
    name: string;
  }
  
  interface MessageReference {
    message_id?: string; // snowflake
    channel_id?: string; // snowflake
    guild_id?: string; // snowflake
    fail_if_not_exists?: boolean;
  }
  
  interface MessageInteraction {
    id: string; // snowflake
    type: number;
    name: string;
    user: User;
  }
  
  export interface ChannelModel {
    id: string; // snowflake
    type: ChannelType;
    guild_id?: string; // snowflake
    position?: number;
    permission_overwrites?: any[];
    name?: string;
    topic?: string;
    nsfw?: boolean;
    last_message_id?: string; // snowflake
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: User[];
    icon?: string;
    owner_id?: string; // snowflake
    application_id?: string; // snowflake
    parent_id?: string; // snowflake
    last_pin_timestamp?: string; // ISO8601 timestamp
  }
  
  interface StickerItem {
    id: string; // snowflake
    name: string;
    format_type: number;
  }
  
  interface Sticker {
    id: string; // snowflake
    pack_id?: string; // snowflake
    name: string;
    description: string;
    tags: string;
    asset: string;
    type: number;
    format_type: number;
    available?: boolean;
    guild_id?: string; // snowflake
    user?: User;
    sort_value?: number;
  }
  
  interface Message {
    id: string; // snowflake - id of the message
    channel_id: string; // snowflake - id of the channel the message was sent in
    author: User; // the author of this message (not guaranteed to be a valid user, see below)
    content: string; // contents of the message
    timestamp: string; // ISO8601 timestamp - when this message was sent
    edited_timestamp?: string; // ISO8601 timestamp or null - when this message was edited (or null if never)
    tts: boolean; // whether this was a TTS message
    mention_everyone: boolean; // whether this message mentions everyone
    mentions: User[]; // users specifically mentioned in the message
    mention_roles: Role[]; // roles specifically mentioned in this message
    mention_channels?: string[]; // snowflake array - channels specifically mentioned in this message
    attachments: Attachment[]; // any attached files
    embeds: Embed[]; // any embedded content
    reactions?: Reaction[]; // reactions to the message
    nonce?: number | string; // used for validating a message was sent
    pinned: boolean; // whether this message is pinned
    webhook_id?: string; // snowflake - if the message is generated by a webhook, this is the webhook's id
    type: number; // type of message
    activity?: MessageActivity; // sent with Rich Presence-related chat embeds
    application?: MessageApplication; // sent with Rich Presence-related chat embeds
    application_id?: string; // snowflake - if the message is an Interaction or application-owned webhook, this is the id of the application
    message_reference?: MessageReference; // data showing the source of a crosspost, channel follow add, pin, or reply message
    flags?: number; // message flags combined as a bitfield
    referenced_message?: Message; // the message associated with the message_reference
    interaction?: MessageInteraction; // deprecated in favor of interaction_metadata - sent if the message is a response to an interaction
    thread?: ChannelModel; // the thread that was started from this message, includes thread member object
    components?: any[]; // sent if the message contains components like buttons, action rows, or other interactive components
    sticker_items?: StickerItem[]; // array of message sticker item objects
    stickers?: Sticker[]; // deprecated - the stickers sent with the message
    position?: number; // a generally increasing integer (there may be gaps or duplicates) that represents the approximate position of the message in a thread, it can be used to estimate the relative position of the message in a thread in company with total_message_sent on parent thread
    role_subscription_data?: any; // role_subscription_data object - data of the role subscription purchase or renewal that prompted this ROLE_SUBSCRIPTION_PURCHASE message
    resolved?: any; // resolved data - data for users, members, channels, and roles in the message's auto-populated select menus
    poll?: any; // poll object
    call?: any; // call object - the call associated with the message
  }
  