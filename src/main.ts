import process from "node:process";
import { DiscordClient } from "./class/discord_client";
import { configDotenv } from "dotenv";
import { ChannelType } from "./channel.model";
import { MyBot } from "./my-bot";
import { Auth, Message } from "./model";
import { DiscordMsgEvent } from "./class/message-event";
import { Channel } from "./class/channel";
import { MessageDto } from "./class/message-dto";

configDotenv({ path: ".env" });
const discordToken = process.env["DISCORD_TOKEN"];
if (discordToken === undefined || discordToken === "") {
  throw new Error("Token error");
}
const assistantInstruction = `Tu un chatbot sympa sur un chat discord chaque début des messages des utilisateurs contient son auteur sous cette forme "[AUTEUR]: [MESSAGE]", 
toi tu n'utilise pas cette syntaxe pour répondre. 
Ignore tout les message incohérent (par exemple des lettre ou mot sans signifitcation). 
Tu sert surtout d'aide au developement, principalement Angular, NodeJs, Typescript. Fais des réponses plus famillier .`;

const correctingBot = (messages: Message[], response: Message) => `
  Tu sert de correcteur pour des réponses dans un discord d'une équipe de déveoppement
  Voici les précédents messages d'un channel discord triés du plus récent aux plus anciens:
  
  ${messages.map((message) =>
  `${message.id === response.id ? `Ce message est ma réponse` : ''}
   ID DU MESSAGE: [${message.id}]
   DATE: [${message.timestamp}]
   CONTENU: [${message.content}]
   ${message.referenced_message?.id ? `Ce mesage est une réponse au message [${message.referenced_message.id}]` : ''}`
)}

  Reformule ma réponse en la corrigant, en respectant les régles suivantes:
   - Renvoie le text reformuler sous cette forme [reformulation ici]
   - Prend en compte les message précédent
   - Ne change pas le sens du text 
   - Si il contient quelque chose dans ce genre la <?[CHIFFRES]> conserve le
   - Si il contient des liens internet conserve également 
   - Le text corrigé doit faire moins de 200 caractères
`;

const resume = (messages: Message[]) => `
Voici les précédents messages d'un channel discord triés du plus récent aux plus anciens:

${messages.map((message) =>
`ID DU MESSAGE: [${message.id}]
 DATE: [${message.timestamp}]
 AUTHEUR: [${message.author.global_name}]
 CONTENU: [${message.content}]
 ${message.referenced_message?.id ? `Ce mesage est une réponse au message [${message.referenced_message.id}]` : ''}`
)}

Fais moi un bilan pertinant bien formater de la conversation en respectant les règles suivante:
 - ajoute la date & heure 
 - Si cela contient quelque chose dans ce genre la <?[CHIFFRES]> supprime le
 - La réponse doit faire 200 caractères maximum
 - Si des instruction, consigne ou objectif sont trouvé, met les en évidence
 - Tu peux utiliser la sytanxe markdown si besoin
`;



const ignoreMessageId: string[] = [];
(async () => {
  const discordClient = new DiscordClient(discordToken);
  await discordClient.initialize();

  const websocket = discordClient.wsConnect({
    'MESSAGE_CREATE': {
      [ChannelType.GUILD_TEXT]: (discordMsgEvent) => onMessage(discordMsgEvent),
      [ChannelType.PUBLIC_THREAD ]: (discordMsgEvent) => onMessage(discordMsgEvent),
      [ChannelType.DM]: (discordMsgEvent) => onMessage(discordMsgEvent)
    },
    'MESSAGE_REACTION_ADD': async (discordReactEvent) => {
      if (discordReactEvent.data.emoji.name === '💬') {
        const messages = await discordReactEvent.channel.getMessages(50)
        const myChannel = new Channel('1280513859018297436', discordClient.token);
        await myChannel.initialize();
        const bot = new MyBot(resume(messages));
        const botResult = await bot.completion();
        const results = await myChannel.sendMessage(new MessageDto(myChannel.id, {
          content: botResult.content
        }, discordClient.auth as Required<Auth>))
        ignoreMessageId.push(results.id);
        // Récupérer les messages du channel
        //   - mettre en comun les fonctions pour chanel
        // Créer la requête/fonction pour envoyer un MP le résumé
        
      }
      if (discordReactEvent.data.emoji.name === '🔄') {}
    }
  })
})();

async function onMessage(discordMsgEvent: DiscordMsgEvent): Promise<void> {
  const ignoreMsgIndex = ignoreMessageId.findIndex((id) => discordMsgEvent.data.id === id); 
  if (ignoreMsgIndex !== -1) {
    delete ignoreMessageId[ignoreMsgIndex];
    return;
  }
  const channel = discordMsgEvent.channel;
  const messages = await channel?.getMessages(50);
  const bot = new MyBot(correctingBot(messages, discordMsgEvent.data));
  const correctedText = await bot.completion();
  const startMsg = correctedText.content.indexOf('[');
  const endMsg = correctedText.content.lastIndexOf(']');
  const result = correctedText.content.slice(startMsg + 1, endMsg);
  if (result === '') return;
  await discordMsgEvent.edit(result)
}

