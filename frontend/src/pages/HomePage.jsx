import { useMemo, useState } from 'react';
import { LogIn, Plus, Search } from 'lucide-react';
import TopicSection from '../components/TopicSection.jsx';
import UserMenu from '../components/UserMenu.jsx';
import { useAuth } from '../lib/authContext.jsx';

function countAll(tree) {
  const topics = tree.length;
  const questions = tree.flatMap((t) => t.subtopics.flatMap((s) => s.questions)).length;
  return { topics, questions };
}

export default function HomePage({ tree, user, loading, canEdit, onSignIn, onAddTopic, ...actions }) {
  const [query, setQuery] = useState('');
  const { signOut } = useAuth();
  const totals = useMemo(() => countAll(tree), [tree]);
  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;
    return tree
      .map((topic) => ({
        ...topic,
        subtopics: topic.subtopics
          .map((subtopic) => ({ ...subtopic, questions: subtopic.questions.filter((x) => x.name.toLowerCase().includes(q)) }))
          .filter((subtopic) => subtopic.questions.length || subtopic.name.toLowerCase().includes(q))
      }))
      .filter((topic) => topic.name.toLowerCase().includes(q) || topic.subtopics.length);
  }, [tree, query]);

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-path">~/</span>dsa-sheet</div>
        <div className="topbar-stats">
          <span className="stat-figure">{totals.questions}</span> question{totals.questions === 1 ? '' : 's'} added
        </div>
        <div className="topbar-actions">
          {user ? <UserMenu user={user} signOut={signOut} stats={totals} /> : <button className="ghost-button small" onClick={onSignIn}><LogIn size={15} /> Sign in</button>}
        </div>
      </header>

      <main>
        <section className="toolbar-section">
          <div className="search-wrap"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, subtopics, questions…" /></div>
          {canEdit && <button className="primary-button" onClick={onAddTopic}><Plus size={16} /> Add Topic</button>}
        </section>

        <section className="tree-list">
          {loading && tree.length === 0 && (
            <div className="loading-state">
              <span className="spinner" />
              <p>Loading your sheet…</p>
            </div>
          )}
          {!loading && filteredTree.length === 0 && (
            <div className="empty-state">
              <h3>{query ? 'Nothing matches your search' : 'Your sheet is empty'}</h3>
              <p>
                {query
                  ? 'Try a different search.'
                  : canEdit
                    ? 'Add your first topic to start building your sheet.'
                    : 'Sign in as the sheet admin to start adding topics.'}
              </p>
              {!query && canEdit && <button className="primary-button" onClick={onAddTopic}><Plus size={16} /> Add Topic</button>}
            </div>
          )}
          {filteredTree.map((topic) => <TopicSection key={topic._id} topic={topic} canEdit={canEdit} {...actions} />)}
        </section>
      </main>
    </div>
  );
}
