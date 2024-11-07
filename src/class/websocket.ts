import { WebSocket, MessageEvent, ErrorEvent, Event, CloseEvent } from 'ws'
import { Auth, DiscordWsEvent, EventEntity, EventName, OpCode, ParamDiscordEvent, } from '../model';
import { DiscordMsgEvent } from './message-event';
import { Queue } from './queue';
import { DiscordWsEventImpl } from './ws-event';
import { DiscordHeartBeatEvent } from './heart-beat';
import { FunctionMessageType } from '../channel.model';
import { DiscordReactEvent } from './react-event';

export class WebSocketClient {
    #ws?: WebSocket;
    #auth: Auth;
    #url: string;
    #heartbeatInterval?: number;
    #queue = new Queue();
    #heartbeatIntervalTiemout?: NodeJS.Timeout;
    opCodeByImpl: Partial<Record<OpCode, (data: DiscordWsEvent<null>) => DiscordWsEventImpl | undefined>> = {
        0: undefined,
        1: undefined,
        2: undefined,
        3: undefined,
        4: undefined,
        6: undefined,
        7: undefined,
        8: undefined,
        9: undefined,
        10: (data: DiscordWsEvent<null>) => {
            const event = new DiscordHeartBeatEvent(data.d);
            this.#heartbeatInterval = event.data.heartbeat_interval;
            this.#sendHeartbeatInterval()

            return event;
        },
        11: undefined,
        31: undefined
    }

    discordEventNameByImpl: Record<EventName, ((data: DiscordWsEvent<EventName>) => Promise<DiscordWsEventImpl | void>) | undefined> = {
        READY: undefined,
        MESSAGE_CREATE: async (data: DiscordWsEvent<EventName>) => {
            const messageFunction = this.#functionByParamDiscordEvent.MESSAGE_CREATE;
            if (!messageFunction) return;
            const msgEvent = new DiscordMsgEvent((data as DiscordWsEvent<'MESSAGE_CREATE'>).d, this.auth, messageFunction);
            await msgEvent.initialize();
            return msgEvent;
        },
        PRESENCE_UPDATE: undefined,
        SESSION_REPLACE: undefined,
        MESSAGE_REACTION_ADD: async (data: DiscordWsEvent<EventName>) => {
            const reactFunction = this.#functionByParamDiscordEvent.MESSAGE_REACTION_ADD;
            if (!reactFunction) return;
            const reactEvent = new DiscordReactEvent((data as DiscordWsEvent<'MESSAGE_REACTION_ADD'>).d, reactFunction, this.auth);
            await reactEvent.initialize()
            return reactEvent;
        }
    }
    #functionByParamDiscordEvent: Partial<ParamDiscordEvent>;
    constructor(url: string, auth: Auth, functionByParamDiscordEvent: Partial<ParamDiscordEvent>) {
        this.#auth = auth;
        this.#functionByParamDiscordEvent = functionByParamDiscordEvent;
        this.#url = url;
        this.connect();
    }

    connect() {
        console.log('connect ws');
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

        return this.#auth as Required<Auth>;
    }

    #authMe(): void {
        const auth = {
            op: 2,
            d: {
                token: this.#auth.token,
                properties: {
                    $os: "Windows 10",
                    $browser: "Google Chrome",
                    $device: "Windows",
                },
                presence: { status: "online", afk: false },
            },
            "s": null,
            "t": null,
        }
        this.ws.send(Buffer.from(JSON.stringify(auth), 'utf-8'))


    }

    listenEvent(): void {
        this.ws.addEventListener('open', (ev) => {
            this.#onOpenConnection(ev)
            this.ws.addEventListener('error', (err) => this.onError(err));


            this.ws
                .addEventListener('close', (ev) => this.onClose(ev));
    
            this.ws.addEventListener('message', async (event) => {
                // op = 1 = sendHeartbeatInterval
                const wsData: Omit<DiscordWsEvent<never>, 'd'> & { d: unknown } = JSON.parse(event.data.toString());
    
                const wsDataTyped = wsData as DiscordWsEvent<EventName | null>;
                if (wsDataTyped.t !== null) {
                    const discordEventImpl = await this.discordEventNameByImpl[wsDataTyped.t]?.(wsDataTyped as DiscordWsEvent<EventName>)
                    this.#queue.add(() => discordEventImpl?.execute() ?? Promise.resolve())
                    return;
                }
    
                const opCodeDiscordEvent = this.opCodeByImpl[wsData.op]?.(wsDataTyped as DiscordWsEvent<null>);
                await opCodeDiscordEvent?.execute();
    
    
                /*  if ('op' in wsData && wsData.op === 11) {
                      const msgEvent = new MsgEvent<HelloEvent>({
                          ...event,
                          data: JSON.parse(event.data.toString()),
                      }, this.auth); 
                  }
                  else if ('op' in wsData && wsData.op === 10) {
                      const msgEvent = new MsgEvent<never>({
                          ...event,
                          data: JSON.parse(event.data.toString()),
                      }, this.auth);
                      console.log('heartbeat_interval ', msgEvent.data.d.heartbeat_interval)
                      this.#heartbeatInterval = msgEvent.data.d.heartbeat_interval;
                      this.#sendHeartbeatInterval();
                  } else if ('t' in wsData && wsData.t === 'MESSAGE_CREATE') {
                      const msgEvent = new MsgEvent<CreateMessageEvent>({
                          ...event,
                          data: JSON.parse(event.data.toString()),
                      }, this.auth);
                      this.#queue.add(() => this.onMessage(msgEvent as MsgEvent<CreateMessageEvent>));
                  } else {
                      console.log(wsData)
                  }*/
            });
        })
    }

    /*async onMessage(messageEvent: DiscordMsgEvent): Promise<void> {
        console.log(`${[new Date().toISOString()]} message d'origine: ${messageEvent.data.content}` )
        await messageEvent.initialize();
        const type = messageEvent?.channel?.channelEntity?.type;
        const isNotMe = messageEvent.data.author.id !== this.#auth.user?.id;
        const isMe = messageEvent.data.author.id === this.#auth.user?.id;
        if (type !== undefined && type in this.#cbMsg && isMe) {
            await this.#cbMsg?.[type]?.(messageEvent);
        }

    }*/

    #onOpenConnection(event: Event): void {
        this.#authMe();
        this.setStatus();
    }

    onError(errorEvent: ErrorEvent): void { }

    onClose(closeEvent: CloseEvent): void {
        console.log('ws close');
        this.connect();
    }

    send(input: unknown): void {
        this.ws.send(JSON.stringify(input));
    }


    #sendHeartbeatInterval(): void {
        if (this.#heartbeatInterval === undefined) {
            throw new Error('heartbeatInterval')
        }
        this.#heartbeatIntervalTiemout?.unref();
        this.#heartbeatIntervalTiemout = setInterval(() => {
            this.send({ op: 1, d: null });
        }, this.#heartbeatInterval)
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