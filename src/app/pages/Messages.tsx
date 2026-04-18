import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Send, ArrowLeft, Check, CheckCheck, Info, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ============================================================================
// TYPES
// ============================================================================

interface Profile {
  id: string;
  nome: string;
  titulo?: string;
  avatar_url?: string;
  email?: string;
}

interface Mensagem {
  id: string;
  de_id: string;
  para_id: string;
  texto: string;
  lida: boolean;
  created_at: string;
}

interface Conversa {
  userId: string;
  nome: string;
  titulo?: string;
  avatar_url?: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
}

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const COLORS = [
  "#1A6BB5", "#E24B4A", "#0D3B6E", "#D97706",
  "#7C3AED", "#059669", "#DB2777", "#0F766E"
];

const getColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const getInitials = (name: string): string => {
  return (name || "U")
    .split(" ")
    .map(x => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const timeAgo = (dateString: string): string => {
  const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(dateString).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit"
  });
};

const formatMessageTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatMessageDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useConversations = (userId: string | undefined) => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!userId) {
      setConversas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Optimized query using a more efficient approach
      const { data: messages, error: messagesError } = await supabase
        .from("mensagens")
        .select(`
          id,
          texto,
          created_at,
          lida,
          de_id,
          para_id,
          de:de_id(id, nome, titulo, avatar_url),
          para:para_id(id, nome, titulo, avatar_url)
        `)
        .or(`de_id.eq.${userId},para_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;
      if (!messages) return;

      const conversationMap = new Map<string, Conversa>();

      for (const msg of messages) {
        const other = msg.de_id === userId ? msg.para : msg.de;
        if (!other?.id) continue;

        const existing = conversationMap.get(other.id);
        
        if (!existing) {
          conversationMap.set(other.id, {
            userId: other.id,
            nome: other.nome || "Utilizador",
            titulo: other.titulo,
            avatar_url: other.avatar_url,
            lastMsg: msg.texto,
            lastTime: msg.created_at,
            unread: 0
          });
        }

        // Count unread messages
        if (msg.para_id === userId && !msg.lida) {
          const conv = conversationMap.get(other.id)!;
          conv.unread++;
          conversationMap.set(other.id, conv);
        }
      }

      setConversas(Array.from(conversationMap.values()));
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Falha ao carregar conversas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return { conversas, loading, error, reload: loadConversations };
};

const useMessages = (userId: string | undefined, otherId: string | null) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!userId || !otherId) {
      setMensagens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mark messages as read
      const { error: updateError } = await supabase
        .from("mensagens")
        .update({ lida: true })
        .eq("de_id", otherId)
        .eq("para_id", userId);

      if (updateError) console.error("Error marking messages as read:", updateError);

      // Load messages
      const { data, error: messagesError } = await supabase
        .from("mensagens")
        .select("*")
        .or(`and(de_id.eq.${userId},para_id.eq.${otherId}),and(de_id.eq.${otherId},para_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMensagens(data || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Falha ao carregar mensagens.");
    } finally {
      setLoading(false);
    }
  }, [userId, otherId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const addMessage = (message: Mensagem) => {
    setMensagens(prev => [...prev, message]);
  };

  const updateMessage = (id: string, updates: Partial<Mensagem>) => {
    setMensagens(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  return { mensagens, loading, error, addMessage, updateMessage, reload: loadMessages };
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  showOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 44, showOnline = false }) => {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: getColor(name),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Sora', sans-serif",
          fontSize: Math.max(10, size * 0.3),
          fontWeight: 800,
          color: "white",
          overflow: "hidden"
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          getInitials(name)
        )}
      </div>
      {showOnline && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: "50%",
            background: "#22C55E",
            border: "2px solid white"
          }}
        />
      )}
    </div>
  );
};

interface ConversationItemProps {
  conversation: Conversa;
  isSelected: boolean;
  onSelect: (userId: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(conversation.userId)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        cursor: "pointer",
        transition: "all 0.12s",
        background: isSelected ? "#E8F3FC" : isHovered ? "#F8F9FA" : "transparent",
        borderLeft: `3px solid ${isSelected ? "#1A6BB5" : "transparent"}`
      }}
    >
      <Avatar name={conversation.nome} avatarUrl={conversation.avatar_url} showOnline />
      
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: conversation.unread > 0 ? 700 : 600,
              color: "#0A2540",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {conversation.nome}
          </span>
          <span style={{ fontSize: 10, color: "#ADB5BD", flexShrink: 0, marginLeft: 4 }}>
            {conversation.lastTime ? timeAgo(conversation.lastTime) : ""}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: conversation.unread > 0 ? "#495057" : "#ADB5BD",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: conversation.unread > 0 ? 500 : 400
          }}
        >
          {conversation.lastMsg || "Iniciar conversa..."}
        </div>
      </div>
      
      {conversation.unread > 0 && (
        <div
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 99,
            background: "#1A6BB5",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            flexShrink: 0
          }}
        >
          {conversation.unread}
        </div>
      )}
    </div>
  );
};

