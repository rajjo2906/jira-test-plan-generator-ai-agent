import { useEffect, useState } from 'react';

const API_URL = '/api';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 70000);
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Request timed out. Check that the backend is running and try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

function Icon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function inlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function tableCells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, '|').trim());
}

function isTableDivider(line) {
  return line.includes('|') && /^\s*\|?[\s:|-]+\|?\s*$/.test(line);
}

function isBlockStart(lines, index) {
  const line = lines[index];
  return /^(#{1,6})\s/.test(line) ||
    /^\s*([-*_]\s*){3,}$/.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*[-*+]\s/.test(line) ||
    /^\s*\d+[.)]\s/.test(line) ||
    (line.includes('|') && isTableDivider(lines[index + 1] || ''));
}

function MarkdownDocument({ content }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2], key: index });
      index += 1;
      continue;
    }

    if (/^\s*([-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: 'rule', key: index });
      index += 1;
      continue;
    }

    if (line.includes('|') && isTableDivider(lines[index + 1] || '')) {
      const headers = tableCells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ type: 'table', headers, rows, key: index });
      continue;
    }

    if (/^\s*[-*+]\s/.test(line) || /^\s*\d+[.)]\s/.test(line)) {
      const ordered = /^\s*\d+[.)]\s/.test(line);
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: ordered ? 'ordered' : 'list', items, key: index });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      blocks.push({ type: 'quote', text: quote.join(' '), key: index });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' '), key: index });
  }

  return (
    <article className="markdown-document">
      {blocks.map((block) => {
        if (block.type === 'heading') {
          const Heading = `h${Math.min(block.level, 4)}`;
          return <Heading className={`md-heading md-h${block.level}`} key={block.key}>{inlineMarkdown(block.text)}</Heading>;
        }
        if (block.type === 'rule') return <hr className="md-rule" key={block.key} />;
        if (block.type === 'list' || block.type === 'ordered') {
          const List = block.type === 'ordered' ? 'ol' : 'ul';
          return <List className="md-list" key={block.key}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}</List>;
        }
        if (block.type === 'quote') return <blockquote className="md-quote" key={block.key}>{inlineMarkdown(block.text)}</blockquote>;
        if (block.type === 'table') {
          return (
            <div className="md-table-wrap" key={block.key}>
              <table className="md-table">
                <thead><tr>{block.headers.map((cell, cellIndex) => <th key={cellIndex}>{inlineMarkdown(cell)}</th>)}</tr></thead>
                <tbody>{block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>{block.headers.map((_, cellIndex) => <td key={cellIndex}>{inlineMarkdown(row[cellIndex] || '')}</td>)}</tr>
                ))}</tbody>
              </table>
            </div>
          );
        }
        return <p className="md-paragraph" key={block.key}>{inlineMarkdown(block.text)}</p>;
      })}
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [settings, setSettings] = useState({
    jiraBaseUrl: '',
    jiraEmail: '',
    jiraApiToken: '',
    groqApiKey: '',
    jiraTokenConfigured: false,
    groqKeyConfigured: false,
  });
  const [issueKey, setIssueKey] = useState('');
  const [plan, setPlan] = useState('');
  const [summary, setSummary] = useState('');
  const [editingPlan, setEditingPlan] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ jira: null, groq: null });
  const [settingsManagedBy, setSettingsManagedBy] = useState('local');

  useEffect(() => {
    request('/settings')
      .then((data) => {
        setSettings((current) => ({ ...current, ...data }));
        setSettingsManagedBy(data.settingsManagedBy || 'local');
      })
      .catch((error) => setNotice({ type: 'error', text: error.message }));
  }, []);

  function updateSetting(event) {
    setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    setBusy('save');
    setNotice(null);
    try {
      const data = await request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSettings((current) => ({
        ...current,
        ...data.settings,
        jiraApiToken: '',
        groqApiKey: '',
      }));
      setConnectionStatus({ jira: null, groq: null });
      setNotice({ type: 'success', text: 'Settings saved securely on this backend.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  async function testConnection(service) {
    setBusy(service);
    setNotice(null);
    try {
      const data = await request(service === 'jira' ? '/test-jira' : '/test-groq', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      setConnectionStatus((current) => ({ ...current, [service]: true }));
      setNotice({ type: 'success', text: data.message });
    } catch (error) {
      setConnectionStatus((current) => ({ ...current, [service]: false }));
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  async function generatePlan(event) {
    event.preventDefault();
    setBusy('generate');
    setNotice(null);
    setPlan('');
    setSummary('');
    setEditingPlan(false);
    try {
      const data = await request('/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ issueKey }),
      });
      setPlan(data.plan);
      setSummary(`${data.issueKey} · ${data.summary}`);
      setNotice({ type: 'success', text: 'Draft generated. Review it before use.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy('');
    }
  }

  const allVerified = connectionStatus.jira === true && connectionStatus.groq === true;
  const verificationFailed = connectionStatus.jira === false || connectionStatus.groq === false;
  const credentialsConfigured = settings.jiraTokenConfigured && settings.groqKeyConfigured;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="spark" /></div>
          <div><strong>QA Studio</strong><span>TEST PLAN GENERATOR</span></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          <button className={`nav-item ${page === 'home' ? 'active' : ''}`} onClick={() => { setPage('home'); setNotice(null); }}>
            <Icon name="home" /> <span>Generate plan</span>
          </button>
          <button className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => { setPage('settings'); setNotice(null); }}>
            <Icon name="settings" /> <span>Settings</span>
            <span className={`nav-dot ${allVerified ? 'ready' : ''} ${verificationFailed ? 'failed' : ''}`} />
          </button>
        </nav>
        <div className="sidebar-foot">
          <div className="secure-icon"><Icon name="shield" /></div>
          <p><strong>Your keys stay private</strong><br />Credentials are stored by the local backend and never sent to the browser as values.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {page === 'home' ? 'Generate plan' : 'Settings'}</div>
          <div className={`connection-pill ${allVerified ? 'connected' : ''} ${verificationFailed ? 'failed' : ''}`}><i />{allVerified ? 'Connections verified' : verificationFailed ? 'Connection check failed' : credentialsConfigured ? 'Verify connections' : 'Setup required'}</div>
        </header>

        {notice && <div className={`notice ${notice.type}`} role="status">{notice.text}<button aria-label="Dismiss" onClick={() => setNotice(null)}>×</button></div>}

        {page === 'home' ? (
          <section className="content">
            <div className="page-heading">
              <div className="eyebrow">JIRA → TEST PLAN</div>
              <h1>Turn a ticket into a<br /><em>thoughtful test plan.</em></h1>
              <p>Bring your Jira requirements into focus. AI drafts the plan, and you stay in control of the final review.</p>
            </div>

            <form className="ticket-card" onSubmit={generatePlan}>
              <label htmlFor="issueKey">Jira issue</label>
              <div className="ticket-entry">
                <div className="ticket-input-wrap"><span className="jira-symbol">J</span><input id="issueKey" value={issueKey} onChange={(event) => setIssueKey(event.target.value)} placeholder="e.g. PROJ-123" autoComplete="off" /></div>
                <button className="primary-button" disabled={busy === 'generate'}>{busy === 'generate' ? 'Generating…' : <>Generate plan <Icon name="arrow" /></>}</button>
              </div>
              <div className="helper-text">Fetches ticket details from Jira and follows your test plan template.</div>
            </form>

            <section className="plan-card">
              <div className="plan-header">
                <div><span className="section-kicker">OUTPUT</span><h2>{summary || 'Your test plan'}</h2></div>
                {plan && (
                  <div className="plan-tools">
                    <button className="edit-plan-button" onClick={() => setEditingPlan((editing) => !editing)}>{editingPlan ? 'Preview' : 'Edit draft'}</button>
                    <span className="draft-badge"><i /> DRAFT</span>
                  </div>
                )}
              </div>
              {plan ? (
                editingPlan
                  ? <textarea className="plan-editor" value={plan} onChange={(event) => setPlan(event.target.value)} aria-label="Editable generated test plan" />
                  : <div className="plan-preview"><MarkdownDocument content={plan} /></div>
              ) : (
                <div className="empty-plan"><div className="empty-icon"><Icon name="spark" /></div><strong>Your plan will appear here</strong><span>Enter a Jira issue key above to get started.</span></div>
              )}
              {plan && <div className="review-note"><Icon name="shield" /><span>Human review required — verify assumptions and acceptance criteria before using this draft.</span></div>}
            </section>
          </section>
        ) : (
          <section className="content settings-content">
            <div className="page-heading compact">
              <div className="eyebrow">CONNECTIONS</div>
              <h1>Settings</h1>
              <p>Connect Jira and Groq. Credentials are kept on your local backend.</p>
            </div>

            <form onSubmit={saveSettings}>
              {settingsManagedBy === 'vercel' && (
                <div className="deployment-note">
                  This hosted app reads secrets from Vercel. Set <code>JIRA_BASE_URL</code>, <code>JIRA_EMAIL</code>, <code>JIRA_API_TOKEN</code>, and <code>GROQ_API_KEY</code> in Project Settings → Environment Variables, then redeploy.
                </div>
              )}
              <section className="settings-card">
                <div className="settings-card-heading">
                  <div className="service-icon jira-icon">J</div>
                  <div><h2>Jira connection</h2><p>Use an Atlassian API token for your account.</p></div>
                  <span className={`service-status ${connectionStatus.jira === true ? 'is-ready' : ''} ${connectionStatus.jira === false ? 'has-error' : ''}`}>{connectionStatus.jira === true ? 'Connected' : connectionStatus.jira === false ? 'Check failed' : settings.jiraTokenConfigured ? 'Saved · not tested' : 'Not connected'}</span>
                </div>
                <div className="field-grid">
                  <label className="field full">Jira site URL<input name="jiraBaseUrl" value={settings.jiraBaseUrl} onChange={updateSetting} placeholder="https://your-team.atlassian.net" autoComplete="url" required readOnly={settingsManagedBy === 'vercel'} /></label>
                  <label className="field">Jira email<input name="jiraEmail" type="email" value={settings.jiraEmail} onChange={updateSetting} placeholder="you@company.com" autoComplete="username" required readOnly={settingsManagedBy === 'vercel'} /></label>
                  <label className="field">API token<input name="jiraApiToken" type="password" value={settings.jiraApiToken} onChange={updateSetting} placeholder={settingsManagedBy === 'vercel' ? 'Managed in Vercel environment' : settings.jiraTokenConfigured ? 'Saved securely — enter to replace' : 'Paste Jira API token'} autoComplete="new-password" disabled={settingsManagedBy === 'vercel'} /></label>
                </div>
                <div className="card-actions">
                  <button type="button" className="secondary-button" onClick={() => testConnection('jira')} disabled={busy === 'jira'}>{busy === 'jira' ? 'Testing…' : 'Test Jira connection'}</button>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-heading">
                  <div className="service-icon groq-icon">G</div>
                  <div><h2>AI provider</h2><p>Groq generates a draft from the Jira ticket and template.</p></div>
                  <span className={`service-status ${connectionStatus.groq === true ? 'is-ready' : ''} ${connectionStatus.groq === false ? 'has-error' : ''}`}>{connectionStatus.groq === true ? 'Connected' : connectionStatus.groq === false ? 'Check failed' : settings.groqKeyConfigured ? 'Saved · not tested' : 'Not connected'}</span>
                </div>
                <div className="field-grid">
                  <label className="field">Provider<input value="Groq" readOnly /></label>
                  <label className="field">Model<input value="openai/gpt-oss-120b" readOnly /></label>
                  <label className="field full">Groq API key<input name="groqApiKey" type="password" value={settings.groqApiKey} onChange={updateSetting} placeholder={settingsManagedBy === 'vercel' ? 'Managed in Vercel environment' : settings.groqKeyConfigured ? 'Saved securely — enter to replace' : 'Paste Groq API key'} autoComplete="new-password" disabled={settingsManagedBy === 'vercel'} /></label>
                </div>
                <div className="card-actions">
                  <button type="button" className="secondary-button" onClick={() => testConnection('groq')} disabled={busy === 'groq'}>{busy === 'groq' ? 'Testing…' : 'Test Groq connection'}</button>
                </div>
              </section>

              <div className="settings-save-row">
                <span>{settingsManagedBy === 'vercel' ? 'Update environment variables and redeploy to change hosted settings.' : 'Blank key fields keep the credentials already saved.'}</span>
                {settingsManagedBy === 'local' && <button className="primary-button" disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save settings'}</button>}
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
