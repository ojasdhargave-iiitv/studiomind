import { useState, useEffect } from "react"
import ProjectCard from "../components/ProjectCard"

export default function Dashboard({ projects, onOpenProject, onViewDNA, onUpdateProjects }) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newColor, setNewColor] = useState("#8b5cf6")
  const [activeTab, setActiveTab] = useState("Overview") // Overview | Board | List
  const [diagramTab, setDiagramTab] = useState("Diagram") // Diagram | Flow Chart | Map
  const [commentInput, setCommentInput] = useState("")
  const [activities, setActivities] = useState([
    "Sarah Wiliam synced memory namespace 'project_proj_001'",
    "StudioMind AI indexed Dribbble reference URL for Luminary App",
    "Compiled new Style DNA profile for user_demo_001"
  ])

  const colorChoices = ["#8b5cf6", "#f97316", "#10b981", "#06b6d4", "#ec4899", "#ef4444"]

  const createProject = () => {
    if (!newName.trim()) return
    const newProj = {
      id: `proj_${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || "Creative workspace and style boards",
      color: newColor
    }
    const updated = [...projects, newProj]
    onUpdateProjects(updated)

    // Seed memory for the new project
    if (typeof window !== "undefined") {
      localStorage.setItem(`studiomind_memories_${newProj.id}`, JSON.stringify([
        `Project ${newProj.name} created.`,
        "Memory namespace initialized."
      ]))
    }

    setNewName("")
    setNewDesc("")
    setNewColor("#8b5cf6")
    setShowCreate(false)
  }

  const handleAddComment = () => {
    if (!commentInput.trim()) return
    setActivities(prev => [commentInput.trim(), ...prev])
    setCommentInput("")
  }

  // Count total memory nodes
  const [totalNodes, setTotalNodes] = useState(6)
  useEffect(() => {
    if (typeof window !== "undefined") {
      let count = 0
      projects.forEach(p => {
        const mems = localStorage.getItem(`studiomind_memories_${p.id}`)
        if (mems) {
          try {
            count += JSON.parse(mems).length
          } catch (_) {}
        } else {
          count += 2 // seed fallback
        }
      })
      setTotalNodes(count)
    }
  }, [projects])

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "24px 40px",
      background: "#f4f5f7"
    }}>
      
      {/* 1. TOP HEADER (Inspired by reference mockup tabs & action buttons) */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "16px"
      }}>
        {/* Left Side: Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["Overview", "Board", "List"].map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? "#ffffff" : "transparent",
                  border: isActive ? "1px solid #e5e7eb" : "1px solid transparent",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: isActive ? "#0f172a" : "#64748b",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.03)" : "none",
                  transition: "all 0.15s"
                }}
              >
                {tab === "Overview" ? "🎛 Overview" : tab === "Board" ? "📋 Board" : "📝 List"}
              </button>
            )
          })}
        </div>

        {/* Right Side: Header actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            onClick={onViewDNA} 
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >
            🧬 Style DNA Report
          </button>
          
          <button 
            onClick={() => setShowCreate(true)} 
            style={{
              background: "#09090b",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            + New Canvas
          </button>
        </div>
      </div>

      {/* 2. STATS GRID (Four cards matching Mails, Latest Task, Sprint Velocity, Time Spending in layout) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "28px"
      }}>
        
        {/* STAT 1: Ingested Inspiration Stack (envelope visual mockup) */}
        <div style={statCardStyle}>
          <span style={statHeaderStyle}>Inspirations Ingested</span>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, position: "relative", marginTop: "12px" }}>
            {/* Visual envelope stack */}
            <div style={{
              width: "80px",
              height: "55px",
              background: "#f8fafc",
              border: "1.5px dashed #cbd5e1",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
              position: "relative",
              overflow: "hidden"
            }}>
              🖼
              {/* Stack effect lines */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "15px", background: "rgba(139, 92, 246, 0.05)" }} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
                12 URLs
              </span>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", marginTop: "2px" }}>
                Behance & Dribbble Stack
              </span>
            </div>
          </div>
        </div>

        {/* STAT 2: Active Workspace status (Latest Task style) */}
        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={statHeaderStyle}>Latest Sync Workspace</span>
            <span style={{ fontSize: "10px", color: "#8b5cf6", fontWeight: "700", textTransform: "uppercase" }}>Active</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8b5cf6",
              fontSize: "16px",
              fontWeight: "700"
            }}>
              L
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                Luminary App
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>
                Dec 19 - Dec 24 • High Priority
              </span>
            </div>
          </div>
        </div>

        {/* STAT 3: Style Alignment Index (Sprint Velocity style) */}
        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={statHeaderStyle}>Style Alignment Index</span>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
              87.29
            </span>
          </div>
          <div style={{ margin: "10px 0 6px" }}>
            {/* Multi-segment progress bar matching sprint progress in reference image */}
            <div style={{
              height: "8px",
              width: "100%",
              borderRadius: "4px",
              display: "flex",
              overflow: "hidden"
            }}>
              <div style={{ flex: "8", backgroundColor: "#8b5cf6" }} title="Minimalist" />
              <div style={{ flex: "4", backgroundColor: "#f97316" }} title="Typographic" />
              <div style={{ flex: "5", backgroundColor: "#10b981" }} title="Dark Mode" />
              <div style={{ flex: "3", backgroundColor: "#06b6d4" }} title="Grid Layout" />
              <div style={{ flex: "2", backgroundColor: "#cbd5e1" }} title="Interactive" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "9px", color: "#64748b", fontWeight: "700" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#8b5cf6" }} /> Minimal</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f97316" }} /> Typo</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} /> Dark</span>
          </div>
        </div>

        {/* STAT 4: Memory Density Chart (Time Spending bar chart style) */}
        <div style={statCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={statHeaderStyle}>Memory Density Map</span>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
              {totalNodes} Nodes
            </span>
          </div>
          {/* Vertical Bar Chart matching Time Spending in reference image */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "40px",
            marginTop: "12px",
            padding: "0 10px"
          }}>
            {[20, 45, 30, 60, 40, 75, 50].map((h, i) => (
              <div 
                key={i} 
                style={{
                  width: "12px",
                  height: `${h}%`,
                  background: i === 5 ? "linear-gradient(180deg, #a855f7 0%, #6366f1 100%)" : "#cbd5e1",
                  borderRadius: "3px",
                  transition: "height 0.3s"
                }} 
                title={`Workspaces count: ${h}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Inline project creator block */}
      {showCreate && (
        <div style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "28px",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
          animation: "slideDown 0.2s ease-out"
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700" }}>New Canvas</h3>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Canvas name..."
              style={inputStyle}
            />
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Brief description..."
              style={{ ...inputStyle, flex: 2 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {colorChoices.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: c,
                    border: newColor === c ? "2px solid #000" : "none",
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={createProject} disabled={!newName.trim()} style={primaryBtn}>Create</button>
              <button onClick={() => setShowCreate(false)} style={secondaryBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC WORKSPACE BOARD (Inspired by the Rinko Project Flowchart area) */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #eef0f3",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px -8px rgba(0,0,0,0.04)",
        marginBottom: "28px",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Board Header Section */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "16px",
          marginBottom: "24px"
        }}>
          {/* Diagrams Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {["Diagram", "Flow Chart", "Map"].map(t => {
              const isActive = diagramTab === t
              return (
                <button
                  key={t}
                  onClick={() => setDiagramTab(t)}
                  style={{
                    background: isActive ? "#f1f5f9" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    color: isActive ? "#0f172a" : "#64748b",
                    cursor: "pointer"
                  }}
                >
                  {t === "Diagram" ? "⛓ Diagram" : t === "Flow Chart" ? "🌿 Flow Chart" : "📍 Node Map"}
                </button>
              )
            })}
          </div>

          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
            Rinko Project Node Map
          </span>
        </div>

        {/* Node Graph Canvas (Beautiful responsive mock flow-chart representation with SVG lines) */}
        <div style={{
          position: "relative",
          height: "260px",
          background: "#fafafa",
          border: "1px solid #f1f5f9",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          
          {/* Connecting SVG paths (Matches the diagram line links in the reference image) */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          {/* Central Root Node (Matches 'Rinko Project' main box) */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#ffffff",
            border: "2px solid #8b5cf6",
            borderRadius: "12px",
            padding: "12px 18px",
            textAlign: "center",
            boxShadow: "0 10px 20px -8px rgba(139, 92, 246, 0.15)",
            zIndex: 3
          }}>
            <span style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: "800", textTransform: "uppercase", display: "block" }}>Parent Root</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Luminary Project</span>
          </div>

          {/* Node 1: Color Preference (Top Left) */}
          <div style={{ ...nodeBoxStyle, top: "15%", left: "10%", borderLeft: "4px solid #a855f7" }}>
            <span style={nodeHeaderStyle}>Style Choice</span>
            <span style={nodeTitleStyle}>Obsidian Mode (#09090b)</span>
          </div>

          {/* Node 2: Typography (Top Right) */}
          <div style={{ ...nodeBoxStyle, top: "15%", right: "10%", borderLeft: "4px solid #f97316" }}>
            <span style={nodeHeaderStyle}>Typography</span>
            <span style={nodeTitleStyle}>Outfit Title + Inter Body</span>
          </div>

          {/* Node 3: Layout structures (Bottom Left) */}
          <div style={{ ...nodeBoxStyle, bottom: "15%", left: "10%", borderLeft: "4px solid #06b6d4" }}>
            <span style={nodeHeaderStyle}>Layout specs</span>
            <span style={nodeTitleStyle}>48px margins, 12px cards</span>
          </div>

          {/* Node 4: References (Bottom Right) */}
          <div style={{ ...nodeBoxStyle, bottom: "15%", right: "10%", borderLeft: "4px solid #10b981" }}>
            <span style={nodeHeaderStyle}>Inspiration</span>
            <span style={nodeTitleStyle}>Dribbble reference shot</span>
          </div>

        </div>
      </div>

      {/* 4. ACTIVE PROJECTS GRID CARD */}
      <h3 style={{
        fontSize: "16px",
        fontWeight: "700",
        fontFamily: "'Outfit', sans-serif",
        color: "#0f172a",
        marginBottom: "18px"
      }}>
        Workspace Canvases
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {projects.map(proj => (
          <ProjectCard 
            key={proj.id} 
            project={proj} 
            onClick={() => onOpenProject(proj.id)} 
          />
        ))}
      </div>

      {/* 5. ACTIVITY LOGGER & COMMENTS BOX (Inspired by bottom comment bar) */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #eef0f3",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px -8px rgba(0,0,0,0.04)"
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Activity Logs</h3>
        
        {/* Comment input area */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
          <input
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddComment()}
            placeholder="Leave a comment or prompt note..."
            style={{
              flex: 1,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              outline: "none"
            }}
          />
          <button onClick={handleAddComment} style={primaryBtn}>Post Node</button>
        </div>

        {/* Activities history list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activities.map((act, i) => (
            <div key={i} style={{
              fontSize: "12.5px",
              color: "#475569",
              padding: "8px 12px",
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: "8px"
            }}>
              🕒 {act}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// Inline Style blocks for Dashboard
const statCardStyle = {
  background: "#ffffff",
  border: "1px solid #eef0f3",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 20px -8px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
}

const statHeaderStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
}

const nodeBoxStyle = {
  position: "absolute",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "8px 12px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
  zIndex: 2,
  minWidth: "120px"
}

const nodeHeaderStyle = {
  fontSize: "8px",
  color: "#94a3b8",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
}

const nodeTitleStyle = {
  fontSize: "11.5px",
  fontWeight: "600",
  color: "#334155",
  marginTop: "2px"
}

const inputStyle = {
  flex: 1,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "13px",
  outline: "none"
}

const primaryBtn = {
  background: "#09090b",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600"
}

const secondaryBtn = {
  background: "transparent",
  color: "#64748b",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "10px 20px",
  cursor: "pointer",
  fontSize: "13px"
}
