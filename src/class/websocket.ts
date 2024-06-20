import {WebSocket, MessageEvent, ErrorEvent, Event, CloseEvent} from 'ws'
import { Auth, CreateMessageEvent, HelloEvent, User } from '../model';
import { MsgEvent } from './message-event';
import { Queue } from './queue';
import { EventFunction } from '../channel.model';

export class WebSocketClient {
    #ws?: WebSocket;
    #auth: Auth;
    #url: string;
    #heartbeatInterval?: number;
    #queue = new Queue();
    #heartbeatIntervalTiemout?: NodeJS.Timeout;
    #cbMsg: EventFunction;
    constructor(url: string, auth: Auth, cbMsg: EventFunction) {
        this.#auth = auth;
        this.#cbMsg = cbMsg;
        this.#url = url;
        this.connect();
    }

    connect() {
        this.#ws = new WebSocket(this.#url);
        this.listenEvent();
    }

    get ws(): WebSocket {
        if (this.#ws === undefined) {
            throw new Error('');
        }

        return this.#ws;
    }

    close(): void {
        this.#ws?.close();
    }

    get auth(): Required<Auth> {
        if (this.#auth.user === undefined) {
            throw new Error('Cannot be undefined');
        }

        return this.#auth as Required<Auth> ;
    }

    #authMe(): void {
        const auth = {
            op: 2,
            d: {
                token: this.#auth.token,
                properties: {
                    $os: "Windows 10",
                    $browser: "Google Chrome",
                    $device: "Windows",
                },
                presence: {status: "online", afk: false},
            },
            "s": null,
            "t": null,
        }
        this.ws.send(Buffer.from(JSON.stringify(auth), 'utf-8'))


    }

    listenEvent(): void {
        this.ws.addEventListener('error', (err) => this.onError(err));
    
        this.ws.addEventListener('open', (ev) => this.#onOpenConnection(ev));
    
        this.ws
        .addEventListener('close', (ev) => this.onClose(ev));
    
        this.ws.addEventListener('message', (event) => {
            const wsData = JSON.parse(event.data.toString());

            if ('op' in wsData && wsData.op === 10) {
                const msgEvent = new MsgEvent<HelloEvent>({
                    ...event,
                    data: JSON.parse(event.data.toString()),
                }, this.auth);
    
                this.#heartbeatInterval = msgEvent.data.d.heartbeat_interval;
                console.log('current heartbeatInterval ', this.#heartbeatInterval)
                this.#sendHeartbeatInterval();
            } else if ('t' in wsData && wsData.t === 'MESSAGE_CREATE') {
                const msgEvent = new MsgEvent<CreateMessageEvent>({
                    ...event,
                    data: JSON.parse(event.data.toString()),
                }, this.auth);
                this.#queue.add(() => this.onMessage(msgEvent as MsgEvent<CreateMessageEvent>));
            }
        });
    }

    async onMessage(messageEvent: MsgEvent<CreateMessageEvent>): Promise<void> {
        await messageEvent.initialize();
        const type = messageEvent?.channel?.channelEntity?.type;
        const isNotMe = messageEvent.data.d.author.id !== this.#auth.user?.id;
        if (type !== undefined && type in this.#cbMsg && isNotMe) {
            await this.#cbMsg?.[type]?.(messageEvent);
        }

    }

    #onOpenConnection(event: Event): void {
        this.#authMe();
        this.setStatus();
    }

    onError(errorEvent: ErrorEvent): void {}

    onClose(closeEvent: CloseEvent): void {}
    

    #sendHeartbeatInterval(): void {
        if (this.#heartbeatInterval === undefined) {
            throw new Error('heartbeatInterval')
        }
        this.#heartbeatIntervalTiemout?.unref();
        this.#heartbeatIntervalTiemout = setInterval(() => {
            console.log('Send heartbeatInterval')
            this.ws.send(JSON.stringify({op: 1, d: null}));
        },this.#heartbeatInterval)
    }

    setStatus(): void {
        const cstatus = {
            op: 3,
            d: {
                since: 0,
                activities: [
                    {
                        type: 4,
                        state: "",
                        name: "Custom Status",
                        id: "custom",
                    }
                ],
                status: "online",
                afk: false,
            },
        };
        this.ws.send(Buffer.from(JSON.stringify(cstatus), 'utf-8'))

    }


}