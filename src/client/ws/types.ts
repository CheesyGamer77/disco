import { GatewayEvents } from '.';
import { UnavailableGuild } from '../types';

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
export enum GatewayOpcode {
    Dispatch,
    Heartbeat,
    Identify,
    PresenceUpdate,
    VoiceStateUpdate,
    // opcode 5 doesn't exist for some reason :shrug:
    Resume = 6,
    Reconnect,
    RequestGuildMembers,
    InvalidSession,
    Hello,
    HeartbeatAck
}

// https://discord.com/developers/docs/topics/gateway-events#payload-structure
export type GatewayPayload<T> = {
    op: GatewayOpcode
    d: T
    s: number | null,
    t: string | null
}
export type SendablePayload<T> = Omit<GatewayPayload<T>, 's' | 't'>

// https://discord.com/developers/docs/topics/gateway#hello-event
type GatewayHelloData = {
    heartbeat_interval: number
}
export type GatewayHelloPayload = GatewayPayload<GatewayHelloData>;

export type GatewayDispatchEvent = keyof GatewayEvents;
export type GatewayDispatchPayload<T> = GatewayPayload<T> & {
    s: number,
    t: GatewayDispatchEvent
}

// https://discord.com/developers/docs/topics/gateway-events#ready-ready-event-fields
// TODO: implement user type
// TODO: implement application type
export type GatewayReadyData = {
    v: number,
    // TODO: implement user
    user: unknown,
    guilds: UnavailableGuild[],
    session_id: string,
    resume_gateway_url: string,
    shard: [number, number],
    // TODO: implement application
    application: unknown
}

export type GatewayInvalidSessionData = boolean;

// https://discord.com/developers/docs/topics/gateway#list-of-intents
export enum GatewayIntentBit {
    Guilds = 1 << 0,
    GuildMembers = 1 << 1,
    GuildModeration = 1 << 2,
    GuildEmojisAndStickers = 1 << 3,
    GuildIntegrations = 1 << 4,
    GuildWebhooks = 1 << 5,
    GuildInvites = 1 << 6,
    GuildVoiceStates = 1 << 7,
    GuildPresences = 1 << 8,
    GuildMessages = 1 << 9,
    GuildMessageReactions = 1 << 10,
    GuildMessageTyping = 1 << 11,
    DirectMessages = 1 << 12,
    DirectMessageReactions = 1 << 13,
    DirectMessageTyping = 1 << 14,
    MessageContent = 1 << 15,
    GuildScheduledEvents = 1 << 16,
    AutoModerationConfiguration = 1 << 20,
    AutoModerationExecution = 1 << 21
}
