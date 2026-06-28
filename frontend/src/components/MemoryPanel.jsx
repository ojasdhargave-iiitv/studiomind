export default function MemoryPanel({ memory }) {
  const lines = memory ? memory.split("\n").filter(l => l.trim()) : []

  return (
    <div style={{
      width: "300px",
      borderLeft: "1px solid #e5e7eb",
      background: "rgba(255, 255, 255, 0.75)",
      backdropFilter: "blur(20px)",
      padding: "24px 20px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxSizing: "border-box",
      height: "100%",
      flexShrink: 0
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: "16px",
        marginBottom: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧠</span>
          <span style={{
            fontSize: "12px",
            fontWeight: "800",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "'Outfit', sans-serif"
          }}>
            Memory Graph
          </span>
        </div>
        
        {/* Pulsing Sync dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            boxShadow: "0 0 8px #10b981",
            animation: "pulse 2s infinite"
          }} />
          <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>Synced</span>
        </div>
      </div>

      {/* Styled animation keyframes inside style tag for pulsing effect */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Memory items list */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        overflowY: "auto"
      }}>
        {lines.length === 0 ? (
          <div style={{
            color: "#64748b",
            fontSize: "13px",
            lineHeight: "1.6",
            textAlign: "center",
            padding: "40px 16px",
            background: "#ffffff",
            border: "1px dashed #e2e8f0",
            borderRadius: "12px"
          }}>
            Memory context will appear here once you send your first message. Cognee automatically recalls relevant past conversations.
          </div>
        ) : (
          lines.map((line, i) => {
            const displayText = line.replace(/^[•\-\*\s]+/, "")
            
            // Warm color borders (matching pastel workspace card styles in the image)
            const borderColors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]
            const accentColor = borderColors[i % borderColors.length]

            return (
              <div key={i} style={{
                background: "#ffffff",
                border: "1px solid #eef0f3",
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: "10px",
                padding: "14px 16px",
                fontSize: "12.5px",
                color: "#334155",
                lineHeight: "1.55",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                transition: "all 0.2s"
              }}>
                <div style={{
                  fontSize: "9px",
                  color: accentColor,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "4px"
                }}>
                  node_entry_{i + 1}
                </div>
                {displayText}
              </div>
            )
          })
        )}
      </div>

      {lines.length > 0 && (
        <div style={{
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f9",
          textAlign: "center"
        }}>
          <span style={{
            fontSize: "10px",
            color: "#94a3b8",
            fontWeight: "700",
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}>
            Cognee Graph Namespace
          </span>
        </div>
      )}
    </div>
  )
}
