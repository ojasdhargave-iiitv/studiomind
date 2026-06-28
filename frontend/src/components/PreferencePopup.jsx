import { useState } from "react"
import { savePreference } from "../api"

const DEMO_USER_ID = "user_demo_001"

export default function PreferencePopup({ suggestion, onClose }) {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  if (!suggestion) return null

  const handleSelect = async (option) => {
    if (option === "Not now" || option === "Skip") {
      setDone(true)
      setTimeout(onClose, 300)
      return
    }
    setSaving(true)
    try {
      await savePreference(DEMO_USER_ID, suggestion.key, suggestion.value, suggestion.category)
      setDone(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      console.error("Failed to save preference:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "100px",
      right: "320px",
      width: "340px",
      background: "#141414",
      border: "1px solid #333",
      borderRadius: "14px",
      padding: "20px",
      zIndex: 1000,
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      animation: "slideUp 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <span style={{ fontSize: "20px" }}>🧠</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Memory Keypoint
        </span>
      </div>

      {done ? (
        <div style={{ color: "#4ade80", fontSize: "14px", textAlign: "center", padding: "12px 0" }}>
          ✓ Preference saved to your permanent memory
        </div>
      ) : (
        <>
          <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
            {suggestion.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {suggestion.options && suggestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={saving}
                style={{
                  background: opt === "Yes" || i === 0 ? "#6366f1" : "transparent",
                  color: opt === "Yes" || i === 0 ? "#fff" : "#aaa",
                  border: opt === "Yes" || i === 0 ? "none" : "1px solid #333",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving && i === 0 ? "Saving..." : opt}
              </button>
            ))}
          </div>

          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}
    </div>
  )
}
