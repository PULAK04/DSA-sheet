import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor.jsx';
import CodeEditor from './CodeEditor.jsx';

const LANGS = ['cpp', 'python', 'java', 'javascript'];
const LANG_LABEL = { cpp: 'C++', python: 'Python', java: 'Java', javascript: 'JavaScript' };

export function emptyApproach(title) {
  return {
    title,
    content: '',
    solutions: {
      cpp: { language: 'cpp', code: '' },
      python: { language: 'python', code: '' },
      java: { language: 'java', code: '' },
      javascript: { language: 'javascript', code: '' }
    }
  };
}

export default function ApproachBlock({ approach, index, canEdit, onChange, onDelete }) {
  const [tab, setTab] = useState('cpp');

  const updateField = (key, value) => onChange({ ...approach, [key]: value });
  const updateSolution = (lang, code) => onChange({
    ...approach,
    solutions: { ...approach.solutions, [lang]: { language: lang, code } }
  });

  return (
    <div className="approach-block">
      <div className="approach-head">
        {canEdit ? (
          <input
            className="approach-title-input"
            value={approach.title || ''}
            placeholder={`Approach ${index + 1}`}
            onChange={(e) => updateField('title', e.target.value)}
          />
        ) : (
          <h3>{approach.title || `Approach ${index + 1}`}</h3>
        )}
        {canEdit && (
          <button className="approach-remove" onClick={onDelete} title="Remove this approach">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <RichTextEditor
        value={approach.content || ''}
        onChange={(content) => updateField('content', content)}
        minHeight={220}
        placeholder="Explain the algorithm, walk through a dry run…"
        editable={canEdit}
      />

      <div className="approach-code">
        <div className="code-tabs">
          {LANGS.map((lang) => (
            <button key={lang} className={tab === lang ? 'active' : ''} onClick={() => setTab(lang)}>
              {LANG_LABEL[lang]}
            </button>
          ))}
        </div>
        <CodeEditor
          language={tab}
          value={approach.solutions?.[tab]?.code || ''}
          readOnly={!canEdit}
          onChange={(code) => updateSolution(tab, code)}
        />
      </div>
    </div>
  );
}
