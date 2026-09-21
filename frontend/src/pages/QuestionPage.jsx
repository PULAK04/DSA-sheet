import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, ExternalLink, Link2, Play, Plus, Save, Tag, Youtube } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor.jsx';
import ApproachBlock, { emptyApproach } from '../components/ApproachBlock.jsx';
import CounterControl from '../components/CounterControl.jsx';
import { api } from '../lib/api.js';

function normalizeTags(text) {
  return text.split(',').map((x) => x.trim()).filter(Boolean);
}

export default function QuestionPage({ canEdit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getQuestion(id).then((data) => { setQuestion(data); setDraft(data); }).catch((error) => setMessage(error.message));
  }, [id]);

  // Tracks whether the draft has diverged from the last saved version, so we can
  // warn before the person loses in-progress edits (tab close, refresh, or nav away).
  const isDirty = useMemo(() => {
    if (!draft || !question) return false;
    return JSON.stringify(draft) !== JSON.stringify(question);
  }, [draft, question]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const guardedNavigate = useCallback((go) => {
    if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    go();
  }, [isDirty]);

  if (!draft) {
    return (
      <div className="center-screen">
        {message ? (
          <div className="loading-state"><p>{message}</p><Link className="ghost-button" to="/"><ArrowLeft size={15} /> Back to sheet</Link></div>
        ) : (
          <div className="loading-state"><span className="spinner" /><p>Loading question…</p></div>
        )}
      </div>
    );
  }

  const save = async () => {
    if (!canEdit) return;
    setSaving(true); setMessage('');
    try {
      const updated = await api.updateQuestion(id, {
        name: draft.name,
        difficulty: draft.difficulty,
        externalUrl: draft.externalUrl,
        platform: draft.platform,
        youtubeUrl: draft.youtubeUrl,
        tags: draft.tags,
        companies: draft.companies,
        priority: draft.priority,
        revisions: draft.revisions,
        notes: draft.notes,
        approaches: draft.approaches
      });
      setQuestion(updated); setDraft(updated); setMessage('Saved');
      setTimeout(() => setMessage(''), 1600);
    } catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  };

  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="question-page">
      <div className="question-topbar">
        <button className="ghost-icon-button" onClick={() => guardedNavigate(() => navigate(-1))} title="Back"><ArrowLeft size={19} /></button>
        <div className="question-breadcrumb">dsa-sheet <span>/</span> question</div>
        {isDirty && <span className="unsaved-dot" title="Unsaved changes" />}
        <div className="topbar-spacer" />
        {draft.externalUrl && <button className="ghost-button small" onClick={() => window.open(draft.externalUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={15} /> Problem</button>}
        {canEdit && <button className="primary-button small" onClick={save}><Save size={15} /> {saving ? 'Saving…' : isDirty ? 'Save*' : 'Save'}</button>}
      </div>

      <main className="question-content">
        <section className="question-head">
          <div className="question-title-line">
            {canEdit ? <input className="title-input" value={draft.name} onChange={(e) => update('name', e.target.value)} /> : <h1>{draft.name}</h1>}
            <div className="counter-cluster">
              <CounterControl label="Priority" value={draft.priority} onChange={(v) => update('priority', v)} disabled={!canEdit} />
              <CounterControl label="Revisions" value={draft.revisions} onChange={(v) => update('revisions', v)} disabled={!canEdit} />
            </div>
          </div>

          <div className="metadata-grid">
            <label><span>Difficulty</span><select value={draft.difficulty || ''} disabled={!canEdit} onChange={(e) => update('difficulty', e.target.value)}><option value="">Not set</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label><span>Platform</span><input value={draft.platform || ''} disabled={!canEdit} placeholder="LeetCode, GFG…" onChange={(e) => update('platform', e.target.value)} /></label>
            <label><span>Problem link</span><div className="input-with-icon"><Link2 size={14} /><input value={draft.externalUrl || ''} disabled={!canEdit} placeholder="https://…" onChange={(e) => update('externalUrl', e.target.value)} /></div></label>
            <label><span>YouTube</span><div className="input-with-icon"><Youtube size={14} /><input value={draft.youtubeUrl || ''} disabled={!canEdit} placeholder="https://youtube.com/…" onChange={(e) => update('youtubeUrl', e.target.value)} /></div></label>
            <label className="wide"><span><Tag size={13} /> Tags</span><input value={(draft.tags || []).join(', ')} disabled={!canEdit} placeholder="binary search, arrays, search space" onChange={(e) => update('tags', normalizeTags(e.target.value))} /></label>
            <label className="wide"><span><Building2 size={13} /> Companies</span><input value={(draft.companies || []).join(', ')} disabled={!canEdit} placeholder="Google, Amazon, Microsoft" onChange={(e) => update('companies', normalizeTags(e.target.value))} /></label>
          </div>

          <div className="question-state-row">
            {draft.externalUrl && <button className="meta-link" onClick={() => window.open(draft.externalUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={15} /> Open problem</button>}
            {draft.youtubeUrl && <button className="meta-link" onClick={() => window.open(draft.youtubeUrl, '_blank', 'noopener,noreferrer')}><Play size={15} /> Watch video</button>}
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading"><h2>Approaches</h2></div>
          <div className="approach-list">
            {(draft.approaches || []).map((approach, index) => (
              <ApproachBlock
                key={approach._id || index}
                approach={approach}
                index={index}
                canEdit={canEdit}
                onChange={(next) => update('approaches', draft.approaches.map((a, i) => (i === index ? next : a)))}
                onDelete={() => update('approaches', draft.approaches.filter((_, i) => i !== index))}
              />
            ))}
            {!canEdit && (!draft.approaches || draft.approaches.length === 0) && (
              <p className="approach-empty">No approaches added yet.</p>
            )}
            {canEdit && (
              <button
                className="inline-add"
                onClick={() => update('approaches', [...(draft.approaches || []), emptyApproach(`Approach ${(draft.approaches?.length || 0) + 1}`)])}
              >
                <Plus size={16} /> Add Approach
              </button>
            )}
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading"><h2>Notes</h2></div>
          <RichTextEditor value={draft.notes || ''} onChange={(content) => update('notes', content)} minHeight={240} placeholder="Write important points, traps, observations, reminders…" editable={canEdit} />
        </section>

        <div className="bottom-save-bar">
          <button className="ghost-button" onClick={() => guardedNavigate(() => navigate('/'))}><ArrowLeft size={15} /> Back to sheet</button>
          {canEdit && <button className="primary-button" onClick={save}><Save size={15} /> {saving ? 'Saving…' : 'Save changes'}</button>}
          {isDirty && !saving && <span className="unsaved-message">Unsaved changes</span>}
          {message && <span className="save-message">{message}</span>}
        </div>
      </main>
    </div>
  );
}
