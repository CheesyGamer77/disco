import { VERSION } from '../..';
import { DiscordRequest } from './requests';
import { type GetGatewayBotResponse } from './types';

export const API_ROOT = `https://discord.com/api/v10` as const;

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Discord HTTP API Client
 */
export class HTTPClient {
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }

    private get defaultHeaders() {
        return {
            'User-Agent': `DiscordBot (https://github.com/CheesyGamer77/disco, ${VERSION})` as const
        };
    }

    get authHeaders() {
        return {
            ...this.defaultHeaders,
            Authorization: `Bot ${this.token}` as const
        };
    }

    async getGatewayBot(): Promise<GetGatewayBotResponse> {
        return await new DiscordRequest<GetGatewayBotResponse>('GET', '/gateway/bot').run(this.authHeaders);
    }
}
