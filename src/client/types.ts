export type Snowflake = string;

// https://discord.com/developers/docs/resources/guild#guild-object-verification-level
export enum VerificationLevel {
    None,
    Low,
    Medium,
    High,
    VeryHigh
}

// https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
export enum MessageNotificationLevel {
    AllMessages,
    OnlyMentions
}

// https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
export enum ExplicitContentFilterLevel {
    Disabled,
    MembersWithoutRoles,
    AllMembers
}

// https://discord.com/developers/docs/resources/guild#unavailable-guild-object
export type UnavailableGuild = {
    id: Snowflake
    unavailable: boolean
}

// https://discord.com/developers/docs/resources/guild#guild-object-guild-features
export enum GuildFeature {
    ANIMATED_BANNER,
    ANIMATED_ICON,
    APPLICATION_COMMAND_PERMISSIONS_V2,
    AUTO_MODERATION,
    BANNER,

    // can be modified (requires Administrator permissions)
    COMMUNITY,

    CREATOR_MONETIZABLE_PROVISIONAL,
    CREATOR_STORE_PAGE,
    DEVELOPER_SUPPORT_SERVER,

    // can be modified (requires Administrator permissions. If enabling, must also pass discoverability requirements)
    DISCOVERABLE,

    FEATURABLE,

    // can be modified (requires Manage Guild permissions)
    INVITES_DISABLED,

    INVITE_SPLASH,
    MEMBER_VERIFICATION_GATE_ENABLED,
    MORE_STICKERS,
    NEWS,
    PARTNERED,
    PREVIEW_ENABLED,
    ROLE_ICONS,
    ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE,
    ROLE_SUBSCRIPTIONS_ENABLED,
    TICKETED_EVENTS_ENABLED,
    VANITY_URL,
    VERIFIED,
    VIP_REGIONS,
    WELCOME_SCREEN_ENABLED
}

// https://discord.com/developers/docs/resources/guild#guild-object-mfa-level
export enum GuildMFALevel {
    None,
    Elevated
}

// https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
export enum GuildPremiumTier {
    None,
    Tier1,
    Tier2,
    Tier3
}

// https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level
export enum GuildNSFWLevel {
    Default,
    Explicit,
    Safe,
    AgeRestricted
}

// https://discord.com/developers/docs/resources/guild#guild-object
export interface RawGuild {
    id: Snowflake,
    name: string,
    icon: string | null,
    icon_hash?: string | null,
    splash: string | null,
    discovery_splash: string | null,

    // intentionally redacted (only provided when using "get current user guilds" endpoint)
    // owner?: boolean,

    owner_id: Snowflake,

    // intentionally redacted (only provided when using "get current user guilds" endpoint)
    // permissions?: string,

    afk_channel_id: Snowflake | null,
    afk_timeout: number,
    widget_enabled?: boolean,
    widget_channel_id?: Snowflake | null,
    verification_level: VerificationLevel,
    default_message_notifications: MessageNotificationLevel,
    explicit_content_filter: ExplicitContentFilterLevel,

    // TODO: implement roles
    roles: unknown[],

    // TODO: implement emojis
    emojis: unknown[],

    features: GuildFeature[],
    mfa_level: GuildMFALevel,
    application_id: Snowflake | null,
    system_channel_id: Snowflake | null,
    system_channel_flags: number,
    rules_channel_id: Snowflake | null,
    max_presences?: number | null,
    max_members?: number,
    vanity_url_code: string | null,
    description: string | null,
    banner: string | null,
    premium_tier: GuildPremiumTier,
    premium_subscription_count?: number,
    preferred_locale: string,
    public_updates_channel_id: Snowflake | null,
    max_video_channel_users?: number,
    max_stage_video_channel_users?: number,
    approximate_member_count?: number,
    approximate_presence_count?: number,

    // TODO: implement guild welcome screens
    welcome_screen?: unknown,

    nsfw_level: GuildNSFWLevel,

    // TODO: implement stickers
    stickers?: unknown[],

    premium_progress_bar_enabled: boolean
}
