import { EventEmitter, WebSocket } from 'ws';
import { type GatewayHelloPayload, GatewayOpcode, type GatewayPayload, type SendablePayload, type GatewayDispatchPayload } from './types';
import { setTimeout, setInterval, clearInterval } from 'node:timers';
import process from 'node:process';

type WebSocketState = 'SHUTDOWN' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';

export class WebSocketClient extends EventEmitter {
    private readonly token: string;
    private ws?: WebSocket;
    private _state: WebSocketState = 'SHUTDOWN';
    private resumeUrl?: string;
    private sid?: string;
    private heartbeatInterval?: ReturnType<typeof setInterval>;
    private lastHeartbeatWasAcked = true;
    private sequenceNumber: number | null = null;

    get state() {
        return this._state;
    }

    constructor(token: string) {
        super();
        this.token = token;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async sendPayload(payload: SendablePayload<any>) {
        await this.ws?.send(JSON.stringify(payload));
    }

    async connect(url: string) {
        if (this.state != 'SHUTDOWN') return;

        this._state = 'CONNECTING';
        this.ws = new WebSocket(url)
            .on('message', (message: string) => this.onRawMessage(message));
    }

    private async sendHeartbeat() {
        if (!this.lastHeartbeatWasAcked || !(this.state == 'CONNECTING' || this.state == 'RECONNECTING')) {
            // TODO: Add disconnect logic
            console.warn(`Last heartbeack was not acked by Discord! Did we lose connection?`);
            clearInterval(this.heartbeatInterval);
            return;
        }

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
        this.sequenceNumber = data.s ?? this.sequenceNumber;

        console.log(`Received op ${data.op} (${GatewayOpcode[data.op]})`);

        switch (data.op) {
            case GatewayOpcode.Dispatch: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await this.onDispatch(data as GatewayDispatchPayload<any>);
                break;
            }
            case GatewayOpcode.Hello: {
                const payload = data as GatewayHelloPayload;

                if (this.state == 'CONNECTING') {
                    const interval = payload.d.heartbeat_interval;
                    const jitter = interval * Math.random();

                    console.log(`Waiting to send first heartbeat (${jitter}ms)`);

                    setTimeout(() => this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), interval), jitter);

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
                            intents: 1 << 0
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
            default: {
                console.warn(`Received unknown Gateway Event! Payload: ${JSON.stringify(data, undefined, 4)}`);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async onDispatch(data: GatewayDispatchPayload<any>) {
        console.log(`Received Dispatch Event: ${data.t}`);
    }

    async disconnect() {
        clearInterval(this.heartbeatInterval);
        this._state = 'SHUTDOWN';
    }
}
