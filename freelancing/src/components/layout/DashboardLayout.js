import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, Users, MessageSquare,
  FileText, LogOut, Bell, Search, Menu, X,
  CheckCircle, AlertCircle, DollarSign, Clock, UserCog, CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import './DashboardLayout.css';

/* ── Notification Dropdown ─────────────────────────── */
function NotificationDropdown({ role, onClose }) {
  const navigate = useNavigate();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      try {
        const notifications = [];

        if (role === 'CLIENT') {
          // Fetch projects + messages in parallel
          const [projRes, msgRes] = await Promise.all([
            api.get('/projects/my-projects'),
            api.get('/messages/conversations'),
          ]);
          const projects = projRes.data.projects || [];

          // Fetch all project proposals in parallel (not one by one)
          const propResults = await Promise.all(
            projects.slice(0, 3).map(proj =>
              api.get(`/proposals/project/${proj._id}`).catch(() => ({ data: { proposals: [] } }))
            )
          );

          projects.slice(0, 3).forEach((proj, idx) => {
            const proposals = propResults[idx]?.data?.proposals || [];
            const pending   = proposals.filter(p => p.status === 'pending');
            if (pending.length > 0) {
              notifications.push({
                id:    `proj-${proj._id}`,
                icon:  DollarSign,
                color: 'var(--cyan)',
                title: `${pending.length} new bid${pending.length > 1 ? 's' : ''} on "${proj.title}"`,
                sub:   'Tap to review proposals',
                path:  `/client/project/${proj._id}`,
                dot:   true,
              });
            }
          });

          // Add unread message notifications
          const convos = msgRes.data.conversations || [];
          convos.filter(c => c.unreadCount > 0).slice(0, 3).forEach(c => {
            notifications.push({
              id:    `msg-${c.projectId}-${c.otherUserId}`,
              icon:  MessageSquare,
              color: 'var(--violet)',
              title: `New message from ${c.otherUserName}`,
              sub:   c.latestMessage?.slice(0, 50) + (c.latestMessage?.length > 50 ? '…' : ''),
              path:  '/client/messages',
              dot:   true,
            });
          });

        } else {
          // Fetch freelancer proposals + messages in parallel
          const [propRes, msgRes] = await Promise.all([
            api.get('/proposals/my-proposals'),
            api.get('/messages/conversations'),
          ]);
          const proposals = propRes.data.proposals || [];

          proposals.slice(0, 5).forEach(p => {
            if (p.status === 'accepted') {
              notifications.push({
                id:    `bid-${p._id}`,
                icon:  CheckCircle,
                color: 'var(--ok)',
                title: `Bid accepted on "${p.project?.title}"`,
                sub:   `$${p.bidAmount} · ${p.estimatedTime}`,
                path:  '/freelancer/my-bids',
                dot:   true,
              });
            } else if (p.status === 'rejected') {
              notifications.push({
                id:    `bid-rej-${p._id}`,
                icon:  AlertCircle,
                color: 'var(--danger)',
                title: `Bid rejected on "${p.project?.title}"`,
                sub:   'Consider adjusting your proposal',
                path:  '/freelancer/my-bids',
                dot:   false,
              });
            }
          });

          const convos = msgRes.data.conversations || [];
          convos.filter(c => c.unreadCount > 0).slice(0, 3).forEach(c => {
            notifications.push({
              id:    `msg-${c.projectId}-${c.otherUserId}`,
              icon:  MessageSquare,
              color: 'var(--violet)',
              title: `New message from ${c.otherUserName}`,
              sub:   c.latestMessage?.slice(0, 50) + (c.latestMessage?.length > 50 ? '…' : ''),
              path:  '/freelancer/messages',
              dot:   true,
            });
          });
        }

        setItems(notifications);
      } catch (err) { console.error('notifications', err); }
      finally { setLoading(false); }
    })();
  }, [role]);

  const handleClick = path => { navigate(path); onClose(); };

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
      width: 340, zIndex: 500,
      background: 'linear-gradient(135deg,rgba(13,17,32,.99),rgba(8,11,20,1))',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--r-lg)',
      boxShadow: '0 24px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(47,216,238,.1)',
      overflow: 'hidden',
      animation: 'fadeUp .2s cubic-bezier(.16,.84,.44,1) both',
    }}>
      {/* Top sheen */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(47,216,238,.4),transparent)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: 0, letterSpacing: '-.01em' }}>Notifications</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', display: 'flex', padding: 2 }}>
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div className="spinner spinner-sm" style={{ margin: '0 auto' }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Bell size={26} style={{ color: 'var(--text-faint)', margin: '0 auto 12px', display: 'block', opacity: .4 }} />
            <p style={{ color: 'var(--text-faint)', fontSize: 13.5 }}>All caught up!</p>
            <p style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 4 }}>No new notifications</p>
          </div>
        ) : (
          items.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} onClick={() => handleClick(item.path)}
                style={{ display: 'flex', gap: 13, padding: '14px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .15s', position: 'relative' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Dot indicator */}
                {item.dot && <div style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />}

                {/* Icon */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${item.color === 'var(--cyan)' ? '47,216,238' : item.color === 'var(--ok)' ? '62,230,168' : item.color === 'var(--violet)' ? '139,107,245' : '244,123,123'},.1)`, border: `1px solid rgba(${item.color === 'var(--cyan)' ? '47,216,238' : item.color === 'var(--ok)' ? '62,230,168' : item.color === 'var(--violet)' ? '139,107,245' : '244,123,123'},.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: item.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13.5, margin: '0 0 3px', color: 'var(--text)', lineHeight: 1.4 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 12.5, fontFamily: 'var(--font-mono)', cursor: 'pointer', letterSpacing: '.04em' }}>
            DISMISS ALL
          </button>
        </div>
      )}
    </div>
  );
}

