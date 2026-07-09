import crypto from 'crypto'
import { getValidToken } from './connect'

// Each action performs a real API call on a connected app using its (auto-refreshed)
// OAuth token. They throw on failure so callers can decide how to handle it.

function b64url(s: string) {
  return Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Gmail: send an email as the connected account.
export async function gmailSend(input: { to: string; subject: string; text: string; from?: string }) {
  const token = await getValidToken('gmail')
  const headers = [
    `To: ${input.to}`,
    input.from ? `From: ${input.from}` : '',
    `Subject: ${input.subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '', input.text,
  ].filter((l) => l !== undefined).join('\r\n')
  const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ raw: b64url(headers) }),
  })
  if (!resp.ok) throw new Error(`Gmail send failed (${resp.status})`)
  return resp.json()
}

// Google Sheets: append a row of values.
export async function sheetsAppend(input: { spreadsheetId: string; range?: string; values: (string | number)[] }) {
  const token = await getValidToken('google-sheets')
  const range = input.range || 'A1'
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(input.spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ values: [input.values] }),
  })
  if (!resp.ok) throw new Error(`Sheets append failed (${resp.status})`)
  return resp.json()
}

// Google Drive: list recent files (read example).
export async function driveList(input: { pageSize?: number } = {}) {
  const token = await getValidToken('google-drive')
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=${input.pageSize || 20}&fields=files(id,name,mimeType,modifiedTime,webViewLink)`
  const resp = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
  if (!resp.ok) throw new Error(`Drive list failed (${resp.status})`)
  return resp.json()
}

// Google Calendar: create an event.
export async function calendarCreateEvent(input: { summary: string; description?: string; start: string; end: string }) {
  const token = await getValidToken('google-calendar')
  const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ summary: input.summary, description: input.description || '', start: { dateTime: input.start }, end: { dateTime: input.end } }),
  })
  if (!resp.ok) throw new Error(`Calendar create failed (${resp.status})`)
  return resp.json()
}

// Slack: post a message to a channel (channel id required).
export async function slackPost(input: { channel: string; text: string }) {
  const token = await getValidToken('slack')
  const resp = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ channel: input.channel, text: input.text }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || !data.ok) throw new Error(`Slack post failed: ${data.error || resp.status}`)
  return data
}

// HubSpot: create or update a contact by email.
export async function hubspotUpsertContact(input: { email: string; properties?: Record<string, string> }) {
  const token = await getValidToken('hubspot')
  const properties = { email: input.email, ...(input.properties || {}) }
  const resp = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ properties }),
  })
  if (resp.status === 409) {
    // Already exists — update instead.
    const upd = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(input.email)}?idProperty=email`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ properties }),
    })
    if (!upd.ok) throw new Error(`HubSpot update failed (${upd.status})`)
    return upd.json()
  }
  if (!resp.ok) throw new Error(`HubSpot create failed (${resp.status})`)
  return resp.json()
}

// Google Drive: upload a small text/JSON file.
export async function driveUpload(input: { name: string; content: string; mimeType?: string }) {
  const token = await getValidToken('google-drive')
  const boundary = 'chub' + Math.random().toString(36).slice(2)
  const meta = { name: input.name }
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
    `--${boundary}\r\nContent-Type: ${input.mimeType || 'text/plain'}\r\n\r\n${input.content}\r\n--${boundary}--`
  const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': `multipart/related; boundary=${boundary}` },
    body,
  })
  if (!resp.ok) throw new Error(`Drive upload failed (${resp.status})`)
  return resp.json()
}

// Google Calendar: list upcoming events.
export async function calendarList(input: { max?: number } = {}) {
  const token = await getValidToken('google-calendar')
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(new Date().toISOString())}&singleEvents=true&orderBy=startTime&maxResults=${input.max || 10}`
  const resp = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
  if (!resp.ok) throw new Error(`Calendar list failed (${resp.status})`)
  return resp.json()
}

// Slack: send a direct message to a user (opens an IM, then posts).
export async function slackDM(input: { userId: string; text: string }) {
  const token = await getValidToken('slack')
  const open = await fetch('https://slack.com/api/conversations.open', {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ users: input.userId }),
  }).then((r) => r.json())
  if (!open.ok) throw new Error(`Slack DM open failed: ${open.error}`)
  return slackPost({ channel: open.channel.id, text: input.text })
}

// Airtable: create a record in a base/table.
export async function airtableCreateRecord(input: { baseId: string; table: string; fields: Record<string, any> }) {
  const token = await getValidToken('airtable')
  const resp = await fetch(`https://api.airtable.com/v0/${input.baseId}/${encodeURIComponent(input.table)}`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ fields: input.fields }),
  })
  if (!resp.ok) throw new Error(`Airtable create failed (${resp.status})`)
  return resp.json()
}