interface MessageBubbleProps {
  message: Mensagem;
  isMe: boolean;
  showTime: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, showTime }) => {
  return (
    <div>
      {showTime && (
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#ADB5BD",
            margin: "8px 0 5px",
            fontWeight: 500
          }}
        >
          {formatMessageDate(message.created_at)}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 2 }}>
        <div
          style={{
            maxWidth: "72%",
            padding: "10px 13px",
            borderRadius: 16,
            borderBottomRightRadius: isMe ? 4 : 16,
            borderBottomLeftRadius: isMe ? 16 : 4,
            background: isMe ? "linear-gradient(135deg, #1A6BB5, #0D3B6E)" : "#F1F3F5",
            color: isMe ? "white" : "#212529",
            fontSize: 14,
            lineHeight: 1.55,
            boxShadow: isMe ? "0 2px 8px rgba(26,107,181,0.2)" : "none"
          }}
        >
          {message.texto}
          <div
            style={{
              fontSize: 10,
              opacity: 0.7,
              marginTop: 3,
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 3
            }}
          >
            {formatMessageTime(message.created_at)}
            {isMe && (message.lida ? <CheckCheck size={11} /> : <Check size={11} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSend, sending, placeholder = "Escreve uma mensagem..." }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isValid = value.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !sending) onSend();
    }
  };

  return (
    <div
      style={{
        padding: "10px clamp(12px, 3vw, 16px)",
        borderTop: "1px solid #F1F3F5",
        display: "flex",
        gap: 8,
        alignItems: "center",
        paddingBottom: `calc(10px + env(safe-area-inset-bottom))`
      }}
    >
      <input
        style={{
          flex: 1,
          padding: "11px 14px",
          border: `1.5px solid ${isFocused ? "#1A6BB5" : "#E9ECEF"}`,
          borderRadius: 99,
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          color: "#212529",
          outline: "none",
          background: isFocused ? "white" : "#F8F9FA",
          transition: "all 0.15s"
        }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={sending}
      />
      <button
        onClick={onSend}
        disabled={!isValid || sending}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          flexShrink: 0,
          background: isValid ? "linear-gradient(135deg, #1A6BB5, #0D3B6E)" : "#E9ECEF",
          border: "none",
          cursor: isValid ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          boxShadow: isValid ? "0 4px 12px rgba(26,107,181,0.3)" : "none"
        }}
      >
        {sending ? <Loader2 size={17} color="white" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={17} color={isValid ? "white" : "#ADB5BD"} />}
      </button>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; message: string; actionText?: string; actionLink?: string; icon?: React.ReactNode }> = ({
  title,
  message,
  actionText,
  actionLink,
  icon
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#E8F3FC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {icon || <Send size={28} color="#1A6BB5" />}
      </div>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: "#0A2540" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "#ADB5BD", textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>{message}</p>
      {actionText && actionLink && (
        <Link to={actionLink} style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 22px",
              background: "linear-gradient(135deg, #1A6BB5, #0D3B6E)",
              color: "white",
              border: "none",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {actionText} →
          </button>
        </Link>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Messages() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get("com");
  const sobreTitulo = searchParams.get("sobre");

  const [selectedId, setSelectedId] = useState<string | null>(contactId);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [searchConv, setSearchConv] = useState("");
  const [showChat, setShowChat] = useState(!!contactId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const realtimeRef = useRef<any>(null);

  const { conversas, loading: loadingConversas, error: conversasError, reload: reloadConversas } = useConversations(user?.id);
  const { mensagens, loading: loadingMensagens, addMessage, updateMessage, reload: reloadMessages } = useMessages(user?.id, selectedId);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, scrollToBottom]);

  // Load profile when selectedId changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!selectedId) {
        setSelectedProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", selectedId)
          .single();

        if (error) throw error;
        setSelectedProfile(data);
      } catch (err) {
        console.error("Error loading profile:", err);
        setErrorMessage("Falha ao carregar perfil do utilizador.");
      }
    };

    loadProfile();
  }, [selectedId]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !selectedId) return;

    const setupRealtime = async () => {
      if (realtimeRef.current) {
        await supabase.removeChannel(realtimeRef.current);
      }

      const channel = supabase
        .channel(`chat-${user.id}-${selectedId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "mensagens",
            filter: `para_id=eq.${user.id}`
          },
          async (payload) => {
            const newMessage = payload.new as Mensagem;
            
            if (newMessage.de_id === selectedId) {
              addMessage(newMessage);
              scrollToBottom();
              
              // Mark as read immediately
              await supabase
                .from("mensagens")
                .update({ lida: true })
                .eq("id", newMessage.id);
              
              updateMessage(newMessage.id, { lida: true });
              reloadConversas();
            }
          }
        )
        .subscribe();

      realtimeRef.current = channel;
    };

    setupRealtime();

    return () => {
      if (realtimeRef.current) {
        supabase.removeChannel(realtimeRef.current);
      }
    };
  }, [user?.id, selectedId, addMessage, updateMessage, reloadConversas, scrollToBottom]);

  // Initialize from URL params
  useEffect(() => {
    if (contactId && user?.id && !selectedProfile) {
      setSelectedId(contactId);
      setShowChat(true);
      
      const loadAndAddConversation = async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", contactId)
            .single();
          
          if (data) {
            setSelectedProfile(data);
            // Add to conversation list if not present
            reloadConversas();
          }
        } catch (err) {
          console.error("Error loading contact:", err);
        }
      };
      
      loadAndAddConversation();
    }
  }, [contactId, user?.id, selectedProfile, reloadConversas]);

  // Auto-fill message from "sobre" param
  useEffect(() => {
    if (sobreTitulo && mensagens.length === 0) {
      setTexto(`Olá! Vi o seu serviço "${sobreTitulo}" e gostaria de mais informações.`);
    }
  }, [sobreTitulo, mensagens.length]);

  const enviarMensagem = useCallback(async () => {
    if (!user?.id || !selectedId || !texto.trim() || sending) return;

    setSending(true);
    const msgTexto = texto.trim();
    setTexto("");

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Mensagem = {
      id: tempId,
      de_id: user.id,
      para_id: selectedId,
      texto: msgTexto,
      lida: false,
      created_at: new Date().toISOString()
    };

    addMessage(tempMessage);
    scrollToBottom();

    try {
      const { data, error } = await supabase
        .from("mensagens")
        .insert({
          de_id: user.id,
          para_id: selectedId,
          texto: msgTexto
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        updateMessage(tempId, data);
      }

      await reloadConversas();
    } catch (err) {
      console.error("Error sending message:", err);
      setErrorMessage("Falha ao enviar mensagem. Tente novamente.");
      // Revert optimistic update
      updateMessage(tempId, { ...tempMessage, error: true });
    } finally {
      setSending(false);
    }
  }, [user?.id, selectedId, texto, sending, addMessage, updateMessage, reloadConversas, scrollToBottom]);

  const selectConversation = useCallback((userId: string) => {
    setSelectedId(userId);
    setShowChat(true);
    setErrorMessage(null);
  }, []);

  const filteredConversations = conversas.filter(conv =>
    conv.nome.toLowerCase().includes(searchConv.toLowerCase())
  );

  // Auth guard
  if (!user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>💬</div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#0A2540" }}>Entra para ver as mensagens</h2>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button style={{ padding: "10px 24px", background: "linear-gradient(135deg, #1A6BB5, #0D3B6E)", color: "white", border: "none", borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Entrar</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#F4F6F9", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(12px, 3vw, 20px)", height: "calc(100vh - 80px)", display: "flex", gap: 14 }}>
        
        {/* Error Toast */}
        {errorMessage && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#E24B4A",
              color: "white",
              padding: "10px 20px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 500,
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            {errorMessage}
            <button
              onClick={() => setErrorMessage(null)}
              style={{ marginLeft: 12, background: "none", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Conversations List */}
        <div
          className="conv-list"
          style={{
            width: 300,
            background: "white",
            borderRadius: 14,
            border: "1px solid #E9ECEF",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            flexShrink: 0,
            ...(showChat ? { display: "none" as const } : {}),
            minWidth: 0
          }}
        >
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #F1F3F5" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#0A2540", marginBottom: 10 }}>Mensagens</div>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ADB5BD", pointerEvents: "none" }} />
              <input
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 30px",
                  border: "1.5px solid #E9ECEF",
                  borderRadius: 99,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#212529",
                  outline: "none",
                  background: "#F8F9FA"
                }}
                placeholder="Buscar..."
                value={searchConv}
                onChange={e => setSearchConv(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = "#1A6BB5"}
                onBlur={e => e.currentTarget.style.borderColor = "#E9ECEF"}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingConversas && (
              <div style={{ padding: "32px", textAlign: "center", color: "#ADB5BD", fontSize: 13 }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            )}
            
            {conversasError && (
              <div style={{ padding: "32px", textAlign: "center", color: "#E24B4A", fontSize: 13 }}>
                {conversasError}
                <button onClick={reloadConversas} style={{ marginTop: 12, padding: "6px 12px", background: "#1A6BB5", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  Tentar novamente
                </button>
              </div>
            )}
            
            {!loadingConversas && !conversasError && filteredConversations.length === 0 && (
              <EmptyState
                title="Sem conversas ainda"
                message="Contacta alguém a partir de uma vaga ou serviço"
                actionText="Ver Marketplace"
                actionLink="/marketplace"
                icon={<div style={{ fontSize: 32 }}>💬</div>}
              />
            )}
            
            {filteredConversations.map(conv => (
              <ConversationItem
                key={conv.userId}
                conversation={conv}
                isSelected={selectedId === conv.userId && !showChat}
                onSelect={selectConversation}
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: 14,
            border: "1px solid #E9ECEF",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            minWidth: 0,
            ...(!showChat && window.innerWidth < 640 ? { display: "none" as const } : {})
          }}
        >
          {!selectedId ? (
            <EmptyState
              title="Selecciona uma conversa"
              message="Ou contacta alguém directamente a partir de uma vaga ou serviço"
              actionText="Ver Marketplace"
              actionLink="/marketplace"
            />
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: "12px clamp(14px, 3vw, 20px)", borderBottom: "1px solid #F1F3F5", display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setShowChat(false)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#F8F9FA",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                  className="back-btn"
                >
                  <ArrowLeft size={17} color="#495057" />
                </button>
                
                <Avatar name={selectedProfile?.nome || "U"} avatarUrl={selectedProfile?.avatar_url} size={40} showOnline />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedProfile?.nome || "A carregar..."}
                  </div>
                  <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 500 }}>Online agora</div>
                </div>
              </div>

              {/* Context Banner */}
              {sobreTitulo && mensagens.length === 0 && (
                <div style={{ margin: "10px 14px 0", padding: "9px 13px", background: "#E8F3FC", borderRadius: 10, fontSize: 13, color: "#0D3B6E", display: "flex", alignItems: "center", gap: 7, border: "1px solid #1A6BB530" }}>
                  <Info size={13} color="#1A6BB5" />
                  A iniciar conversa sobre: <strong>"{sobreTitulo}"</strong>
                </div>
              )}

              {/* Messages Container */}
              <div style={{ flex: 1, overflowY: "auto", padding: "14px clamp(14px, 3vw, 20px)", display: "flex", flexDirection: "column", gap: 3, WebkitOverflowScrolling: "touch" }}>
                {loadingMensagens && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#1A6BB5" }} />
                  </div>
                )}
                
                {!loadingMensagens && mensagens.length === 0 && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "32px 0" }}>
                    <Avatar name={selectedProfile?.nome || "U"} avatarUrl={selectedProfile?.avatar_url} size={50} />
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540" }}>{selectedProfile?.nome}</div>
                    <div style={{ fontSize: 13, color: "#ADB5BD", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
                      Inicia a conversa! Apresenta-te e explica o que precisas.
                    </div>
                  </div>
                )}
                
                {mensagens.map((msg, idx) => {
                  const isMe = msg.de_id === user.id;
                  const prevMsg = idx > 0 ? mensagens[idx - 1] : null;
                  const showTime = idx === 0 || (new Date(msg.created_at).getTime() - new Date(prevMsg!.created_at).getTime()) > 300000;
                  return <MessageBubble key={msg.id} message={msg} isMe={isMe} showTime={showTime} />;
                })}
                
                <div ref={bottomRef} />
              </div>

              {/* Message Input */}
              <MessageInput
                value={texto}
                onChange={setTexto}
                onSend={enviarMensagem}
                sending={sending}
                placeholder="Escreve uma mensagem..."
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .conv-list {
            display: flex !important;
            width: 100% !important;
          }
          .back-btn {
            display: flex !important;
          }
        }
        
        @media (min-width: 641px) {
          .back-btn {
            display: none !important;
          }
          .conv-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
