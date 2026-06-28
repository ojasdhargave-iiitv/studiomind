import { useState, useRef, useEffect } from "react"

export default function ChatWindow({ 
  projectId, 
  messages, 
  loading, 
  error, 
  input, 
  setInput, 
  handleSend, 
  handleFeedback, 
  onInspiration, 
  onBack 
}) {
  const [feedbackState, setFeedbackState] = useState({}) // { [msgIndex]: 'thumbsup' | 'thumbsdown' }
  const messagesEndRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const clickFeedback = (index, type, content) => {
    setFeedbackState(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }))
    handleFeedback(type, content)
  }

  // Get project name
  const getProjectName = () => {
    if (projectId === "proj_001") return "Luminary App"
    if (projectId === "proj_002") return "Forge Design System"
    if (projectId === "proj_003") return "Nova Brand"
    return projectId || "Design Workspace"
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "#f4f5f7",
      height: "100%",
      position: "relative"
    }}>
      
      {/* Top Bar (Matches reference header bar layout: tabs on left, actions on right) */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#ffffff",
        zIndex: 5
      }}>
        {/* Left Side: Tabs / Workspace Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={onBack} 
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#0f172a"
              e.currentTarget.style.background = "#f1f5f9"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#64748b"
              e.currentTarget.style.background = "transparent"
            }}
          >
            ← Dashboard
          </button>

          <div style={{
            width: "1px",
            height: "20px",
            backgroundColor: "#e2e8f0"
          }} />

          {/* Active Workspace Label */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>💬</span>
            <span style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#0f172a",
              fontFamily: "'Outfit', sans-serif"
            }}>
              {getProjectName()}
            </span>
          </div>
        </div>

        {/* Right Side: Tab Buttons + Share Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            onClick={onInspiration}
            style={{
              background: "transparent",
              border: "1px solid #e2e8f0",
              color: "#475569",
              borderRadius: "10px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#f8fafc"
              e.currentTarget.style.borderColor = "#cbd5e1"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.borderColor = "#e2e8f0"
            }}
          >
            🖼 Inspiration Board
          </button>
          
          <button style={{
            background: "#09090b",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s"
          }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            Share
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === "user"
          return (
            <div 
              key={i} 
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                animation: "fadeSlideIn 0.3s ease-out forwards"
              }}
            >
              {/* Message bubble */}
              <div style={{
                maxWidth: "75%",
                background: isUser 
                  ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" 
                  : "#ffffff",
                border: isUser 
                  ? "none" 
                  : "1px solid #eef0f3",
                borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                padding: "16px 20px",
                fontSize: "14px",
                lineHeight: "1.6",
                color: isUser ? "#ffffff" : "#334155",
                boxShadow: isUser 
                  ? "0 4px 15px rgba(139, 92, 246, 0.2)" 
                  : "0 4px 20px rgba(0, 0, 0, 0.03)",
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>
              
              {/* Feedback Buttons */}
              {!isUser && i > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                  paddingLeft: "6px"
                }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                    StudioMind Partner
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      onClick={() => clickFeedback(i, "thumbsup", msg.content)} 
                      style={{
                        background: feedbackState[i] === "thumbsup" ? "#ecfdf5" : "transparent",
                        border: `1px solid ${feedbackState[i] === "thumbsup" ? "#10b981" : "#e2e8f0"}`,
                        color: feedbackState[i] === "thumbsup" ? "#10b981" : "#94a3b8",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.15s"
                      }}
                      title="This was helpful"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => clickFeedback(i, "thumbsdown", msg.content)} 
                      style={{
                        background: feedbackState[i] === "thumbsdown" ? "#fef2f2" : "transparent",
                        border: `1px solid ${feedbackState[i] === "thumbsdown" ? "#ef4444" : "#e2e8f0"}`,
                        color: feedbackState[i] === "thumbsdown" ? "#ef4444" : "#94a3b8",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.15s"
                      }}
                      title="This wasn't helpful"
                    >
                      👎
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "6px" }}>
            <div style={spinnerStyle} />
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "500" }}>
              StudioMind is checking graph memory...
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            color: "#ef4444",
            fontSize: "13.5px",
            padding: "12px 18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            maxWidth: "90%"
          }}>
            ⚠️ {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer Box (Inspired by the comment textbox at the bottom of reference image) */}
      <div style={{
        padding: "24px 32px",
        borderTop: "1px solid #e5e7eb",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <div style={{
          fontSize: "11px",
          color: "#94a3b8",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.08em"
        }}>
          Activity Chat Session
        </div>
        
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Leave a comment or design partner request..."
            disabled={loading}
            style={{
              flex: 1,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#1e293b",
              fontSize: "13.5px",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#8b5cf6"
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)"
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "#e5e7eb"
              e.currentTarget.style.boxShadow = "none"
            }}
          />
          
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            style={{
              background: loading || !input.trim() 
                ? "#e2e8f0" 
                : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              color: loading || !input.trim() ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontSize: "13.5px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              if (!loading && input.trim()) {
                e.currentTarget.style.transform = "scale(1.02)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.2)"
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            Send Prompts
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateSpinner {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const spinnerStyle = {
  width: "16px",
  height: "16px",
  border: "2px solid rgba(0,0,0,0.05)",
  borderTop: "2px solid #8b5cf6",
  borderRadius: "50%",
  animation: "rotateSpinner 1s linear infinite"
}
