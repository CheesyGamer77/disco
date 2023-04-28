import { HTTPClient } from '../client/http';
import { RawGuild, Snowflake } from '../client/types';

/**
 * Represents a generic map-based cache of Discord snowflake-identified items
*/
abstract class SnowflakeCache<V, ID extends Snowflake = Snowflake> extends Map<Snowflake, V> {
    protected readonly http: HTTPClient;

    constructor(http: HTTPClient, map?: Map<ID, V>) {
        super();
        this.http = http;

        for (const [key, value] of map?.entries() ?? []) {
            this.set(key, value);
        }
    }

    /**
     * Retrieves the item associated with the given snowflake id.
     *
     * If the item is not already found in the cache, this will fetch the given item from Discord.
     * @param id The snowflake id of the item to retrieve.
     * @returns The retrieved item.
     */
    async retrieve(id: ID): Promise<V> {
        console.log(`Retrieving item with id ${id}`);
        return this.get(id) ?? await this.fetch(id);
    }

    private search<Found, Missing>(matcher: (item: V) => boolean, found: (item: V) => Found, missing: Missing) {
        for (const item of this.values()) {
            if (matcher(item)) return found(item);
        }

        return missing;
    }

    /**
     * Returns the first item that satisifes the given search function.
     *
     * If no item satisfies the search function, this returns undefined.
     *
     * If you are attempting to find a value with a given id, you should use {@link SnowflakeCache.get} instead.
     * @param filter The function to return whether the given item matches or not.
     * @returns The found item, or undefined if not found.
     */
    find(filter: (item: V) => boolean) {
        return this.search(filter, item => item, undefined);
    }

    /**
     * Returns whether any value in the cache satisfies a given matcher.
     * @param filter The function to return whether the given item matches or not.
     * @returns true if an item was found, false otherwise.
     */
    contains(filter: (item: V) => boolean) {
        return this.search(filter, _ => true, false);
    }

    /**
     * Fetches the item associated with the given snowflake id.
     *
     * This operation does not check the cache, and may be subject to rate limits. For general usage, use {@link SnowflakeCache.retrieve} instead.
     * @param id The snowflake id of the item to retrieve.
     * @returns The fetched item.
     * @see {@link SnowflakeCache.retrieve}
     */
    abstract fetch(id: ID): Promise<V>
}

/**
 * Map-based cache implementation for Discord guilds.
 */
export class GuildCache extends SnowflakeCache<RawGuild> {
    override async fetch(id: Snowflake) {
        console.log('Need to fetch!');
        return await this.http.getGuild(id);
    }
}
