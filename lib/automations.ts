import { settingsRepo, connectionsRepo } from './store'
import { gmailSend, sheetsAppend, slackPost, hubspotUpsertContact, mailchimpSubscribe, webhookPost, runCustomAction } from './actions'
import { connectorConnected } from './connect'
import { getAllConnectors } from './custom-connectors'

export interface FormAutomations {
  gmail?: { enabled?: boolean; to?: string }
  slack?: { enabled?: boolean; channel?: string }
  sheets?: { enabled?: boolean; spreadsheetId?: string; range?: string }
  hubspot?: { enabled?: boolean }
  mailchimp?: { enabled?: boolean; listId?: string }
  webhook?: { enabled?: boolean; url?: string }
  custom?: Record<string, { enabled?: boolean }>   // keyed by "custom:<cid>:<aid>"
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
  const email = firstEmail(data)
  const name = data.name || data.Name || ''
  const tasks: Promise<any>[] = []

  const on = async (key: string, connector: string, fn: () => Promise<any>) => {
    if (!(auto as any)[key]?.enabled) return
    if (connector !== 'webhook' && !(await connectorConnected(connector))) return
    tasks.push(fn())
  }

  await Promise.all([
    on('gmail', 'gmail', () => auto.gmail!.to ? gmailSend({ to: auto.gmail!.to!, subject: `New "${form}" submission`, text: `${summary}\n\nFrom page: ${page || '/'}` }) : Promise.resolve()),
    on('slack', 'slack', () => auto.slack!.channel ? slackPost({ channel: auto.slack!.channel!, text: `*New "${form}" submission*\n${summary}` }) : Promise.resolve()),
    on('sheets', 'google-sheets', () => auto.sheets!.spreadsheetId ? sheetsAppend({ spreadsheetId: auto.sheets!.spreadsheetId!, range: auto.sheets!.range || 'A1', values: [new Date().toISOString(), form, ...Object.values(data)] }) : Promise.resolve()),
    on('hubspot', 'hubspot', () => email ? hubspotUpsertContact({ email, properties: name ? { firstname: name } : {} }) : Promise.resolve()),
    on('mailchimp', 'mailchimp', () => (email && auto.mailchimp!.listId) ? mailchimpSubscribe({ listId: auto.mailchimp!.listId!, email, name }) : Promise.resolve()),
    on('webhook', 'webhook', () => auto.webhook!.url ? webhookPost({ url: auto.webhook!.url!, payload: { form, page, data } }) : Promise.resolve()),
  ])

  // Custom connector actions (context = submission fields + form/page).
  const customCfg = auto.custom || {}
  if (Object.values(customCfg).some((v) => v?.enabled)) {
    const all = await getAllConnectors()
    for (const [key, cfg] of Object.entries(customCfg)) {
      if (!cfg?.enabled) continue
      const [, cid, aid] = key.split(':')
      const c = all.find((x) => x.id === cid)
      const action = c?.actions?.find((a) => a.id === aid)
      if (!c || !action) continue
      if (c.auth !== 'rest' && !(await connectorConnected(cid))) continue
      tasks.push(runCustomAction(c, action, { form, page, ...data }))
    }
  }

  await Promise.allSettled(tasks)
}
