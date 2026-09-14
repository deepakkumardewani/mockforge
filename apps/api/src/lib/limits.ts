export const EPHEMERAL_SCHEMA_TTL_SECONDS = 3600;

export const MAX_SCHEMA_BODY_BYTES = 32 * 1024;
export const MAX_SCHEMA_NAME_LENGTH = 64;
export const MAX_SCHEMA_FIELDS = 50;
export const MAX_FIELD_NAME_LENGTH = 64;
export const FIELD_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const RESERVED_FIELD_NAMES = ["__proto__", "prototype", "constructor"] as const;

export const MF_ID_MIN_LENGTH = 1;
export const MF_ID_MAX_LENGTH = 64;
export const MF_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export const RATE_LIMIT_IDENTIFIED = 300;
export const RATE_LIMIT_IP_FALLBACK = 60;
export const RATE_LIMIT_WINDOW_SECONDS = 60;

export const MAX_GRAPHQL_DEPTH = 12;
export const MAX_GRAPHQL_ALIASES = 20;
export const MAX_GRAPHQL_COMPLEXITY = 200;
export const MAX_GRAPHQL_BODY_BYTES = 16 * 1024;
export const GRAPHQL_DEFAULT_LIST_CARDINALITY = 10;
export const GRAPHQL_MAX_LIST_CARDINALITY = 100;
