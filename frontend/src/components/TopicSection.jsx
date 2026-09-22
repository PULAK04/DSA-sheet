import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import QuestionRow from './QuestionRow.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';

function countLabel(questions) {
  const total = questions.length;
  return `${total} question${total === 1 ? '' : 's'}`;
}

export default function TopicSection({ topic, canEdit, onAddSubtopic, onAddQuestion, onIncrementPriority, onIncrementRevision, onResetPriority, onResetRevision, onEditTopic, onDeleteTopic, onEditSubtopic, onDeleteSubtopic, onEditQuestion, onDeleteQuestion }) {
  const [open, setOpen] = useState(true);
  const [subtopicsOpen, setSubtopicsOpen] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTopicMenu = useCallback(() => setMenuOpen(false), []);
  const topicMenuRef = useClickOutside(menuOpen, closeTopicMenu);
  const topicCount = useMemo(() => countLabel(topic.subtopics.flatMap((s) => s.questions)), [topic.subtopics]);

  return (
    <motion.section layout className="topic-section">
      <div className="topic-header">
        <button className="chevron-button" onClick={() => setOpen((v) => !v)}>{open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</button>
        <div className="topic-title-wrap">
          <h2>{topic.name}</h2>
        </div>
        <span className="count-text topic-count">{topicCount}</span>
        <div className="menu-wrap" ref={topicMenuRef}>
          <button className="icon-button" onClick={() => setMenuOpen((v) => !v)}><MoreVertical size={18} /></button>
          {menuOpen && (
            <div className="action-menu">
              {canEdit && <button onClick={() => { setMenuOpen(false); onEditTopic(topic); }}><Pencil size={15} /> Rename</button>}
{canEdit && <button className="danger-text" onClick={() => { setMenuOpen(false); onDeleteTopic(topic); }}><Trash2 size={15} /> Delete</button>}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="topic-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            {topic.subtopics.map((subtopic) => {
              const isOpen = Boolean(subtopicsOpen[subtopic._id]);
              return (
                <SubtopicBlock
                  key={subtopic._id}
                  subtopic={subtopic}
                  isOpen={isOpen}
                  canEdit={canEdit}
                  onToggleOpen={() => setSubtopicsOpen((prev) => ({ ...prev, [subtopic._id]: !isOpen }))}
                  onAddQuestion={onAddQuestion}
                  onIncrementPriority={onIncrementPriority}
                  onIncrementRevision={onIncrementRevision}
                  onResetPriority={onResetPriority}
                  onResetRevision={onResetRevision}
                  onEditSubtopic={onEditSubtopic}
                  onDeleteSubtopic={onDeleteSubtopic}
                  onEditQuestion={onEditQuestion}
                  onDeleteQuestion={onDeleteQuestion}
                />
              );
            })}
            {canEdit && <button className="subtopic-add" onClick={() => onAddSubtopic(topic)}><Plus size={16} /> Add Subtopic</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function SubtopicBlock({ subtopic, isOpen, canEdit, onToggleOpen, onAddQuestion, onIncrementPriority, onIncrementRevision, onResetPriority, onResetRevision, onEditSubtopic, onDeleteSubtopic, onEditQuestion, onDeleteQuestion }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useClickOutside(menuOpen, closeMenu);
  const count = countLabel(subtopic.questions);

  return (
    <div className="subtopic-block">
      <div className="subtopic-header">
        <button className="chevron-button small" onClick={onToggleOpen}>{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
        <h3>{subtopic.name}</h3>
        <span className="count-text subtopic-count">{count}</span>
        <div className="menu-wrap" ref={menuRef}>
          <button className="icon-button" onClick={() => setMenuOpen((v) => !v)}><MoreVertical size={17} /></button>
          {menuOpen && (
            <div className="action-menu">
              {canEdit && <button onClick={() => { setMenuOpen(false); onEditSubtopic(subtopic); }}><Pencil size={15} /> Rename</button>}
              {canEdit && <button className="danger-text" onClick={() => { setMenuOpen(false); onDeleteSubtopic(subtopic); }}><Trash2 size={15} /> Delete</button>}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div className="question-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {subtopic.questions.map((question) => (
              <QuestionRow
                key={question._id}
                question={question}
                canEdit={canEdit}
                onIncrementPriority={() => onIncrementPriority(question)}
                onIncrementRevision={() => onIncrementRevision(question)}
                onResetPriority={() => onResetPriority(question)}
                onResetRevision={() => onResetRevision(question)}
                onEdit={() => onEditQuestion(question)}
                onDelete={() => onDeleteQuestion(question)}
              />
            ))}
            {canEdit && <button className="inline-add" onClick={() => onAddQuestion(subtopic)}><Plus size={16} /> Add Question</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
