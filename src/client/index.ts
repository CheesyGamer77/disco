import { GuildCache } from '../util/cache';
import { HTTPClient } from './http';
import { WebSocketClient } from './ws';
import { EventEmitter } from 'node:events';

/**
 * Represents a Discord client backed by both the Discord HTTP and WebSocket APIs.
 */
export class DiscordClient extends EventEmitter {
    public readonly ws: WebSocketClient;
    public readonly http: HTTPClient;

    public readonly guilds: GuildCache;

    // TODO: Implement presence
    constructor(token: string, intents: number) {
        super();
        this.http = new HTTPClient(token);
        this.ws = new WebSocketClient(token, intents)
            .on('GUILD_CREATE', (guild) => {
                console.log(`Caching guild with id ${guild.id}`);
                this.guilds.set(guild.id, guild);
            });

        this.guilds = new GuildCache(this.http);
    }

    async connect() {
        const { url, shards } = await this.http.getGatewayBot();

        console.log(`Obtaining gateway connection with ${shards} recommended shards`);

        // TODO: Implement compression
        await this.ws.connect(url);
        this.emit('ready');
    }
}

// https://stackoverflow.com/a/61609010
export interface DiscordClient {
    on<U extends keyof ClientEvents>(event: U, listener: ClientEvents[U]): this;
    emit<U extends keyof ClientEvents>(event: U, ...args: Parameters<ClientEvents[U]>): boolean;
}

interface ClientEvents {
    /**
     * Emitted when the client has fully initialized its cache
     */
    'ready': () => void;
}
