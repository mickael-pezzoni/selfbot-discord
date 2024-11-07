import { Assistant } from "./class/assistant";

const OPEN_AI_URL = 'https://api.openai.com/v1/';
const OPEN_AI_APi_KEY = process.env['OPEN_AI_API_KEY'];
export class MyBot extends Assistant {

    constructor(instruction: string) {
        super(instruction)
    }

    async completion(): Promise<{
        role: 'assistant',
        content: string,
    }> {
        const response = await fetch(`${OPEN_AI_URL}/chat/completions`, {
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: this.messages
            }),
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_APi_KEY}`
            }
        })

        if (response.status !== 200) {
            throw new Error(`Canot ask assitant {${response.statusText}}`);
        }

        const results = await response.json() as ChatCompletion;
        const lastChoice = results.choices.at(-1);
        return {
            role: 'assistant',
            content: lastChoice?.message.content ?? ''
        }
    }

}

interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    system_fingerprint: string;
    choices: Choice[];
    usage: Usage;
  }
  
  interface Choice {
    index: number;
    message: Message;
    logprobs: null | any; // Replace 'any' with a more specific type if known
    finish_reason: string;
  }
  
  interface Message {
    role: string;
    content: string;
  }
  
  interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }
  