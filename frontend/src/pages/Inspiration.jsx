import { useState, useEffect } from "react"
import { ingestURL } from "../api"

export default function Inspiration({ projectId, onBack }) {
  const [url, setUrl] = useState("")
  const [ingested, setIngested] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined" && projectId) {
      const stored = localStorage.getItem(`studiomind_urls_${projectId}`)
      if (stored) {
        try {
          setIngested(JSON.parse(stored))
        } catch (_) {
          setIngested([])
        }
      }
    }
  }, [projectId])

  const handleIngest = async () => {
    if (!url.trim() || loading) return
    const targetUrl = url.trim()
    setLoading(true)
    setStatus(null)

    try {
      await ingestURL(targetUrl, projectId)
      
      const newIngest = { 
        url: targetUrl, 
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      }
      
      const updatedList = [newIngest, ...ingested]
      setIngested(updatedList)
      
      if (typeof window !== "undefined") {
        localStorage.setItem(`studiomind_urls_${projectId}`, JSON.stringify(updatedList))
      }

      setUrl("")
      setStatus({ 
        type: "success", 
        text: "Reference URL ingested! Cognee has added this pattern vector to your project namespace." 
      })
    } catch (err) {
      console.error(err)
      setStatus({ 
        type: "error", 
        text: "Failed to ingest URL. Please verify server connectivity." 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "40px",
      background: "#f4f5f7"
    }}>
      {/* Back button */}
      <button 
        onClick={onBack} 
        style={{
          background: "transparent",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          marginBottom: "24px",
          fontSize: "13.5px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          transition: "all 0.15s"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "#0f172a"
          e.currentTarget.style.background = "#ffffff"
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "#64748b"
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        ← Back to Workspace Chat
      </button>

      {/* Header */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #eef0f3",
        borderRadius: "16px",
        padding: "32px",
        marginBottom: "28px",
        boxShadow: "0 4px 20px -8px rgba(0, 0, 0, 0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{ fontSize: "28px" }}>🖼</span>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "800",
            fontFamily: "'Outfit', sans-serif",
            margin: 0,
            color: "#0f172a"
          }}>
            Inspiration Library
          </h1>
        </div>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14.5px", lineHeight: "1.6" }}>
          Paste layout references, UI inspiration URLs, or style sheets. Cognee will fetch the layout metadata and add them as memory graph coordinates.
        </p>
      </div>

      {/* Input panel */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #eef0f3",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px -8px rgba(0, 0, 0, 0.03)",
        marginBottom: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "12.5px"
      }}>
        <label style={{
          fontSize: "11px",
          color: "#94a3b8",
          textTransform: "uppercase",
          fontWeight: "800",
          letterSpacing: "0.05em"
        }}>
          Ingest Reference URL
        </label>
        
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleIngest()}
            placeholder="https://dribbble.com/shots/..."
            style={{
              flex: 1,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "12px 16px",
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
            onClick={handleIngest}
            disabled={loading || !url.trim()}
            style={{
              background: loading || !url.trim() 
                ? "#e2e8f0" 
                : "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              color: loading || !url.trim() ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              cursor: loading || !url.trim() ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "13.5px",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              if (!loading && url.trim()) {
                e.currentTarget.style.transform = "scale(1.02)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(168, 85, 247, 0.2)"
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {loading ? "Ingesting URL..." : "Index Design"}
          </button>
        </div>
      </div>

      {/* Status notification */}
      {status && (
        <div style={{
          padding: "14px 18px",
          borderRadius: "10px",
          fontSize: "13.5px",
          marginBottom: "28px",
          background: status.type === "success" ? "#ecfdf5" : "#fef2f2",
          color: status.type === "success" ? "#047857" : "#b91c1c",
          border: `1px solid ${status.type === "success" ? "#a7f3d0" : "#fecaca"}`
        }}>
          {status.text}
        </div>
      )}

      {/* Ingested List */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #eef0f3",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px -8px rgba(0, 0, 0, 0.03)"
      }}>
        <h3 style={{
          color: "#0f172a",
          fontSize: "13px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "16px"
        }}>
          Ingested Assets ({ingested.length})
        </h3>
        
        {ingested.length === 0 ? (
          <div style={{
            color: "#64748b",
            fontSize: "13.5px",
            textAlign: "center",
            padding: "48px 24px",
            border: "1px dashed #e2e8f0",
            borderRadius: "12px"
          }}>
            No assets ingested yet. Paste a Dribbble or Pinterest link above to expand memory context.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ingested.map((item, i) => {
              let domain = "External reference"
              try {
                domain = new URL(item.url).hostname
              } catch (_) {}

              return (
                <div 
                  key={i} 
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <span style={{
                      fontSize: "10px",
                      color: "#a855f7",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      {domain}
                    </span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        fontSize: "13.5px",
                        color: "#0f172a",
                        textDecoration: "none",
                        wordBreak: "break-all",
                        transition: "color 0.15s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
                      onMouseLeave={e => e.currentTarget.style.color = "#0f172a"}
                    >
                      {item.url}
                    </a>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>{item.time}</span>
                    <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>{item.date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
