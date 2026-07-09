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

// ── Action registry (for the generic /api/actions/[id] runner) ──
export interface ActionDef { id: string; connector: string; label: string; run: (input: any) => Promise<any> }
export const ACTIONS: ActionDef[] = [
  { id: 'gmail.send', connector: 'gmail', label: 'Send email (Gmail)', run: gmailSend },
  { id: 'sheets.append', connector: 'google-sheets', label: 'Append row (Google Sheets)', run: sheetsAppend },
  { id: 'drive.list', connector: 'google-drive', label: 'List files (Google Drive)', run: driveList },
  { id: 'calendar.createEvent', connector: 'google-calendar', label: 'Create event (Google Calendar)', run: calendarCreateEvent },
  { id: 'slack.post', connector: 'slack', label: 'Post message (Slack)', run: slackPost },
  { id: 'hubspot.upsertContact', connector: 'hubspot', label: 'Create/update contact (HubSpot)', run: hubspotUpsertContact },
]
export const ACTION_MAP: Record<string, ActionDef> = Object.fromEntries(ACTIONS.map((a) => [a.id, a]))
