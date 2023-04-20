import { API_ROOT } from '..';
import { type HTTPMethod } from '../../http';

export class DiscordRequest<T> {
    private readonly method: HTTPMethod;
    private readonly route: string;

    protected readonly queryParams = new URLSearchParams();

    constructor(method: HTTPMethod, route: string) {
        this.method = method;
        this.route = route;
    }

    setRouteParam(name: string, value: string) {
        this.route.replace(new RegExp(`\\{${name}\\}`), value);
        return this;
    }

    get searchParams() {
        return this.queryParams;
    }

    get url() {
        const base = new URL(`${API_ROOT}${this.route}`);
        base.search = this.searchParams.toString();
        return base;
    }

    async run(headers: Record<string, string>) {
        console.log(`Sending request ${this.method} ${this.route}`);
        const res = await fetch(this.url.toString(), {
            method: this.method,
            headers: headers
        });

        const data = await res.json();

        console.log(`Received response ${res.status} with JSON ${JSON.stringify(data, undefined, 4)}`);

        if (res.ok) return data as T;

        throw new Error('Encountered Error');
    }
}
