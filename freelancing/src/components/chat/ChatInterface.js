import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axiosInstance';
import '../../styles/dashboard.css';

/* ── Shared field style ─────────────────────── */
const inp = {
    width: '100%', padding: '13px 16px',
    borderRadius: 'var(--r-sm)', border: '1px solid var(--border-strong)',
    background: 'rgba(255,255,255,.025)', color: 'var(--text)',
    fontSize: 14.5, fontFamily: 'var(--font-body)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .25s, box-shadow .25s',
};
const onFocus = e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.boxShadow = '0 0 0 4px rgba(47,216,238,.1)'; };
const onBlur  = e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; };

export default function ChatInterface({ currentUserRole }) {
    const [conversations, setConversations] = useState([]);
    const [activeConv,    setActiveConv]    = useState(null);
    const [messages,      setMessages]      = useState([]);
    const [newMessage,    setNewMessage]    = useState('');
    const [loading,       setLoading]       = useState(true);
    const [sending,       setSending]       = useState(false);
    const messagesEndRef = useRef(null);

    const location = useLocation();
    const initTarget = location.state?.initialActiveConv; // { otherUserId, otherUserName, projectId, projectTitle }

    /* ── fetch helpers (useCallback to avoid stale closures) ── */
    const fetchConversations = useCallback(async () => {
        try {
            const res = await api.get('/messages/conversations');
            if (res.data.success) { 
                const list = res.data.conversations;
                setConversations(list); 
                setLoading(false); 

                // Auto select or append initial target conversation if passed in navigation state
                if (initTarget) {
                    const match = list.find(c => c.projectId === initTarget.projectId && c.otherUserId === initTarget.otherUserId);
                    if (match) {
                        setActiveConv(match);
                    } else {
                        // Create a temporary conversation object to start chat
                        const newConv = {
                            projectId: initTarget.projectId,
                            projectTitle: initTarget.projectTitle || 'Project Conversation',
                            otherUserId: initTarget.otherUserId,
                            otherUserName: initTarget.otherUserName || 'Client',
                        };
                        setActiveConv(newConv);
                    }
                }
            }
        } catch (err) { console.error('fetchConversations', err); setLoading(false); }
    }, [initTarget]);

    const fetchMessages = useCallback(async (conv) => {
        if (!conv) return;
        try {
            const res = await api.get(`/messages/${conv.projectId}/${conv.otherUserId}`);
            if (res.data.success) setMessages(res.data.messages);
        } catch (err) { console.error('fetchMessages', err); }
    }, []);

    /* ── polling ── */
    useEffect(() => {
        fetchConversations();
        const t = setInterval(fetchConversations, 10000);
        return () => clearInterval(t);
    }, [fetchConversations]);

    useEffect(() => {
        if (!activeConv) return;
        fetchMessages(activeConv);
        const t = setInterval(() => fetchMessages(activeConv), 3000);
        return () => clearInterval(t);
    }, [activeConv, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ── send ── */
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv || sending) return;
        setSending(true);
        try {
            const res = await api.post('/messages/send', {
                receiverId: activeConv.otherUserId,
                projectId:  activeConv.projectId,
                content:    newMessage.trim(),
            });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage('');
                fetchConversations();
            }
        } catch (err) { console.error('send', err); }
        finally { setSending(false); }
    };

    /* ── select conversation ── */
    const handleSelectConv = (conv) => {
        setActiveConv(conv);
        setMessages([]);
        fetchMessages(conv);
    };

    /* ════════════════ RENDER ════════════════ */
    return (
        <div className="dashboard-page" style={{ height: 'calc(100vh - 130px)', overflow: 'hidden' }}>
            {/* Page title */}
            <div className="dashboard-header-flex" style={{ marginBottom: 0, flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: 26 }}>Messages</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>
                        Your project conversations
                    </p>
                </div>
            </div>

            {/* Chat shell */}
            <div style={{
                flex: 1, display: 'flex', overflow: 'hidden',
                background: 'linear-gradient(135deg,rgba(13,17,32,.95),rgba(8,11,20,.98))',
                border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
            }}>
                {/* Top sheen */}
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(47,216,238,.25),transparent)', pointerEvents: 'none' }} />

                {/* ── Sidebar ── */}
                <div style={{
                    width: 300, flexShrink: 0,
                    borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(255,255,255,.015)',
                }}>
                    <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-faint)', margin: 0 }}>
                            Conversations
                        </p>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 32, textAlign: 'center' }}><div className="spinner spinner-sm" /></div>
                        ) : conversations.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <MessageSquare size={28} style={{ color: 'var(--text-faint)', margin: '0 auto 12px', display: 'block' }} />
                                <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No conversations yet</p>
                            </div>
                        ) : conversations.map(conv => {
                            const isActive = activeConv?.otherUserId === conv.otherUserId && activeConv?.projectId === conv.projectId;
                            const initial  = conv.otherUserName?.[0]?.toUpperCase() || '?';
                            return (
                                <div key={`${conv.projectId}_${conv.otherUserId}`}
                                    onClick={() => handleSelectConv(conv)}
                                    style={{
                                        padding: '14px 18px', cursor: 'pointer', position: 'relative',
                                        borderBottom: '1px solid var(--border)',
                                        background: isActive ? 'rgba(47,216,238,.08)' : 'transparent',
                                        transition: 'background .15s',
                                        display: 'flex', gap: 12, alignItems: 'flex-start',
                                    }}
                                    onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
                                    onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {/* Active indicator */}
                                    {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 3, background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />}

                                    {/* Avatar */}
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#04070d', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                                        {initial}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                            <strong style={{ fontSize: 13.5, color: isActive ? 'var(--cyan)' : 'var(--text)', fontWeight: 600 }}>{conv.otherUserName}</strong>
                                            <span style={{ fontSize: 10.5, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                                                {new Date(conv.latestMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 11.5, color: 'var(--cyan)', margin: '0 0 3px', fontFamily: 'var(--font-mono)' }}>{conv.projectTitle}</p>
                                        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.latestMessage}</p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--cyan)', color: '#04070d', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 8px rgba(47,216,238,.6)' }}>
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Chat area ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {!activeConv ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(47,216,238,.06)', border: '1px solid rgba(47,216,238,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'breathe 2.8s infinite' }}>
                                <MessageSquare size={24} color="var(--cyan)" />
                            </div>
                            <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>Select a conversation to chat</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.02)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#04070d', fontFamily: 'var(--font-mono)' }}>
                                    {activeConv.otherUserName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, margin: 0, fontSize: 15 }}>{activeConv.otherUserName}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{activeConv.projectTitle}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {messages.map((msg, idx) => {
                                    const isMine = msg.sender._id !== activeConv.otherUserId;
                                    return (
                                        <div key={msg._id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                            <div style={{
                                                maxWidth: '68%', padding: '11px 16px',
                                                borderRadius: 16,
                                                borderBottomRightRadius: isMine ? 4 : 16,
                                                borderBottomLeftRadius: isMine ? 16 : 4,
                                                background: isMine
                                                    ? 'linear-gradient(135deg,var(--cyan),var(--violet))'
                                                    : 'rgba(255,255,255,.07)',
                                                border: isMine ? 'none' : '1px solid var(--border)',
                                                color: isMine ? '#04070d' : 'var(--text)',
                                                fontWeight: isMine ? 600 : 400,
                                                fontSize: 14, lineHeight: 1.55,
                                                boxShadow: isMine ? '0 4px 16px -6px rgba(47,216,238,.5)' : 'none',
                                            }}>
                                                {msg.content}
                                            </div>
                                            <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input bar */}
                            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,.02)', flexShrink: 0 }}>
                                <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <input
                                        type="text" value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type a message…"
                                        style={{ ...inp, borderRadius: 999, padding: '11px 18px' }}
                                        onFocus={onFocus} onBlur={onBlur}
                                    />
                                    <button type="submit" disabled={!newMessage.trim() || sending} style={{
                                        width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                                        background: newMessage.trim() && !sending
                                            ? 'linear-gradient(135deg,var(--cyan),var(--violet))'
                                            : 'rgba(255,255,255,.06)',
                                        color: newMessage.trim() && !sending ? '#04070d' : 'var(--text-faint)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                                        transition: 'box-shadow .25s, background .2s',
                                        boxShadow: newMessage.trim() && !sending ? '0 4px 16px -6px rgba(47,216,238,.6)' : 'none',
                                    }}>
                                        {sending
                                            ? <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(4,7,13,.3)', borderTopColor: '#04070d', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                                            : <Send size={17} />
                                        }
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
