import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchConversations,
  fetchConversation,
  sendMessage as sendMessageApi,
  createConversation,
} from '@/services/api';
import styles from '@/styles/messages.module.scss';

export default function Messages() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendText, setSendText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const lastScrolledConvIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (!authLoading) router.push('/auth/login');
      return;
    }
    loadConversations();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, authLoading]);

  const conversationIdFromQuery = router.query.conversation ? Number(router.query.conversation) : null;
  useEffect(() => {
    if (conversationIdFromQuery && !loading) {
      setSelectedId(conversationIdFromQuery);
    }
  }, [conversationIdFromQuery, loading]);

  useEffect(() => {
    if (selectedId) {
      lastScrolledConvIdRef.current = null; // allow one scroll when this conversation loads
      loadConversation(selectedId);
      pollRef.current = setInterval(() => loadConversation(selectedId), 4000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    } else {
      setConversation(null);
      setMessages([]);
    }
  }, [selectedId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await fetchConversations();
      const list = res.data.conversations || [];
      setConversations(list);
      const fromQuery = router.query.conversation ? Number(router.query.conversation) : null;
      if (fromQuery && list.some((c) => c.id === fromQuery)) {
        setSelectedId(fromQuery);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async (id) => {
    setMessagesLoading(true);
    try {
      const res = await fetchConversation(id);
      setConversation(res.data.conversation);
      setMessages(res.data.messages || []);
      // Only auto-scroll when first opening this conversation (not on every poll)
      if (lastScrolledConvIdRef.current !== id) {
        lastScrolledConvIdRef.current = id;
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = sendText.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      await sendMessageApi(selectedId, text);
      setSendText('');
      await loadConversation(selectedId);
      scrollToBottom(); // keep view on latest message after sending
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const canMessage = user.role?.name === 'seller' || user.role?.name === 'customer';

  const showListOnMobile = !selectedId;
  const showThreadOnMobile = !!selectedId;

  return (
    <div className={styles.page}>
      <Head>
        <title>Messages - UrbanNext</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Messages</h1>
        <p className={styles.subtitle}>
          {canMessage
            ? `Communicate with ${user.role?.name === 'seller' ? 'customers' : 'sellers'} about orders and products.`
            : 'Messaging is available for sellers and customers.'}
        </p>

        {!canMessage ? (
          <div className={styles.empty}>
            <p>Messaging is available for sellers and customers only.</p>
          </div>
        ) : (
          <div className={styles.layout}>
            <aside className={`${styles.sidebar} ${showThreadOnMobile ? styles.sidebarHidden : ''}`}>
              {loading ? (
                <p className={styles.muted}>Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p className={styles.muted}>No conversations yet. {user.role?.name === 'customer' && 'Start one from a product page or checkout (Message seller).'}</p>
              ) : (
                <>
                  <div className={styles.sidebarHeader}>Conversations — click to open</div>
                  <ul className={styles.conversationList}>
                  {conversations.map((c) => (
                    <li
                      key={c.id}
                      className={`${styles.conversationItem} ${selectedId === c.id ? styles.active : ''}`}
                      onClick={() => setSelectedId(c.id)}
                    >
                      <div className={styles.convHeader}>
                        <span className={styles.otherName}>
                          {c.other_user?.name || 'Unknown'}
                        </span>
                        {c.unread_count > 0 && (
                          <span className={styles.unreadBadge}>{c.unread_count}</span>
                        )}
                      </div>
                      {c.last_message && (
                        <p className={styles.lastPreview}>
                          {c.last_message.is_mine ? 'You: ' : ''}{c.last_message.body}
                        </p>
                      )}
                      {c.product && (
                        <p className={styles.productLabel}>Re: {c.product.name}</p>
                      )}
                    </li>
                  ))}
                  </ul>
                </>
              )}
            </aside>

            <main className={`${styles.main} ${showListOnMobile && !conversations.length ? styles.mainFull : ''} ${showThreadOnMobile ? styles.mainActive : ''}`}>
              {!selectedId ? (
                <div className={styles.empty}>
                  <p>Click a name above (e.g. Urban Store) to view the conversation.</p>
                  <p className={styles.muted} style={{ marginTop: 8, fontSize: 13 }}>Or start a chat from a product or checkout page using &quot;Message seller&quot;.</p>
                </div>
              ) : (
                <>
                  {conversation && (
                    <div className={styles.threadHeader}>
                      <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => setSelectedId(null)}
                        aria-label="Back to conversations"
                      >
                        ← Back
                      </button>
                      <div className={styles.threadHeaderContent}>
                        <h2>{conversation.other_user?.name || 'Chat'}</h2>
                        {conversation.product && (
                          <p className={styles.threadProduct}>Re: {conversation.product.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className={styles.messagesArea}>
                    {messagesLoading ? (
                      <p className={styles.muted}>Loading...</p>
                    ) : (
                      <>
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`${styles.message} ${m.user_id === user.id ? styles.mine : styles.theirs}`}
                          >
                            <span className={styles.messageSender}>{m.user?.name}</span>
                            <p className={styles.messageBody}>{m.body}</p>
                            <span className={styles.messageTime}>
                              {new Date(m.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                  <form className={styles.sendForm} onSubmit={handleSend}>
                    <input
                      type="text"
                      value={sendText}
                      onChange={(e) => setSendText(e.target.value)}
                      placeholder="Type a message..."
                      className={styles.sendInput}
                      disabled={sending}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={sending || !sendText.trim()}>
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
