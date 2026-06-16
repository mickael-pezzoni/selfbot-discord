import { Auth, Message } from "../model";
import { createHeaders, isDiscordError } from "../utils/request.utils";
import { MessageDto } from "./message-dto";
import { Channel } from "./channel";
import { DISCORD_API_URL } from "./discord_client";
import { DiscordWsEventImpl } from "./ws-event";
import { DiscordError, FunctionMessageType } from "../channel.model";

export class DiscordMsgEvent extends DiscordWsEventImpl<DiscordMsgEvent> {
  data!: Message;
  #channel?: Channel;
  #auth: Required<Auth>;
  #functionByChannel: FunctionMessageType;
  constructor(
    json: Message,
    auth: Required<Auth>,
    functionByChannel: FunctionMessageType,
  ) {
    super();
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
      throw new Error("Channel not found");
    }
    return this.#channel;
  }

  async edit(content: string): Promise<DiscordMsgEvent | DiscordError | void> {
    try {
      const response = await fetch(
        `${DISCORD_API_URL}/channels/${this.data.channel_id}/messages/${this.data.id}`,
        {
          body: JSON.stringify({ content }),
          method: "PATCH",
          headers: createHeaders(this.#auth.token),
        },
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        return {
          message: "Too many requests",
          retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
        } satisfies DiscordError;
      }
      if (response.status.toString().at(0) !== "2") {
        console.log(await response.text());
        throw new Error(`Cannot edit message {${response.status}}`);
      }
      return new DiscordMsgEvent(
        await response.json(),
        this.#auth,
        this.#functionByChannel,
      );
    } catch (err) {
      console.error(err);
    }
  }

  async reply(content: string): Promise<DiscordMsgEvent | DiscordError | void> {
    const oldSnowflake = this.data.id;
    const message = new MessageDto(
      this.data.channel_id,
      {
        content,
        referencesMessages: this.data,
        id: oldSnowflake,
      },
      this.#auth,
    );
    try {
      const result = await this.channel.sendMessage(message);
      if (isDiscordError(result)) {
        return result;
      }
      return new DiscordMsgEvent(result, this.#auth, this.#functionByChannel);
    } catch (err) {
      console.error(err);
    }
  }
  async #addReaction(emoji: string): Promise<DiscordError | void> {
    const response = await fetch(
      `${DISCORD_API_URL}/channels/${this.data.channel_id}/messages/${this.data.id}/reactions/${emoji}/@me`,
      { method: "PUT", headers: createHeaders(this.#auth.token) },
    );

    console.log(response.status);
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      return {
        message: "Too many requests",
        retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
      } satisfies DiscordError;
    }

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Cannot add reaction {${response.statusText}}`);
    }

    return;
  }

  async react(emoji: string): Promise<DiscordError | void> {
    try {
      return this.#addReaction(emoji);
    } catch (err) {
      console.error(err);
    }
    return;
  }

  async execute(): Promise<DiscordError | DiscordMsgEvent | void> {
    await this.initialize();
    const type = this.channel.channelEntity.type;
    if (type !== undefined && type in this.#functionByChannel) {
      return this.#functionByChannel?.[type]?.(this);
    }
  }
}
