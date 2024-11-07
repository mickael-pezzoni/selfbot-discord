import { EventEntity } from "../model";
import { Channel } from "./channel";

export abstract class DiscordWsEventImpl {
    abstract data: EventEntity
    type?: string;
    s?: unknown;
    target?: WebSocket;

    abstract execute(): Promise<void>;

    
}