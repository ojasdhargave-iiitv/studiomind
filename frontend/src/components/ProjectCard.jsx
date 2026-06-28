import { useState, useEffect } from "react"

export default function ProjectCard({ project, onClick }) {
  const [hovered, setHovered] = useState(false)
  const [memoryCount, setMemoryCount] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const memories = localStorage.getItem(`studiomind_memories_${project.id}`)
      if (memories) {
        try {
          const list = JSON.parse(memories)
          setMemoryCount(list.length)
        } catch (_) {
          setMemoryCount(2)
        }
      } else {
        setMemoryCount(project.id === "proj_001" || project.id === "proj_002" ? 2 : 0)
      }
    }
  }, [project.id])

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #eef0f3",
    borderRadius: "16px",
    padding: "24px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hovered 
      ? "0 20px 40px -15px rgba(0, 0, 0, 0.08)" 
      : "0 4px 20px -8px rgba(0, 0, 0, 0.04)"
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardStyle}
    >
      {/* Accent glow on hover */}
      {hovered && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          backgroundColor: project.color,
          animation: "slideInLeft 0.2s ease-out forwards"
        }} />
      )}

      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        {/* Project Initial Icon Box */}
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          backgroundColor: `${project.color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: project.color,
          fontSize: "18px",
          fontWeight: "700",
          fontFamily: "'Outfit', sans-serif"
        }}>
          {project.name.charAt(0)}
        </div>
        
        {/* Status Tag */}
        <span style={{
          fontSize: "11px",
          fontWeight: "600",
          padding: "4px 10px",
          borderRadius: "20px",
          backgroundColor: "#f0fdf4",
          color: "#16a34a"
        }}>
          Active Workspace
        </span>
      </div>

      {/* Body Area */}
      <h3 style={{
        margin: "0 0 6px",
        fontSize: "16px",
        fontWeight: "700",
        fontFamily: "'Outfit', sans-serif",
        color: "#0f172a"
      }}>
        {project.name}
      </h3>
      <p style={{
        margin: "0 0 20px",
        color: "#64748b",
        fontSize: "13.5px",
        lineHeight: "1.5",
        minHeight: "40px"
      }}>
        {project.description}
      </p>

      {/* Footer Area: Avatars Stack + Memory Count */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid #f1f5f9",
        paddingTop: "16px"
      }}>
        
        {/* Avatars Stack (Matches reference image task members avatar list) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {["SW", "AI", "U"].map((item, idx) => (
            <div
              key={idx}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: idx === 0 ? "#fed7aa" : idx === 1 ? "#6366f1" : "#e2e8f0",
                color: idx === 1 ? "#ffffff" : "#475569",
                border: "2px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                fontWeight: "700",
                marginLeft: idx > 0 ? "-8px" : 0,
                zIndex: 3 - idx,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
              title={idx === 0 ? "Sarah Wiliam" : idx === 1 ? "StudioMind AI" : "Collaborator"}
            >
              {item}
            </div>
          ))}
          <span style={{
            fontSize: "10px",
            color: "#64748b",
            fontWeight: "700",
            marginLeft: "6px"
          }}>
            +1
          </span>
        </div>

        {/* Memory Count */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>🧠</span>
          <span style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            {memoryCount} nodes
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { height: 0; top: 50%; transform: translateY(-50%); }
          to { height: 100%; top: 0; }
        }
      `}</style>
    </div>
  )
}
