import { DecodedSnowflake } from "../model";

/* 
 https://discord.com/developers/docs/reference#snowflakes
*/
export class Snowflake {
    static readonly EPOCH = 1420070400000n;
    #snowflake: string;
    #decodedSnowflake: DecodedSnowflake;
    constructor(snowflake: string) {
        this.#snowflake = snowflake;
        this.#decodedSnowflake = this.#decode();
    }

    decode(): DecodedSnowflake {
        return this.#decodedSnowflake;
    }

    #decode(): DecodedSnowflake {
        const bigIntSnowflake = BigInt(this.#snowflake);

        // Décalage des bits pour obtenir l'horodatage
        const timestamp = Number((bigIntSnowflake >> 22n));

        // Décalage et masquage pour obtenir l'ID du travailleur interne
        const workerId = Number((bigIntSnowflake & 0x3E0000n) >> 17n);

        // Décalage et masquage pour obtenir l'ID du processus interne
        const processId = Number((bigIntSnowflake & 0x1F000n) >> 12n);

        // Masquage pour obtenir l'incrément
        const increment = Number(bigIntSnowflake & 0xFFFn);

        return { timestamp, workerId, processId, increment };
    }
    private get now(): bigint {
        return BigInt(Date.now()) - Snowflake.EPOCH;
    }

    #increment(timestamp: bigint): number {
        console.log(BigInt(this.#decodedSnowflake.timestamp), timestamp, BigInt(this.#decodedSnowflake.timestamp) === timestamp)
        if (BigInt(this.#decodedSnowflake.timestamp) === timestamp) {
            return (this.#decodedSnowflake.increment + 1) & 0xFFF;
        }
        return Number(timestamp);
    }
    #timestamp(increment: number): bigint {
        const timestamp = this.now;
        if (increment === 0) {
            while (this.now <= timestamp){}
            return this.now;;
        }
        return timestamp;

    }
    next(): Snowflake {
        // Obtenir l'horodatage actuel
 
        const timestamp = this.#timestamp((this.#decodedSnowflake.increment + 1) & 0xFFF);
        console.log('timestamp ', timestamp);
        const increment = this.#increment(timestamp)


        // Assurez-vous que les IDs et l'incrément sont dans leurs limites respectives
        const workerId = this.#decodedSnowflake.workerId & 0x1F; // max 5 bits (0-31)
        const processId = this.#decodedSnowflake.processId & 0x1F; // max 5 bits (0-31)

        // Construire les différentes parties du Snowflake
        const timePart = timestamp << 22n;
        const workerPart = BigInt(workerId) << 17n;
        const processPart = BigInt(processId) << 12n;
        const incrementPart = BigInt(increment);

        // Combiner toutes les parties pour créer le Snowflake final
        const snowflake = timePart | workerPart | processPart | incrementPart;
        return new Snowflake(snowflake.toString());
    }


    toString(): string {
        return this.#snowflake;
    }

}

/* 
const snowFlake = new Snowflake(1250415230274764843)
snowFlake.decode();
snowFlake.next();

*/