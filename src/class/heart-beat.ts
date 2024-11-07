import { HeartBeat } from "../model";
import { DiscordWsEventImpl } from "./ws-event";

export class DiscordHeartBeatEvent extends DiscordWsEventImpl {
    data: HeartBeat;

    constructor(data: HeartBeat) {
        super();
        this.data = data;
    }

    execute(): Promise<void> {
        return Promise.resolve();
    }
}