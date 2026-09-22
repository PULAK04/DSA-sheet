import { useCallback, useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

import QuestionRow from './QuestionRow.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';

function countLabel(questions) {
  const total = questions.length;
  return `${total} question${total === 1 ? '' : 's'}`;
}

function getMenuPlacement(buttonElement, estimatedHeight = 180) {
  const rect = buttonElement.getBoundingClientRect();

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  return spaceBelow < estimatedHeight && spaceAbove > spaceBelow
    ? 'up'
    : 'down';
}

export default function TopicSection({
  topic,
  canEdit,
  onAddSubtopic,
  onAddQuestion,
  onIncrementPriority,
  onIncrementRevision,
  onResetPriority,
  onResetRevision,
  onEditTopic,
  onDeleteTopic,
  onEditSubtopic,
  onDeleteSubtopic,
  onEditQuestion,
  onDeleteQuestion
}) {
  const [open, setOpen] = useState(true);
  const [subtopicsOpen, setSubtopicsOpen] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState('down');

  const closeTopicMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const topicMenuRef = useClickOutside(
    menuOpen,
    closeTopicMenu
  );

  const topicCount = useMemo(() => {
    return countLabel(
      topic.subtopics.flatMap(
        (subtopic) => subtopic.questions
      )
    );
  }, [topic.subtopics]);

  const toggleTopicMenu = (event) => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const placement = getMenuPlacement(
      event.currentTarget,
      110
    );

    setMenuPlacement(placement);
    setMenuOpen(true);
  };

  return (
    <section className="topic-section">
      {/* ================= TOPIC HEADER ================= */}

      <div className="topic-header">
        <button
          type="button"
          className="chevron-button"
          onClick={() =>
            setOpen((value) => !value)
          }
          aria-label={
            open
              ? `Collapse ${topic.name}`
              : `Expand ${topic.name}`
          }
          aria-expanded={open}
        >
          {open ? (
            <ChevronDown
              size={19}
              strokeWidth={2}
            />
          ) : (
            <ChevronRight
              size={19}
              strokeWidth={2}
            />
          )}
        </button>

        <div className="topic-title-wrap">
          <h2>{topic.name}</h2>
        </div>

        <span className="count-text topic-count">
          {topicCount}
        </span>

        <div
          className="menu-wrap"
          ref={topicMenuRef}
        >
          <button
            type="button"
            className="icon-button"
            onClick={toggleTopicMenu}
            aria-label={`Actions for ${topic.name}`}
            aria-expanded={menuOpen}
          >
            <MoreVertical
              size={18}
              strokeWidth={2}
            />
          </button>

          {menuOpen && (
            <div
              className={`action-menu ${
                menuPlacement === 'up'
                  ? 'menu-up'
                  : 'menu-down'
              }`}
            >
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditTopic(topic);
                  }}
                >
                  <Pencil size={15} />
                  Rename
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  className="danger-text"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteTopic(topic);
                  }}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= TOPIC BODY ================= */}

      {open && (
        <div className="topic-body">
          {topic.subtopics.map((subtopic) => {
            const isOpen = Boolean(
              subtopicsOpen[subtopic._id]
            );

            return (
              <SubtopicBlock
                key={subtopic._id}
                subtopic={subtopic}
                isOpen={isOpen}
                canEdit={canEdit}
                onToggleOpen={() =>
                  setSubtopicsOpen(
                    (previous) => ({
                      ...previous,
                      [subtopic._id]:
                        !isOpen
                    })
                  )
                }
                onAddQuestion={onAddQuestion}
                onIncrementPriority={
                  onIncrementPriority
                }
                onIncrementRevision={
                  onIncrementRevision
                }
                onResetPriority={
                  onResetPriority
                }
                onResetRevision={
                  onResetRevision
                }
                onEditSubtopic={
                  onEditSubtopic
                }
                onDeleteSubtopic={
                  onDeleteSubtopic
                }
                onEditQuestion={
                  onEditQuestion
                }
                onDeleteQuestion={
                  onDeleteQuestion
                }
              />
            );
          })}

          {canEdit && (
            <button
              type="button"
              className="subtopic-add"
              onClick={() =>
                onAddSubtopic(topic)
              }
            >
              <Plus size={16} />
              Add Subtopic
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SUBTOPIC
   ========================================================= */

function SubtopicBlock({
  subtopic,
  isOpen,
  canEdit,
  onToggleOpen,
  onAddQuestion,
  onIncrementPriority,
  onIncrementRevision,
  onResetPriority,
  onResetRevision,
  onEditSubtopic,
  onDeleteSubtopic,
  onEditQuestion,
  onDeleteQuestion
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] =
    useState('down');

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const menuRef = useClickOutside(
    menuOpen,
    closeMenu
  );

  const count = countLabel(
    subtopic.questions
  );

  const toggleMenu = (event) => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const placement = getMenuPlacement(
      event.currentTarget,
      110
    );

    setMenuPlacement(placement);
    setMenuOpen(true);
  };

  return (
    <div className="subtopic-block">
      <div className="subtopic-header">
        <button
          type="button"
          className="chevron-button small"
          onClick={onToggleOpen}
          aria-label={
            isOpen
              ? `Collapse ${subtopic.name}`
              : `Expand ${subtopic.name}`
          }
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronDown
              size={17}
              strokeWidth={2}
            />
          ) : (
            <ChevronRight
              size={17}
              strokeWidth={2}
            />
          )}
        </button>

        <h3>{subtopic.name}</h3>

        <span className="count-text subtopic-count">
          {count}
        </span>

        <div
          className="menu-wrap"
          ref={menuRef}
        >
          <button
            type="button"
            className="icon-button"
            onClick={toggleMenu}
            aria-label={`Actions for ${subtopic.name}`}
            aria-expanded={menuOpen}
          >
            <MoreVertical
              size={17}
              strokeWidth={2}
            />
          </button>

          {menuOpen && (
            <div
              className={`action-menu ${
                menuPlacement === 'up'
                  ? 'menu-up'
                  : 'menu-down'
              }`}
            >
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditSubtopic(
                      subtopic
                    );
                  }}
                >
                  <Pencil size={15} />
                  Rename
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  className="danger-text"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteSubtopic(
                      subtopic
                    );
                  }}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* No animation here */}
      {isOpen && (
        <div className="question-list">
          {subtopic.questions.map(
            (question) => (
              <QuestionRow
                key={question._id}
                question={question}
                canEdit={canEdit}
                onIncrementPriority={() =>
                  onIncrementPriority(
                    question
                  )
                }
                onIncrementRevision={() =>
                  onIncrementRevision(
                    question
                  )
                }
                onResetPriority={() =>
                  onResetPriority(
                    question
                  )
                }
                onResetRevision={() =>
                  onResetRevision(
                    question
                  )
                }
                onEdit={() =>
                  onEditQuestion(question)
                }
                onDelete={() =>
                  onDeleteQuestion(question)
                }
              />
            )
          )}

          {canEdit && (
            <button
              type="button"
              className="inline-add"
              onClick={() =>
                onAddQuestion(subtopic)
              }
            >
              <Plus size={16} />
              Add Question
            </button>
          )}
        </div>
      )}
    </div>
  );
}