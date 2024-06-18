import process from 'node:process';
import { DiscordClient } from './class/discord_client';
import { configDotenv } from 'dotenv';



configDotenv({ path: '.env' })
const discordToken = process.env['DISCORD_TOKEN'];
if (discordToken === undefined || discordToken === '') {
    throw new Error('Token error')
}


(async () => {
    const discordClient = new DiscordClient(discordToken);
    await discordClient.initialize();

    console.log(discordClient.user);

    discordClient.wsConnect(async (event) => {
        if (event.isMsgEvent(event.data)) {
            if (event.data.d.author.id !== discordClient.user.id) {
                event.react('%F0%9F%91%8D')
                //event.reply('Test');
            }
        }
    })

})()