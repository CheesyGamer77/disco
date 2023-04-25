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

export type GatewayDispatchEvent = 'READY';
export type GatewayDispatchPayload<T> = GatewayPayload<T> & {
    s: number,
    t: GatewayDispatchEvent
}

// https://discord.com/developers/docs/topics/gateway-events#ready-ready-event-fields
// TODO: implement user type
// TODO: implement unavailable guild type
// TODO: implement application type
export type GatewayReadyData = {
    v: number,
    user: any,
    guilds: UnavailableGuild[],
    session_id: string,
    resume_gateway_url: string,
    shard: [number, number],
    application: any
}

export type GatewayInvalidSessionData = boolean;
