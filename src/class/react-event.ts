import { Reaction } from "../channel.model";
import { Auth, EventEntity, Message } from "../model";
import { createHeaders } from "../utils/request.utils";
import { Channel } from "./channel";
import { DISCORD_API_URL } from "./discord_client";
import { DiscordWsEventImpl } from "./ws-event";

export class DiscordReactEvent extends DiscordWsEventImpl<unknown> {
  data: Reaction;
  #channel?: Channel;
  #auth: Required<Auth>;
  #userFunction: (param: DiscordReactEvent) => void | Promise<void>;
  constructor(
    data: Reaction,
    userFunction: (param: DiscordReactEvent) => void | Promise<void>,
    auth: Required<Auth>,
  ) {
    super();
    this.data = data;
    this.#auth = auth;
    this.#userFunction = userFunction;
  }

  get channel(): Channel {
    if (!this.#channel) {
      throw new Error("Channel not found");
    }
    return this.#channel;
  }

  async initialize(): Promise<void> {
    this.#channel = new Channel(this.data.channel_id, this.#auth.token);
    await this.#channel.initialize();
  }
  async execute(): Promise<void> {
    this.#userFunction(this);
  }

  async getMessage(): Promise<Message> {
    const response = await fetch(
      `${DISCORD_API_URL}/channels/${this.data.channel_id}/messages/${this.data.message_id}`,
      { headers: createHeaders(this.#auth.token) },
    );
    console.log(await response.text());
    if (response.status !== 200) {
      throw new Error(`Cannot get message {${response.statusText}}`);
    }
    return response.json();
  }
}
