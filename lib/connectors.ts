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
  auth?: 'oauth2' | 'apikey' | 'rest'   // default oauth2
  clientIdEnv?: string
  clientSecretEnv?: string
  clientId?: string             // inline creds (custom UI-configured connectors)
  clientSecret?: string
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
  custom?: boolean              // added via the UI (stored in settings)
  baseUrl?: string              // REST/API base URL (also used by custom OAuth2 actions)
  restAuthHeader?: string       // REST auth header name (e.g. Authorization)
  restAuthValue?: string        // REST auth header value (e.g. Bearer xxx)
  actions?: CustomAction[]      // named actions for custom connectors
}

// A named action on a custom connector. path/body may contain {{placeholders}}
// filled from the action input (or, in automations, from the submission fields).
export interface CustomAction {
  id: string
  label: string
  method: string                // GET | POST | PUT | PATCH | DELETE
  path: string                  // appended to baseUrl, e.g. /tasks or /users/{{id}}
  body?: string                 // JSON template for non-GET requests
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

  { id: 'google-docs', name: 'Google Docs', category: 'Productivity', brand: 'googledocs', description: 'Read and create Google Docs.',
    scopes: [...OPENID, 'https://www.googleapis.com/auth/documents'], ...GOOGLE },

  { id: 'linkedin', name: 'LinkedIn', category: 'Social', brand: 'linkedin', description: 'Share posts and read your profile.',
    clientIdEnv: 'LINKEDIN_CLIENT_ID', clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization', tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['openid', 'profile', 'email', 'w_member_social'], userInfoUrl: 'https://api.linkedin.com/v2/userinfo', accountEmailPath: 'email', accountNamePath: 'name',
    setupUrl: 'https://www.linkedin.com/developers/apps' },

  { id: 'asana', name: 'Asana', category: 'Productivity', brand: 'asana', description: 'Create and read tasks and projects.',
    clientIdEnv: 'ASANA_CLIENT_ID', clientSecretEnv: 'ASANA_CLIENT_SECRET',
    authorizeUrl: 'https://app.asana.com/-/oauth_authorize', tokenUrl: 'https://app.asana.com/-/oauth_token',
    scopes: ['default'], setupUrl: 'https://app.asana.com/0/my-apps' },

  { id: 'zoom', name: 'Zoom', category: 'Messaging', brand: 'zoom', description: 'Create meetings and read your account.',
    clientIdEnv: 'ZOOM_CLIENT_ID', clientSecretEnv: 'ZOOM_CLIENT_SECRET',
    authorizeUrl: 'https://zoom.us/oauth/authorize', tokenUrl: 'https://zoom.us/oauth/token', tokenAuth: 'basic',
    scopes: [], setupUrl: 'https://marketplace.zoom.us/' },

  { id: 'gitlab', name: 'GitLab', category: 'Developer', brand: 'gitlab', description: 'Access GitLab projects and issues.',
    clientIdEnv: 'GITLAB_CLIENT_ID', clientSecretEnv: 'GITLAB_CLIENT_SECRET',
    authorizeUrl: 'https://gitlab.com/oauth/authorize', tokenUrl: 'https://gitlab.com/oauth/token',
    scopes: ['read_api'], pkce: true, userInfoUrl: 'https://gitlab.com/api/v4/user', accountEmailPath: 'email', accountNamePath: 'username',
    setupUrl: 'https://gitlab.com/-/profile/applications' },

  { id: 'figma', name: 'Figma', category: 'Developer', brand: 'figma', description: 'Read your Figma files and projects.',
    clientIdEnv: 'FIGMA_CLIENT_ID', clientSecretEnv: 'FIGMA_CLIENT_SECRET',
    authorizeUrl: 'https://www.figma.com/oauth', tokenUrl: 'https://api.figma.com/v1/oauth/token',
    scopes: ['file_read'], setupUrl: 'https://www.figma.com/developers/apps' },

