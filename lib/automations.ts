import { settingsRepo, connectionsRepo } from './store'
import { gmailSend, sheetsAppend, slackPost, hubspotUpsertContact } from './actions'

export interface FormAutomations {
  gmail?: { enabled?: boolean; to?: string }
  slack?: { enabled?: boolean; channel?: string }
  sheets?: { enabled?: boolean; spreadsheetId?: string; range?: string }
  hubspot?: { enabled?: boolean }
}

export async function getFormAutomations(): Promise<FormAutomations> {
  const v = await settingsRepo.get('form_automations')
  try { const p = JSON.parse(v || '{}'); return p && typeof p === 'object' ? p : {} } catch { return {} }
}

const firstEmail = (data: Record<string, string>) =>
  Object.entries(data).find(([k, v]) => /email/i.test(k) && /@/.test(v))?.[1] || ''

// Fires enabled automations for a new submission. Best-effort: one failing action
// never blocks the others or the submission itself. Only runs where the app is connected.
export async function runFormAutomations(form: string, data: Record<string, string>, page: string): Promise<void> {
  const auto = await getFormAutomations()
  const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')
  const connected = new Set((await connectionsRepo.list()).map((c) => c.connector))
  const tasks: Promise<any>[] = []

  if (auto.gmail?.enabled && auto.gmail.to && connected.has('gmail')) {
    tasks.push(gmailSend({ to: auto.gmail.to, subject: `New "${form}" submission`, text: `${summary}\n\nFrom page: ${page || '/'}` }))
  }
  if (auto.slack?.enabled && auto.slack.channel && connected.has('slack')) {
    tasks.push(slackPost({ channel: auto.slack.channel, text: `*New "${form}" submission*\n${summary}` }))
  }
  if (auto.sheets?.enabled && auto.sheets.spreadsheetId && connected.has('google-sheets')) {
    const values = [new Date().toISOString(), form, ...Object.values(data)]
    tasks.push(sheetsAppend({ spreadsheetId: auto.sheets.spreadsheetId, range: auto.sheets.range || 'A1', values }))
  }
  if (auto.hubspot?.enabled && connected.has('hubspot')) {
    const email = firstEmail(data)
    if (email) {
      const name = data.name || data.Name || ''
      tasks.push(hubspotUpsertContact({ email, properties: name ? { firstname: name } : {} }))
    }
  }

  await Promise.allSettled(tasks)
}
