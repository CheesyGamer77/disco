import { HTTPClient } from './http';
import { WebSocketClient } from './ws';

export class DiscordClient {
    protected ws: WebSocketClient;
    protected http: HTTPClient;

    // TODO: Implement intents
    // TODO: Implement presence
    constructor(token: string) {
        this.http = new HTTPClient(token);
        this.ws = new WebSocketClient(token);
    }

    async connect() {
        const { url, shards } = await this.http.getGatewayBot();

        console.log(`Obtaining gateway connection with ${shards} recommended shards`);

        // TODO: Implement compression
        await this.ws.connect(url);
    }
}
