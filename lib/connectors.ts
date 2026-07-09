// Config-driven registry of OAuth "connector" apps. Adding a new connected app is
// (mostly) one entry here: its auth endpoints, scopes, brand, and which env vars
// hold its OAuth client credentials. The generic OAuth flow in lib/oauth.ts and the
// routes under /api/connect/[id] handle the rest.

export interface Connector {
  id: string
  name: string
  category: string
  brand: string                 // simple-icons slug (for the logo)
  description: string
  auth?: 'oauth2' | 'apikey'    // default oauth2
  clientIdEnv?: string
  clientSecretEnv?: string
  apiKeyEnv?: string[]          // for apikey connectors (present == connected)
  authorizeUrl?: string
  tokenUrl?: string
  scopes: string[]
  scopeSeparator?: string       // default ' '
  extraAuthParams?: Record<string, string>
  tokenAuth?: 'body' | 'basic'  // how client creds are sent to the token endpoint
  acceptJson?: boolean          // send Accept: application/json (e.g. GitHub)
  pkce?: boolean                // use PKCE (S256)
  userInfoUrl?: string
  accountEmailPath?: string     // dot path into userinfo JSON
  accountNamePath?: string
  setupUrl?: string             // where the user creates the OAuth app / gets keys
}

const GOOGLE = {
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  clientIdEnv: 'GOOGLE_CLIENT_ID',
  clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
  extraAuthParams: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  accountEmailPath: 'email',
  accountNamePath: 'name',
  setupUrl: 'https://console.cloud.google.com/apis/credentials',
}
const OPENID = ['openid', 'email', 'profile']

export const CONNECTORS: Connector[] = [
  { id: 'gmail', name: 'Gmail', category: 'Email', brand: 'gmail', description: 'Send and read email from your Gmail account.',
    scopes: [...OPENID, 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'], ...GOOGLE },
  { id: 'google-drive', name: 'Google Drive', category: 'Storage', brand: 'googledrive', description: 'Read and store files in Google Drive.',
    scopes: [...OPENID, 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'], ...GOOGLE },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Productivity', brand: 'googlecalendar', description: 'Create and read calendar events.',
    scopes: [...OPENID, 'https://www.googleapis.com/auth/calendar'], ...GOOGLE },
  { id: 'google-sheets', name: 'Google Sheets', category: 'Productivity', brand: 'googlesheets', description: 'Read and write spreadsheet data.',
    scopes: [...OPENID, 'https://www.googleapis.com/auth/spreadsheets'], ...GOOGLE },

  { id: 'github', name: 'GitHub', category: 'Developer', brand: 'github', description: 'Access repositories and issues.',
    clientIdEnv: 'GITHUB_CLIENT_ID', clientSecretEnv: 'GITHUB_CLIENT_SECRET',
    authorizeUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['read:user', 'repo'], acceptJson: true, userInfoUrl: 'https://api.github.com/user', accountEmailPath: 'email', accountNamePath: 'login',
    setupUrl: 'https://github.com/settings/developers' },

  { id: 'slack', name: 'Slack', category: 'Messaging', brand: 'slack', description: 'Post messages to your Slack workspace.',
    clientIdEnv: 'SLACK_CLIENT_ID', clientSecretEnv: 'SLACK_CLIENT_SECRET',
    authorizeUrl: 'https://slack.com/oauth/v2/authorize', tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['chat:write', 'channels:read'], scopeSeparator: ',', setupUrl: 'https://api.slack.com/apps' },

  { id: 'dropbox', name: 'Dropbox', category: 'Storage', brand: 'dropbox', description: 'Read and store files in Dropbox.',
    clientIdEnv: 'DROPBOX_CLIENT_ID', clientSecretEnv: 'DROPBOX_CLIENT_SECRET',
    authorizeUrl: 'https://www.dropbox.com/oauth2/authorize', tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scopes: ['files.content.read', 'files.content.write'], extraAuthParams: { token_access_type: 'offline' },
    setupUrl: 'https://www.dropbox.com/developers/apps' },

  { id: 'notion', name: 'Notion', category: 'Productivity', brand: 'notion', description: 'Read and create Notion pages and databases.',
    clientIdEnv: 'NOTION_CLIENT_ID', clientSecretEnv: 'NOTION_CLIENT_SECRET',
    authorizeUrl: 'https://api.notion.com/v1/oauth/authorize', tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: [], tokenAuth: 'basic', extraAuthParams: { owner: 'user' }, setupUrl: 'https://www.notion.so/my-integrations' },

  { id: 'airtable', name: 'Airtable', category: 'Database', brand: 'airtable', description: 'Read and write Airtable bases.',
    clientIdEnv: 'AIRTABLE_CLIENT_ID', clientSecretEnv: 'AIRTABLE_CLIENT_SECRET',
    authorizeUrl: 'https://airtable.com/oauth2/v1/authorize', tokenUrl: 'https://airtable.com/oauth2/v1/token',
    scopes: ['data.records:read', 'data.records:write', 'schema.bases:read'], pkce: true, tokenAuth: 'basic',
    setupUrl: 'https://airtable.com/create/oauth' },

  { id: 'hubspot', name: 'HubSpot', category: 'CRM', brand: 'hubspot', description: 'Sync contacts and deals with HubSpot CRM.',
    clientIdEnv: 'HUBSPOT_CLIENT_ID', clientSecretEnv: 'HUBSPOT_CLIENT_SECRET',
    authorizeUrl: 'https://app.hubspot.com/oauth/authorize', tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'], setupUrl: 'https://developers.hubspot.com/' },

  // ── API-key connectors (configured via env vars, no OAuth dance) ──
  { id: 'mailchimp', name: 'Mailchimp', category: 'Email', brand: 'mailchimp', description: 'Add subscribers to a Mailchimp audience.',
    auth: 'apikey', apiKeyEnv: ['MAILCHIMP_API_KEY'], scopes: [], setupUrl: 'https://admin.mailchimp.com/account/api/' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', brand: 'stripe', description: 'Create customers and payment links.',
    auth: 'apikey', apiKeyEnv: ['STRIPE_SECRET_KEY'], scopes: [], setupUrl: 'https://dashboard.stripe.com/apikeys' },
]

export const CONNECTOR_MAP: Record<string, Connector> = Object.fromEntries(CONNECTORS.map((c) => [c.id, c]))
export function getConnector(id: string): Connector | undefined { return CONNECTOR_MAP[id] }

// A connector is "configured" when its credentials are present in the environment.
export function connectorConfigured(c: Connector): boolean {
  if (c.auth === 'apikey') return (c.apiKeyEnv || []).every((e) => !!process.env[e])
  return !!(c.clientIdEnv && process.env[c.clientIdEnv] && c.clientSecretEnv && process.env[c.clientSecretEnv])
}
export function isApiKey(c: Connector): boolean { return c.auth === 'apikey' }
