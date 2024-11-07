import { ChannelType, FunctionMessageType, Reaction } from "./channel.model";
import { DiscordReactEvent } from "./class/react-event";

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
export const opCode = [
  0, // Dispatch
  1, // Heartbeat
  2, // Identify
  3, // Presence Update
  4, // Voice State Update
  6, // Resume 
  7, // Reconnect
  8, // Request Guild Members
  9, // Invalid Session
  10, // Hello
  11, // Heartbeat ACK
  31 // Request Soundboard Sounds
] as const

export const eventName = [
  'READY',
  'MESSAGE_CREATE',
  'PRESENCE_UPDATE',
  'SESSION_REPLACE',
  'MESSAGE_REACTION_ADD',
] as const;


export type EntityByEventName = {
  'READY': never,
  'MESSAGE_CREATE': Message,
  'PRESENCE_UPDATE': never,
  'SESSION_REPLACE': never,
  'MESSAGE_REACTION_ADD': Reaction
  null: HeartBeat
}


export type EventEntity = EntityByEventName[keyof EntityByEventName];
export type EventName = typeof eventName[number];
export type OpCode = typeof opCode[number];

export type ParamDiscordEvent = {
  'READY': () => Promise<void> | void,
  'MESSAGE_CREATE': FunctionMessageType,
  'PRESENCE_UPDATE': () => Promise<void> | void,
  'MESSAGE_REACTION_ADD': (param: DiscordReactEvent) => Promise<void> | void
};
export type EntityByOpCode = {
  10: HeartBeat
}
// Discord ws event
export interface DiscordWsEvent<T extends EventName | null = null> {
  t: T | null;
  s: number | null;
  op: OpCode;
  d: T extends EventName ? EntityByEventName[T] : EntityByOpCode[keyof EntityByOpCode];
}

export interface HeartBeat {
  heartbeat_interval: number
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
  type: ChannelType;
  tts: boolean;
  timestamp: string;
  pinned: boolean;
  nonce: string;
  mentions: any[];
  mention_roles: any[];
  referenced_message?: Message;
  mention_everyone: boolean;
  message_reference?: { channel_id: string, message_id: string, type: number }
  id: string;
  flags: number;
  embeds: any[];
  edited_timestamp: string | null;
  content: string;
  components: any[];
  guild_id: string;
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

export type AsyncFunction<T, P> = (...args: P[]) => Promise<T>; 