/* ── DashboardLayout ────────────────────────────────── */
const DashboardLayout = ({ role }) => {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const notifBtnRef = useRef(null);
  const profileMenuRef = useRef(null);

  const clientLinks = [
    { name: 'Dashboard',       path: '/client/dashboard',          icon: LayoutDashboard },
    { name: 'Post Project',    path: '/client/post-project',       icon: Briefcase       },
    { name: 'My Projects',     path: '/client/my-projects',        icon: FileText        },
    { name: 'Find Freelancers',path: '/client/search-freelancers', icon: Users           },
    { name: 'Messages',        path: '/client/messages',           icon: MessageSquare   },
    { name: 'Subscriptions',   path: '/client/subscriptions',      icon: CreditCard      },
    { name: 'Edit Profile',    path: '/client/edit-profile',       icon: UserCog         },
  ];

  const freelancerLinks = [
    { name: 'Dashboard',       path: '/freelancer/dashboard',       icon: LayoutDashboard },
    { name: 'Find Work',    path: '/freelancer/browse-projects', icon: Search          },
    { name: 'My Bids',      path: '/freelancer/bids',            icon: Clock           },
    { name: 'My Contracts', path: '/freelancer/contracts',       icon: Briefcase       },
    { name: 'Messages',     path: '/freelancer/messages',        icon: MessageSquare   },
    { name: 'Subscriptions',path: '/freelancer/subscriptions',   icon: CreditCard      },
    { name: 'Edit Profile',    path: '/freelancer/edit-profile',    icon: UserCog         },
  ];

  const links = role === 'CLIENT' ? clientLinks : freelancerLinks;

  // Poll unread message count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/messages/conversations');
        const total = (res.data.conversations || []).reduce((s, c) => s + (c.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 15000);
    return () => clearInterval(t);
  }, []);

  // Profile menu outside click listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Lumina" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lumina</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {links.map(link => {
              const Icon     = link.icon;
              const isActive = location.pathname.includes(link.path);
              return (
                <li key={link.path}>
                  <Link to={link.path} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                    <Icon size={20} />
                    <span>{link.name}</span>
                    {/* Unread badge on Messages */}
                    {link.name === 'Messages' && unreadCount > 0 && (
                      <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 99, background: 'var(--cyan)', color: '#04070d', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', boxShadow: '0 0 8px rgba(47,216,238,.5)' }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <LogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <div className="header-search">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>

          <div className="header-right">
            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                ref={notifBtnRef}
                className="notification-btn"
                onClick={() => setNotifOpen(o => !o)}
                style={{ position: 'relative' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--cyan)',
                    boxShadow: '0 0 6px var(--cyan)',
                    animation: 'breathe 2s infinite',
                  }} />
                )}
              </button>

              {notifOpen && (
                <NotificationDropdown role={role} onClose={() => setNotifOpen(false)} />
              )}
            </div>

            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <div 
                className="user-profile" 
                onClick={() => setProfileMenuOpen(o => !o)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #2fd8ee, #8b6bf5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, fontSize: 14, color: '#04070d', flexShrink: 0, boxShadow: '0 0 12px rgba(47,216,238,0.35)' }}>
                  {((user?.fullName || user?.name || 'U')[0]).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.fullName || user?.name || 'User'}</span>
                  <span className="user-role">{role === 'CLIENT' ? 'Client' : 'Freelancer'}</span>
                </div>
              </div>

              {profileMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: 220, zIndex: 500,
                  background: 'linear-gradient(135deg,rgba(13,17,32,.99),rgba(8,11,20,1))',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: '0 24px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(47,216,238,.1)',
                  padding: '8px 0',
                  animation: 'fadeUp .2s cubic-bezier(.16,.84,.44,1) both',
                }}>
                  {/* Top sheen */}
                  <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(47,216,238,.4),transparent)', pointerEvents: 'none' }} />
                  
                  <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0, color: 'var(--text)' }}>{user?.fullName || user?.name || 'User'}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '2px 0 0' }}>@{user?.username || 'user'}</p>
                  </div>

                  <button 
                    onClick={() => { navigate(role === 'CLIENT' ? '/client/edit-profile' : '/freelancer/edit-profile'); setProfileMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background .15s, color .15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                  >
                    <UserCog size={15} /> Edit Profile
                  </button>

                  <button 
                    onClick={() => { navigate(role === 'CLIENT' ? '/client/subscriptions' : '/freelancer/subscriptions'); setProfileMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background .15s, color .15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                  >
                    <CreditCard size={15} /> Subscriptions
                  </button>

                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

                  <button 
                    onClick={() => { handleLogout(); setProfileMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 13, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background .15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(244,123,123,.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
