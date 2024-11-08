import { Auth, ParamDiscordEvent, User } from "../model";
import {WebSocket, MessageEvent} from 'ws'
import { WebSocketClient } from "./websocket";
import { createHeaders } from "../utils/request.utils";
import { FunctionMessageType } from "../channel.model";

export const WEBSOCKET_URL = 'wss://gateway.discord.gg/?v=9&encoding=json';

/* 
https://github.com/SealedSaucer/Online-Forever/blob/main/main.py
https://discord.com/developers/docs/topics/gateway#hello-event
1. connection
2. Lire heartbeat_interval
{
  t: null,
  s: null,
  op: 10,
  d: {
    heartbeat_interval: 41250,
    _trace: [ '["gateway-prd-us-east1-c-gg3m",{"micros":0.0}]' ]
  }
}
3. Emettre 

*/
export const DISCORD_API_URL = 'https://canary.discordapp.com/api/v9';
export class DiscordClient {
    auth: Auth
    #webSocket?: WebSocketClient;
    constructor(token: string) {
        this.auth = {
            token
        };
    }

    set user(user: User) {
        this.auth = {
            ...this.auth,
            user 
        };
    }

    get user(): User {
        if (this.auth.user === undefined ){
            throw new Error('User')
        }
        return this.auth.user
    }

    get token(): string {
        return this.auth.token
    }

    wsConnect(cb: Partial<ParamDiscordEvent>): WebSocketClient{
        this.#webSocket = new WebSocketClient(WEBSOCKET_URL, {
            token: this.token,
            user: this.user
        }, cb);

        return this.#webSocket;
    }
    
    async authMe(): Promise<User> {
        const respnose = await fetch(`${DISCORD_API_URL}/users/@me`, {headers: this.headers});

        if (respnose.status !== 200) {
            throw new Error('Your token might be invalid. Please check it again')
        }
        return await respnose.json()
    }

    async initialize(): Promise<void> {
        const user =  await this.authMe();
        this.auth.user = user;
    }


    private get headers() {
        return createHeaders(this.token)
    }


}