  { id: 'spotify', name: 'Spotify', category: 'Media', brand: 'spotify', description: 'Read playlists and your library.',
    clientIdEnv: 'SPOTIFY_CLIENT_ID', clientSecretEnv: 'SPOTIFY_CLIENT_SECRET',
    authorizeUrl: 'https://accounts.spotify.com/authorize', tokenUrl: 'https://accounts.spotify.com/api/token', tokenAuth: 'basic',
    scopes: ['user-read-email', 'playlist-read-private'], userInfoUrl: 'https://api.spotify.com/v1/me', accountEmailPath: 'email', accountNamePath: 'display_name',
    setupUrl: 'https://developer.spotify.com/dashboard' },

  { id: 'reddit', name: 'Reddit', category: 'Social', brand: 'reddit', description: 'Read your identity and subreddits.',
    clientIdEnv: 'REDDIT_CLIENT_ID', clientSecretEnv: 'REDDIT_CLIENT_SECRET',
    authorizeUrl: 'https://www.reddit.com/api/v1/authorize', tokenUrl: 'https://www.reddit.com/api/v1/access_token', tokenAuth: 'basic',
    scopes: ['identity', 'read'], extraAuthParams: { duration: 'permanent' }, setupUrl: 'https://www.reddit.com/prefs/apps' },

  { id: 'twitch', name: 'Twitch', category: 'Media', brand: 'twitch', description: 'Read your Twitch channel and streams.',
    clientIdEnv: 'TWITCH_CLIENT_ID', clientSecretEnv: 'TWITCH_CLIENT_SECRET',
    authorizeUrl: 'https://id.twitch.tv/oauth2/authorize', tokenUrl: 'https://id.twitch.tv/oauth2/token',
    scopes: ['user:read:email'], setupUrl: 'https://dev.twitch.tv/console' },

  { id: 'salesforce', name: 'Salesforce', category: 'CRM', brand: 'salesforce', description: 'Sync leads and contacts with Salesforce.',
    clientIdEnv: 'SALESFORCE_CLIENT_ID', clientSecretEnv: 'SALESFORCE_CLIENT_SECRET',
    authorizeUrl: 'https://login.salesforce.com/services/oauth2/authorize', tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    scopes: ['api', 'refresh_token'], setupUrl: 'https://developer.salesforce.com/' },

  { id: 'zoho', name: 'Zoho CRM', category: 'CRM', brand: 'zoho', description: 'Sync records with Zoho CRM.',
    clientIdEnv: 'ZOHO_CLIENT_ID', clientSecretEnv: 'ZOHO_CLIENT_SECRET',
    authorizeUrl: 'https://accounts.zoho.com/oauth/v2/auth', tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
    scopes: ['ZohoCRM.modules.ALL'], extraAuthParams: { access_type: 'offline', prompt: 'consent' }, setupUrl: 'https://api-console.zoho.com/' },

  { id: 'intercom', name: 'Intercom', category: 'Support', brand: 'intercom', description: 'Read and create Intercom contacts.',
    clientIdEnv: 'INTERCOM_CLIENT_ID', clientSecretEnv: 'INTERCOM_CLIENT_SECRET',
    authorizeUrl: 'https://app.intercom.com/oauth', tokenUrl: 'https://api.intercom.io/auth/eagle/token',
    scopes: [], setupUrl: 'https://developers.intercom.com/' },

  { id: 'calendly', name: 'Calendly', category: 'Scheduling', brand: 'calendly', description: 'Read scheduled events and invitees.',
    clientIdEnv: 'CALENDLY_CLIENT_ID', clientSecretEnv: 'CALENDLY_CLIENT_SECRET',
    authorizeUrl: 'https://auth.calendly.com/oauth/authorize', tokenUrl: 'https://auth.calendly.com/oauth/token',
    scopes: [], setupUrl: 'https://calendly.com/integrations/api_webhooks' },

