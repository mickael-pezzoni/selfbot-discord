import { DiscordError } from "../channel.model";
import { EventEntity } from "../model";
import { Channel } from "./channel";

export abstract class DiscordWsEventImpl<T> {
  abstract data: EventEntity;
  type?: string;
  s?: unknown;
  target?: WebSocket;

  abstract execute(): Promise<DiscordError | T | void>;
}
