export type Snowflake = string;

// https://discord.com/developers/docs/resources/guild#unavailable-guild-object
export type UnavailableGuild = {
    id: Snowflake
    unavailable: boolean
}