  // ── API-key connectors (configured via env vars, no OAuth dance) ──
  { id: 'mailchimp', name: 'Mailchimp', category: 'Email', brand: 'mailchimp', description: 'Add subscribers to a Mailchimp audience.',
    auth: 'apikey', apiKeyEnv: ['MAILCHIMP_API_KEY'], scopes: [], setupUrl: 'https://admin.mailchimp.com/account/api/' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', brand: 'stripe', description: 'Create customers and payment links.',
    auth: 'apikey', apiKeyEnv: ['STRIPE_SECRET_KEY'], scopes: [], setupUrl: 'https://dashboard.stripe.com/apikeys' },
  { id: 'sendgrid', name: 'SendGrid', category: 'Email', brand: 'sendgrid', description: 'Send transactional email via SendGrid.',
    auth: 'apikey', apiKeyEnv: ['SENDGRID_API_KEY'], scopes: [], setupUrl: 'https://app.sendgrid.com/settings/api_keys' },
  { id: 'resend', name: 'Resend', category: 'Email', brand: 'resend', description: 'Send email via Resend.',
    auth: 'apikey', apiKeyEnv: ['RESEND_API_KEY'], scopes: [], setupUrl: 'https://resend.com/api-keys' },
  { id: 'twilio', name: 'Twilio', category: 'Messaging', brand: 'twilio', description: 'Send SMS via Twilio.',
    auth: 'apikey', apiKeyEnv: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM'], scopes: [], setupUrl: 'https://console.twilio.com/' },
  { id: 'openai', name: 'OpenAI', category: 'AI', brand: 'openai', description: 'Generate text with OpenAI models.',
    auth: 'apikey', apiKeyEnv: ['OPENAI_API_KEY'], scopes: [], setupUrl: 'https://platform.openai.com/api-keys' },
  { id: 'algolia', name: 'Algolia', category: 'Search', brand: 'algolia', description: 'Index and search records with Algolia.',
    auth: 'apikey', apiKeyEnv: ['ALGOLIA_APP_ID', 'ALGOLIA_ADMIN_API_KEY'], scopes: [], setupUrl: 'https://dashboard.algolia.com/account/api-keys/' },
  { id: 'supabase', name: 'Supabase', category: 'Database', brand: 'supabase', description: 'Read and write Supabase tables.',
    auth: 'apikey', apiKeyEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'], scopes: [], setupUrl: 'https://supabase.com/dashboard' },
  { id: 'posthog', name: 'PostHog', category: 'Analytics', brand: 'posthog', description: 'Capture product analytics events.',
    auth: 'apikey', apiKeyEnv: ['POSTHOG_API_KEY'], scopes: [], setupUrl: 'https://posthog.com/' },
  { id: 'cloudinary', name: 'Cloudinary', category: 'Storage', brand: 'cloudinary', description: 'Store and transform images and video.',
    auth: 'apikey', apiKeyEnv: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'], scopes: [], setupUrl: 'https://console.cloudinary.com/' },
  { id: 'google-places', name: 'Google Places', category: 'Social', brand: 'google', description: 'Show your Google reviews and place info.',
    auth: 'apikey', apiKeyEnv: ['GOOGLE_PLACES_API_KEY'], scopes: [], setupUrl: 'https://console.cloud.google.com/apis/credentials' },
]

export const CONNECTOR_MAP: Record<string, Connector> = Object.fromEntries(CONNECTORS.map((c) => [c.id, c]))
export function getConnector(id: string): Connector | undefined { return CONNECTOR_MAP[id] }

// A connector is "configured" when its credentials are present.
export function connectorConfigured(c: Connector): boolean {
  if (c.auth === 'apikey') return (c.apiKeyEnv || []).every((e) => !!process.env[e])
  if (c.auth === 'rest') return !!c.baseUrl
  const cid = c.clientId || (c.clientIdEnv ? process.env[c.clientIdEnv] : '')
  const csec = c.clientSecret || (c.clientSecretEnv ? process.env[c.clientSecretEnv] : '')
  return !!(cid && csec)
}
export function isApiKey(c: Connector): boolean { return c.auth === 'apikey' }
export function isRest(c: Connector): boolean { return c.auth === 'rest' }