// Notion: create a page under a parent page/database.
export async function notionCreatePage(input: { parentId: string; title: string; content?: string }) {
  const token = await getValidToken('notion')
  const children = input.content ? [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: input.content } }] } }] : []
  const resp = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'notion-version': '2022-06-28' },
    body: JSON.stringify({ parent: { page_id: input.parentId }, properties: { title: { title: [{ text: { content: input.title } }] } }, children }),
  })
  if (!resp.ok) throw new Error(`Notion create failed (${resp.status})`)
  return resp.json()
}

// Mailchimp (API key): add or update an audience member.
export async function mailchimpSubscribe(input: { listId: string; email: string; name?: string }) {
  const key = process.env.MAILCHIMP_API_KEY
  if (!key) throw new Error('Mailchimp is not configured')
  const dc = key.split('-')[1]
  if (!dc) throw new Error('Invalid Mailchimp API key (missing data center suffix)')
  const hash = crypto.createHash('md5').update(input.email.toLowerCase()).digest('hex')
  const resp = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${input.listId}/members/${hash}`, {
    method: 'PUT',
    headers: { authorization: `Basic ${Buffer.from(`anystring:${key}`).toString('base64')}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email_address: input.email, status_if_new: 'subscribed', merge_fields: input.name ? { FNAME: input.name } : {} }),
  })
  if (!resp.ok) throw new Error(`Mailchimp subscribe failed (${resp.status})`)
  return resp.json()
}

// Stripe (secret key): create a customer.
export async function stripeCreateCustomer(input: { email: string; name?: string }) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe is not configured')
  const form = new URLSearchParams({ email: input.email })
  if (input.name) form.set('name', input.name)
  const resp = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' }, body: form.toString(),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(data?.error?.message || `Stripe customer failed (${resp.status})`)
  return data
}

// Generic webhook: POST a JSON payload to any URL (works with Zapier, Make, n8n, etc.).
export async function webhookPost(input: { url: string; payload?: any }) {
  if (!input.url) throw new Error('Webhook URL is required')
  const resp = await fetch(input.url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input.payload ?? {}) })
  if (!resp.ok) throw new Error(`Webhook POST failed (${resp.status})`)
  return { ok: true, status: resp.status }
}

// ── Action registry (for the generic /api/actions/[id] runner) ──
export interface ActionDef { id: string; connector: string; label: string; run: (input: any) => Promise<any>; sample?: any }
export const ACTIONS: ActionDef[] = [
  { id: 'gmail.send', connector: 'gmail', label: 'Send email', run: gmailSend, sample: { to: 'you@example.com', subject: 'Test from ContentHub', text: 'It works!' } },
  { id: 'sheets.append', connector: 'google-sheets', label: 'Append row', run: sheetsAppend, sample: { spreadsheetId: '', range: 'Sheet1!A1', values: ['hello', 'world'] } },
  { id: 'drive.list', connector: 'google-drive', label: 'List files', run: driveList, sample: { pageSize: 10 } },
  { id: 'drive.upload', connector: 'google-drive', label: 'Upload file', run: driveUpload, sample: { name: 'note.txt', content: 'Hello from ContentHub' } },
  { id: 'calendar.list', connector: 'google-calendar', label: 'List events', run: calendarList, sample: { max: 10 } },
  { id: 'calendar.createEvent', connector: 'google-calendar', label: 'Create event', run: calendarCreateEvent, sample: { summary: 'Meeting', start: new Date(Date.now() + 3600e3).toISOString(), end: new Date(Date.now() + 7200e3).toISOString() } },
  { id: 'slack.post', connector: 'slack', label: 'Post to channel', run: slackPost, sample: { channel: 'C0123456789', text: 'Hello from ContentHub' } },
  { id: 'slack.dm', connector: 'slack', label: 'Direct message', run: slackDM, sample: { userId: 'U0123456789', text: 'Hi!' } },
  { id: 'hubspot.upsertContact', connector: 'hubspot', label: 'Create/update contact', run: hubspotUpsertContact, sample: { email: 'lead@example.com', properties: { firstname: 'Ada' } } },
  { id: 'airtable.createRecord', connector: 'airtable', label: 'Create record', run: airtableCreateRecord, sample: { baseId: 'appXXXX', table: 'Table 1', fields: { Name: 'Ada' } } },
  { id: 'notion.createPage', connector: 'notion', label: 'Create page', run: notionCreatePage, sample: { parentId: '', title: 'New page', content: 'Hello' } },
  { id: 'mailchimp.subscribe', connector: 'mailchimp', label: 'Add subscriber', run: mailchimpSubscribe, sample: { listId: '', email: 'fan@example.com', name: 'Ada' } },
  { id: 'stripe.createCustomer', connector: 'stripe', label: 'Create customer', run: stripeCreateCustomer, sample: { email: 'customer@example.com', name: 'Ada' } },
  { id: 'webhook.post', connector: 'webhook', label: 'POST to a URL', run: webhookPost, sample: { url: 'https://example.com/hook', payload: { hello: 'world' } } },
]
export const ACTION_MAP: Record<string, ActionDef> = Object.fromEntries(ACTIONS.map((a) => [a.id, a]))
