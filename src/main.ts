import process from 'node:process';
import { DiscordClient, WEBSOCKET_URL } from './class/discord_client';
import { configDotenv } from 'dotenv';
import { createAndInitalizeClass } from './utils/class.utils';
import { writeFile } from 'fs/promises'
import { Snowflake } from './class/snowflake';



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
        if (event.isMsgEvent(event.data) && event.data.d.channel_id === '') {
            if (event.data.d.author.id !== discordClient.user.id) {
                event.reply(event.data.d.channel_id, 'Test')
            }
        }
    })




    // const snowFake = ['1250415204106375258']
    //  const op = Array.from(Array(32).keys()).map((_, i) => async () => {
    //     // dernier & decoder
    //     const lastGenerated = snowFake[snowFake.length - 1];
    //     const snowFakeImpl = new Snowflake(lastGenerated)
    //     // decode
    //     const decoded = snowFakeImpl.decode();
    //     // ecrit dans le fichier
    //     await writeFile('./ids', `ID: ${snowFakeImpl.toString()} timestamp: ${snowFakeImpl.decode().timestamp} workId: ${snowFakeImpl.decode().workerId} processId: ${snowFakeImpl.decode().processId} increment: ${snowFakeImpl.decode().increment}\r\n`, { encoding: 'utf-8', flag: 'a+' })
    //     const next = snowFakeImpl.next()
    //     if (i !== 0) {
    //         snowFake.push(next.toString())
    //     }
    // })

    // for (const promise of op) {
    //     await sleep(2000);
    //     await promise();
    // }


})()

function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, time)
    })
}