export interface User {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string | null;
    accent_color: number;
    global_name: string;
    avatar_decoration_data: any | null; // Utiliser `any` si vous n'avez pas de structure spécifique pour cette propriété
    banner_color: string;
    clan: string | null;
    mfa_enabled: boolean;
    locale: string;
    premium_type: number;
    email: string;
    verified: boolean;
    phone: string | null;
    nsfw_allowed: boolean;
    linked_users: any[]; // Utiliser `any` si vous n'avez pas de structure spécifique pour les utilisateurs liés
    bio: string;
    authenticator_types: number[];
  }

  export interface Auth {
    user?: User,
    token: string
  }
  export interface DataEvent {
    t: null | 'READY' | 'MESSAGE_CREATE' | 'PRESENCE_UPDATE' | 'SESSIONS_REPLACE';
    s: number | null;
    op: number | null;
    d: unknown;

  }

  export interface HelloEvent extends DataEvent{
    t: null;
    d: {
      heartbeat_interval: number;
    }
  }

  export interface CreateMessageEvent extends DataEvent {
    t: 'MESSAGE_CREATE';
    d: Message;
  }
  
  export interface Author {
    username: string;
    public_flags: number;
    id: string;
    global_name: string;
    discriminator: string;
    clan: string | null;
    avatar_decoration_data: any | null;
    avatar: string;
  }
  
  export interface Message {
    type: number;
    tts: boolean;
    timestamp: string;
    pinned: boolean;
    nonce: string;
    mentions: any[];
    mention_roles: any[];
    mention_everyone: boolean;
    id: string;
    flags: number;
    embeds: any[];
    edited_timestamp: string | null;
    content: string;
    components: any[];
    channel_id: string;
    author: Author;
    attachments: any[];
  }

  export type CreateMessageDto = Partial<Message>;

  export interface DecodedSnowflake {
    timestamp: number;
    workerId: number;
    processId: number;
    increment: number;
  }