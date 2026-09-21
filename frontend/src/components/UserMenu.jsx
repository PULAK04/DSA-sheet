import { useCallback, useState } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside.js';
import Modal from './Modal.jsx';

export default function UserMenu({ user, signOut, stats }) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const menuRef = useClickOutside(open, close);

  return (
    <>
      <div className="menu-wrap" ref={menuRef}>
        <button className="user-pill" onClick={() => setOpen((v) => !v)}>
          <img src={user.picture} alt="" /> {user.name} <ChevronDown size={14} />
        </button>
        {open && (
          <div className="action-menu">
            <button onClick={() => { setOpen(false); setShowProfile(true); }}><User size={15} /> View profile</button>
            <button className="danger-text" onClick={() => { setOpen(false); signOut(); }}><LogOut size={15} /> Log out</button>
          </div>
        )}
      </div>

      <Modal open={showProfile} title="Profile" onClose={() => setShowProfile(false)}>
        <div className="profile-card">
          <img src={user.picture} alt="" className="profile-avatar" />
          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-stats">
            <div><span className="profile-stat-figure">{stats.topics}</span><span>topics</span></div>
            <div><span className="profile-stat-figure">{stats.questions}</span><span>questions</span></div>
          </div>
          <button className="ghost-button" onClick={() => { setShowProfile(false); signOut(); }}><LogOut size={15} /> Log out</button>
        </div>
      </Modal>
    </>
  );
}
