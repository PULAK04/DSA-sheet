import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './lib/api.js';
import { AuthProvider, useAuth } from './lib/authContext.jsx';
import Modal from './components/Modal.jsx';
import HomePage from './pages/HomePage.jsx';
import QuestionPage from './pages/QuestionPage.jsx';

function usePromptModal() {
  const [state, setState] = useState({ open: false, title: '', label: '', value: '', submit: null });
  const open = (title, label, value, submit) => setState({ open: true, title, label, value: value || '', submit });
  const close = () => setState((s) => ({ ...s, open: false }));
  return { state, open, close };
}

function HomeController() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const prompt = usePromptModal();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const { user, canEdit, requestSignIn } = useAuth();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTree();
      setTree(data.tree);
    } catch (err) {
      setError(err.message || 'Failed to load sheet');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openPrompt = (kind, context = {}, initial = '') => {
    const config = {
      topic: ['Add Topic', 'Topic name', initial, async (value) => { await api.createTopic(value); await refresh(); }],
      subtopic: ['Add Subtopic', 'Subtopic name', initial, async (value) => { await api.createSubtopic(context.topicId, value); await refresh(); }],
      question: ['Add Question', 'Question name', initial, async (value) => { const q = await api.createQuestion(context.subtopicId, value); await refresh(); nav(`/question/${q._id}`); }],
      editTopic: ['Rename Topic', 'Topic name', context.name, async (value) => { await api.updateTopic(context.id, value); await refresh(); }],
      editSubtopic: ['Rename Subtopic', 'Subtopic name', context.name, async (value) => { await api.updateSubtopic(context.id, value); await refresh(); }]
    }[kind];
    if (!config) return;
    prompt.open(...config);
  };

  const act = async (fn) => {
    try { await fn(); } catch (err) { setError(err.message); }
  };

  const onDelete = async (message, fn) => {
    if (!window.confirm(message)) return;
    await act(async () => { await fn(); await refresh(); });
  };

  const patchQuestionLocally = (questionId, patch) => {
    setTree((prev) => prev.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => ({
        ...subtopic,
        questions: subtopic.questions.map((q) => (q._id === questionId ? { ...q, ...patch } : q))
      }))
    })));
  };

  // Bumping priority/revisions updates the UI immediately instead of waiting on a
  // full tree refetch; on failure we roll back and surface the error.
  const bumpQuestion = (question, field, delta) => {
    const current = question[field] || 0;
    const next = Math.max(0, current + delta);
    patchQuestionLocally(question._id, { [field]: next });
    act(() => api.updateQuestion(question._id, { [field]: next }).catch((err) => {
      patchQuestionLocally(question._id, { [field]: current });
      throw err;
    }));
  };
  const onIncrementPriority = (question) => bumpQuestion(question, 'priority', 1);
  const onIncrementRevision = (question) => bumpQuestion(question, 'revisions', 1);
  const onResetPriority = (question) => bumpQuestion(question, 'priority', -(question.priority || 0));
  const onResetRevision = (question) => bumpQuestion(question, 'revisions', -(question.revisions || 0));

  return (
    <>
      <HomePage
        tree={tree}
        user={user}
        loading={loading}
        canEdit={canEdit}
        onSignIn={() => requestSignIn()}
        onAddTopic={() => openPrompt('topic')}
        onAddSubtopic={(topic) => openPrompt('subtopic', { topicId: topic._id })}
        onAddQuestion={(subtopic) => openPrompt('question', { subtopicId: subtopic._id })}
        onIncrementPriority={onIncrementPriority}
        onIncrementRevision={onIncrementRevision}
        onResetPriority={onResetPriority}
        onResetRevision={onResetRevision}
        onEditTopic={(topic) => openPrompt('editTopic', { id: topic._id, name: topic.name })}
        onDeleteTopic={(topic) => onDelete(`Delete "${topic.name}" and all of its subtopics/questions?`, () => api.deleteTopic(topic._id))}
        onEditSubtopic={(subtopic) => openPrompt('editSubtopic', { id: subtopic._id, name: subtopic.name })}
        onDeleteSubtopic={(subtopic) => onDelete(`Delete "${subtopic.name}" and all questions inside it?`, () => api.deleteSubtopic(subtopic._id))}
        onEditQuestion={(question) => nav(`/question/${question._id}`)}
        onDeleteQuestion={(question) => onDelete(`Delete "${question.name}"?`, () => api.deleteQuestion(question._id))}
      />

      <Modal open={prompt.state.open} title={prompt.state.title} onClose={prompt.close}>
        <PromptForm
          label={prompt.state.label}
          value={prompt.state.value}
          onCancel={prompt.close}
          onSubmit={async (value) => {
            if (!value.trim()) return;
            try { await prompt.state.submit(value.trim()); prompt.close(); }
            catch (err) { setError(err.message); }
          }}
        />
      </Modal>

      {error && <button className="error-toast" onClick={() => setError('')}>{error}</button>}
    </>
  );
}

function PromptForm({ label, value, onCancel, onSubmit }) {
  const [text, setText] = useState(value || '');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(text); }}>
      <label className="modal-label">{label}<input autoFocus value={text} onChange={(e) => setText(e.target.value)} /></label>
      <div className="modal-actions"><button type="button" className="ghost-button" onClick={onCancel}>Cancel</button><button className="primary-button" type="submit">Save</button></div>
    </form>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeController />} />
        <Route path="/question/:id" element={<QuestionRoute />} />
      </Routes>
    </AuthProvider>
  );
}

function QuestionRoute() {
  const { canEdit } = useAuth();
  return <QuestionPage canEdit={canEdit} />;
}
