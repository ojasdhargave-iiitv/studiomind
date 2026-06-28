import { useState, useEffect } from "react"
import { getDNA } from "../api"

export default function StyleDNA({ userId, onBack }) {
  const [dna, setDna] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDNA(userId)
      .then(data => setDna(data.dna))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  const sections = dna
    ? dna.split("\n").filter(l => l.trim()).map((line, i) => {
        const parts = line.split(":")
        if (parts.length > 1) {
          return { id: i, title: parts[0].trim(), text: parts.slice(1).join(":").trim() }
        }
        return { id: i, title: "Pattern Node", text: line }
      })
    : []

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
        ← Dashboard Overview
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
          <span style={{ fontSize: "28px" }}>🧬</span>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "800",
            fontFamily: "'Outfit', sans-serif",
            margin: 0,
            color: "#0f172a"
          }}>
            Creative Style DNA
          </h1>
        </div>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14.5px", lineHeight: "1.6" }}>
          This report compiles design guidelines and constraints that Cognee has indexed from your active conversations and references across all workspaces.
        </p>
      </div>

      {loading && (
        <div style={{
          color: "#64748b",
          fontSize: "14px",
          textAlign: "center",
          padding: "60px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={spinnerStyle} />
          <span>Analyzing cross-project memory graph...</span>
        </div>
      )}
      
      {error && (
        <div style={{
          color: "#ef4444",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          padding: "16px 20px",
          borderRadius: "12px",
          fontSize: "14px"
        }}>
          ⚠️ Error reading memory database: {error}
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div style={{
          color: "#64748b",
          background: "#ffffff",
          border: "1px solid #eef0f3",
          borderRadius: "16px",
          padding: "48px",
          textAlign: "center",
          boxShadow: "0 4px 20px -8px rgba(0, 0, 0, 0.04)"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔬</div>
          <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "16px", fontWeight: "700" }}>
            No DNA Fingerprint Map
          </h3>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>
            Start chatting with StudioMind and add inspiration links inside project workspaces to map your style DNA.
          </p>
        </div>
      )}

      {sections.length > 0 && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          animation: "fadeIn 0.3s ease-out forwards"
        }}>
          {sections.map((section, idx) => {
            const colors = ["#8b5cf6", "#f97316", "#10b981", "#06b6d4"];
            const accentColor = colors[idx % colors.length];

            return (
              <div 
                key={section.id} 
                style={{
                  background: "#ffffff",
                  border: "1px solid #eef0f3",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  borderLeft: `4px solid ${accentColor}`,
                  boxShadow: "0 4px 20px -8px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.2s"
                }}
              >
                <h3 style={{
                  margin: "0 0 6px",
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {section.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#475569"
                }}>
                  {section.text}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const spinnerStyle = {
  width: "20px",
  height: "20px",
  border: "2px solid rgba(0,0,0,0.05)",
  borderTop: "2px solid #8b5cf6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
}
