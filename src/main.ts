import process from 'node:process';
import { DiscordClient } from './class/discord_client';
import { configDotenv } from 'dotenv';
import { writeFile } from 'fs/promises'
import { ChannelType } from './channel.model';
import { MsgEvent } from './class/message-event';
import { CreateMessageEvent } from './model';


configDotenv({ path: '.env' })
const discordToken = process.env['DISCORD_TOKEN'];
if (discordToken === undefined || discordToken === '') {
    throw new Error('Token error')
}


(async () => {
    const discordClient = new DiscordClient(discordToken);
    await discordClient.initialize();

    const websocket = discordClient.wsConnect({
        [ChannelType.DM]: (event) => onRcvMessage(event, discordClient),
        [ChannelType.GROUP_DM]: (event) => onRcvMessage(event, discordClient)
    })

})()


async function onRcvMessage(event: MsgEvent<CreateMessageEvent>, discordClient: DiscordClient) {

}