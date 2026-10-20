import metadata from '../package.json' with { type: 'json' }

export const CLI_NAME = metadata.name
export const CLI_VERSION = metadata.version
export const SITE_URL = new URL(metadata.homepage).origin
export const DEFAULT_REGISTRY_URL = new URL('/r/', SITE_URL).href
