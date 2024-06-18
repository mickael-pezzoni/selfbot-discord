import {WebSocket, MessageEvent, ErrorEvent, Event, CloseEvent} from 'ws'
import { Auth, HelloEvent, User } from '../model';
import { MsgEvent } from './message-event';
import { Queue } from './Queue';

export class WebSocketClient {
    #ws?: WebSocket;
    #auth: Auth;
    #url: string;
    #heartbeatInterval?: number;
    #queue = new Queue();
    #heartbeatIntervalTiemout?: NodeJS.Timeout;
    #cbMsg: (event: MsgEvent) => void;
    constructor(url: string, auth: Auth, cbMsg: (event: MsgEvent) => void) {
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
    
        this.ws.addEventListener('open', (ev) => this.onOpenConnection(ev));
    
        this.ws
        .addEventListener('close', (ev) => this.onClose(ev));
    
        this.ws.addEventListener('message', (event) => {
            const msgEvent = new MsgEvent({
                ...event,
                data: JSON.parse(event.data.toString()),
            }, this.auth);

            if (msgEvent.isHelloEvent(msgEvent.data)) {
                this.onMessage(msgEvent)
            } else {
                this.#queue.add(() => this.onMessage(msgEvent));
            }
        });
    }

    async onMessage(messageEvent: MsgEvent): Promise<void> {
        await messageEvent.initialize();
        if (messageEvent.isHelloEvent(messageEvent.data)) {
            this.#heartbeatInterval = messageEvent.data.d.heartbeat_interval;
            console.log('current heartbeatInterval ', this.#heartbeatInterval)
            this.#sendHeartbeatInterval();
            } else {
           await this.#cbMsg(messageEvent);
        }
    }

    onOpenConnection(event: Event): void {
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