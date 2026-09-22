import { useCallback, useState } from 'react';
import {
  ExternalLink,
  Flag,
  FileText,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside.js';

function platformLabel(question) {
  return (
    question.platform ||
    (question.externalUrl
      ? 'Open problem'
      : '')
  );
}

function getMenuPlacement(
  buttonElement,
  estimatedHeight = 210
) {
  const rect =
    buttonElement.getBoundingClientRect();

  const spaceBelow =
    window.innerHeight - rect.bottom;

  const spaceAbove = rect.top;

  /*
   * If there isn't enough room underneath,
   * and there is more room above,
   * open the menu upward.
   */
  return (
    spaceBelow < estimatedHeight &&
    spaceAbove > spaceBelow
  )
    ? 'up'
    : 'down';
}

export default function QuestionRow({
  question,
  canEdit,
  onIncrementPriority,
  onIncrementRevision,
  onResetPriority,
  onResetRevision,
  onEdit,
  onDelete
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [menuPlacement, setMenuPlacement] =
    useState('down');

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const menuRef = useClickOutside(
    menuOpen,
    closeMenu
  );

  const priority =
    question.priority || 0;

  const revisions =
    question.revisions || 0;

  const openExternal = () => {
    if (!question.externalUrl) return;

    window.open(
      question.externalUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const openYoutube = () => {
    if (!question.youtubeUrl) return;

    window.open(
      question.youtubeUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const toggleMenu = (event) => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const placement =
      getMenuPlacement(
        event.currentTarget,
        220
      );

    setMenuPlacement(
      placement
    );

    setMenuOpen(true);
  };

  return (
    <div className="question-row">
      <div className="question-main">
        <Link
          to={`/question/${question._id}`}
          className="question-title"
        >
          {question.name}
        </Link>

        {question.difficulty && (
          <span
            className={`difficulty ${question.difficulty}`}
          >
            {question.difficulty}
          </span>
        )}
      </div>

      <div className="question-actions">
        {question.externalUrl && (
          <button
            type="button"
            className="row-action"
            title={platformLabel(question)}
            onClick={openExternal}
          >
            <ExternalLink size={18} />
          </button>
        )}

        <Link
          className="row-action"
          title="Open documentation"
          to={`/question/${question._id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText size={18} />
        </Link>

        {question.youtubeUrl && (
          <button
            type="button"
            className="row-action"
            title="YouTube"
            onClick={openYoutube}
          >
            <Play
              size={16}
              fill="currentColor"
            />
          </button>
        )}

        <button
          type="button"
          className="counter-pill"
          title={`Priority: ${priority}. Click to increase.`}
          onClick={() =>
            canEdit &&
            onIncrementPriority()
          }
          disabled={!canEdit}
        >
          <Flag size={13} />

          <span className="counter-value">
            {priority}
          </span>

          <Plus size={11} />
        </button>

        <button
          type="button"
          className="counter-pill"
          title={`Revisions: ${revisions}. Click to increase.`}
          onClick={() =>
            canEdit &&
            onIncrementRevision()
          }
          disabled={!canEdit}
        >
          <RotateCw size={13} />

          <span className="counter-value">
            {revisions}
          </span>

          <Plus size={11} />
        </button>

        <div
          className="menu-wrap"
          ref={menuRef}
        >
          <button
            type="button"
            className="row-action"
            onClick={toggleMenu}
            title="More"
            aria-label="More actions"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={19} />
          </button>

          {menuOpen && (
            <div
              className={`action-menu question-menu ${
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
                    onEdit();
                  }}
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}

              {canEdit &&
                priority > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onResetPriority();
                    }}
                  >
                    <RotateCcw
                      size={15}
                    />
                    Reset priority
                  </button>
                )}

              {canEdit &&
                revisions > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onResetRevision();
                    }}
                  >
                    <RotateCcw
                      size={15}
                    />
                    Reset revisions
                  </button>
                )}

              {question.externalUrl && (
                <button
                  type="button"
                  onClick={openExternal}
                >
                  <ExternalLink
                    size={15}
                  />
                  Open problem
                </button>
              )}

              {question.youtubeUrl && (
                <button
                  type="button"
                  onClick={openYoutube}
                >
                  <Play size={15} />
                  Open video
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  className="danger-text"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
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
    </div>
  );
}