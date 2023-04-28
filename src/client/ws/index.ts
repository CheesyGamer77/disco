import { WebSocket } from 'ws';
import type {
    GatewayHelloPayload,
    GatewayOpcode,
    GatewayPayload,
    SendablePayload,
    GatewayDispatchPayload,
    GatewayReadyData,
    GatewayInvalidSessionData
} from './types';
import { setTimeout, setInterval, clearInterval } from 'node:timers';
import process from 'node:process';
import { EventEmitter } from 'node:events';
import { API_VERSION } from '../..';

type WebSocketState = 'SHUTDOWN' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes
const closeCodes = new Map<number, boolean>([
    [4000, true],
    [4001, true],
    [4002, true],
    [4003, true],
    [4004, false],
    [4005, true],
    [4006, true],
    [4007, true],
    [4008, true],
    [4009, true],
    [4010, false],
    [4011, false],
    [4012, false],
    [4013, false],
    [4014, false],
]);

export class WebSocketClient extends EventEmitter {
    private readonly token: string;
    private ws?: WebSocket;
    private _state: WebSocketState = 'SHUTDOWN';
    private resumeUrl?: string;
    private sid?: string;
    private heartbeatInterval?: ReturnType<typeof setInterval>;
    private lastHeartbeatWasAcked = true;
    private sequenceNumber: number | null = null;
    private resumeOptions = `?v=${API_VERSION}&encoding=json` as const;
    private readonly intents: number;

    get state() {
        return this._state;
    }

    constructor(token: string, intents: number) {
        super();
        this.token = token;
        this.intents = intents;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async sendPayload(payload: SendablePayload<any>) {
        await this.ws?.send(JSON.stringify(payload));
    }

    async connect(url: string, identify = true) {
        clearInterval(this.heartbeatInterval);
        this._state = identify ? 'CONNECTING' : 'RECONNECTING';
        const formatted_url = `${url}/${this.resumeOptions}`;
        console.log(`Connecting to gateway url ${formatted_url}`);
        this.ws = new WebSocket(formatted_url)
            .on('open', () => {
                if (!identify) {
                    // https://discord.com/developers/docs/topics/gateway-events#resume-resume-structure
                    this.sendPayload({
                        op: GatewayOpcode.Resume,
                        d: {
                            token: this.token,
                            session_id: this.sid,
                            seq: this.sequenceNumber
                        }
                    });
                }
            })
            .on('message', (message: string) => this.onRawMessage(message))
            .on('close', (code: number) => this.onClose(code));
    }

    private async sendHeartbeat() {
        if (!this.lastHeartbeatWasAcked || !(this.state == 'CONNECTING' || this.state == 'RECONNECTING' || this.state == 'CONNECTED')) {
            // TODO: Add disconnect logic
            console.warn(`Last heartbeack was not acked by Discord! Did we lose connection?`);
            clearInterval(this.heartbeatInterval);
            return;
        }

        this.lastHeartbeatWasAcked = false;
        console.log(`Sending heartbeat (sequence: ${this.sequenceNumber})`);

        await this.sendPayload({
            op: GatewayOpcode.Heartbeat,
            d: this.sequenceNumber
        });
    }

    private async onRawMessage(message: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.onJsonMessage(JSON.parse(message) as GatewayPayload<any>);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async onJsonMessage(data: GatewayPayload<any>) {
        console.log(`Received op ${data.op} (${GatewayOpcode[data.op]})`);

        switch (data.op) {
            case GatewayOpcode.Dispatch: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await this.onDispatch(data as GatewayDispatchPayload<any>);
                break;
            }
            case GatewayOpcode.Hello: {
                const payload = data as GatewayHelloPayload;

                const interval = payload.d.heartbeat_interval;
                const jitter = interval * Math.random();

                console.log(`Waiting to send first heartbeat (${jitter}ms)`);

                setTimeout(() => {
                    console.log('Sending first heartbeat');
                    this.sendHeartbeat();
                    this.heartbeatInterval = setInterval(() => {
                        this.sendHeartbeat();
                    }, interval);
                }, jitter);

                if (this.state == 'CONNECTING') {
                    console.log('Sending identify');
                    await this.sendPayload({
                        op: GatewayOpcode.Identify,
                        d: {
                            token: this.token,
                            properties: {
                                os: process.platform,
                                browser: 'Disco',
                                device: 'Disco'
                            },
                            compress: false,
                            large_threshold: 200,
                            shard: [0, 1],
                            presence: {
                                since: null,
                                activities: [],
                                status: 'online',
                                afk: false
                            },
                            intents: this.intents
                        }
                    });
                }

                break;
            }
            case GatewayOpcode.Heartbeat: {
                // TODO: It's not clear as to whether the heartbeat interval needs to be reset in this case
                await this.sendHeartbeat();
                break;
            }
            case GatewayOpcode.HeartbeatAck: {
                this.lastHeartbeatWasAcked = true;
                break;
            }
            case GatewayOpcode.Reconnect: {
                console.log('Received reconnect request! Reconnecting...');
                await this.reconnect();
                break;
            }
            case GatewayOpcode.InvalidSession: {
                const can_resume = data.d as GatewayInvalidSessionData;
                if (can_resume) {
                    console.log('Session invalidated, but is resumable');
                    await this.reconnect();
                    return;
                }

                console.warn('Session invalidated and non-resumable!');
                await this.ws?.close(1001);
                await this.disconnect();
                break;
            }
            default: {
                console.warn(`Received unknown Gateway Event! Payload: ${JSON.stringify(data, undefined, 4)}`);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async onDispatch(data: GatewayDispatchPayload<any>) {
        console.log(`Received Dispatch Event: ${data.t}`);
        this.sequenceNumber = data.s;

        switch (data.t) {
            // https://discord.com/developers/docs/topics/gateway-events#ready
            case 'READY': {
                this._state = 'CONNECTED';
                const d = data.d as GatewayReadyData;
                this.resumeUrl = d.resume_gateway_url;
                this.sid = d.session_id;
                break;
            }
            default: {
                console.warn(`Received unknown gateway dispatch (${data.t})! Data: ${JSON.stringify(data.d, undefined, 4)}`);
                break;
            }
        }
    }

    private async onClose(code: number) {
        const canReconnect = closeCodes.get(code) ?? false;

        if (!canReconnect) {
            console.error(`Got disconnected with non-resumable close code ${code}`);
            await this.ws?.close(1001);
            await this.disconnect();
        } else {
            console.warn(`Got disconnected with resumable close code ${code}. Attempting to reconnect...`);
            await this.connect(this.resumeUrl ?? '', false);
        }
    }

    async disconnect() {
        clearInterval(this.heartbeatInterval);
        this._state = 'SHUTDOWN';
        this.sequenceNumber = null;
        this.sid = undefined;
    }

    private async reconnect() {
        this._state = 'RECONNECTING';
        await this.connect(this.resumeUrl ?? '', false);
    }
}
