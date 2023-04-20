// https://discord.com/developers/docs/topics/gateway#session-start-limit-object
export type SessionStartLimit = {
    total: number,
    remaining: number,
    reset_after: number,
    max_concurrency: number
}

// https://discord.com/developers/docs/topics/gateway#get-gateway-bot-json-response
export type GetGatewayBotResponse = {
    url: string,
    shards: number,
    session_start_limit: SessionStartLimit
}

// https://discord.com/developers/docs/reference#error-messages
export type DiscordError = {
    code: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any
}
