import { useState, useEffect } from "react"
import Dashboard from "./pages/Dashboard"
import Chat from "./pages/Chat"
import StyleDNA from "./pages/StyleDNA"
import Inspiration from "./pages/Inspiration"

const DEMO_USER_ID = "user_demo_001"
const SEED_PROJECTS = [
  { id: "proj_001", name: "Luminary App", description: "Meditation & sleep tracker", color: "#8b5cf6" }, // Purple
  { id: "proj_002", name: "Forge Design System", description: "B2B SaaS component library", color: "#f59e0b" }, // Amber
  { id: "proj_003", name: "Nova Brand", description: "Fintech startup identity", color: "#10b981" }, // Emerald
]

export default function App() {
  const [page, setPage] = useState("dashboard") // dashboard | chat | dna | inspiration
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize and load projects from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("studiomind_projects")
      if (stored) {
        try {
          setProjects(JSON.parse(stored))
        } catch (_) {
          setProjects(SEED_PROJECTS)
        }
      } else {
        localStorage.setItem("studiomind_projects", JSON.stringify(SEED_PROJECTS))
        setProjects(SEED_PROJECTS)
      }
    }
  }, [])

  // Sync projects helper
  const updateProjectsList = (newList) => {
    setProjects(newList)
    if (typeof window !== "undefined") {
      localStorage.setItem("studiomind_projects", JSON.stringify(newList))
    }
  }

  // Handle sidebar navigation
  const handleNavigate = (pageName, projectId = null) => {
    setPage(pageName)
    if (projectId) {
      setActiveProjectId(projectId)
    }
  }

  // Filter projects based on search query in the sidebar
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "#f4f5f7",
      color: "#1e293b",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* 2. LEFT INNER SIDEBAR (Navigation & Profile) */}
      <div style={{
        width: "250px",
        background: "#f9fafb",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        padding: "24px 18px",
        boxSizing: "border-box",
        flexShrink: 0
      }}>
        
        {/* Brand Logo & Name */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
          paddingLeft: "4px"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#09090b",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }} onClick={() => handleNavigate("dashboard")}>
            <div style={{
              width: "12px",
              height: "12px",
              border: "2px solid #ffffff",
              transform: "rotate(45deg)"
            }} />
          </div>
          <span style={{
            fontSize: "16px",
            fontWeight: "800",
            color: "#09090b",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.01em"
          }}>
            StudioMind
          </span>
        </div>

        {/* User Profile Block */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px"
        }}>
          {/* Avatar (Orange circle with illustration) */}
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#fed7aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            border: "2px solid #ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            👩‍🎨
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", fontFamily: "'Outfit', sans-serif" }}>
              Sarah Wiliam
            </span>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
              Pro Member
            </span>
          </div>
        </div>

        {/* Search Bar pill */}
        <div style={{
          position: "relative",
          marginBottom: "24px"
        }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search canvas..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "10px 12px 10px 32px",
              fontSize: "13px",
              color: "#1e293b",
              outline: "none"
            }}
          />
          <span style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "13px",
            color: "#94a3b8"
          }}>
            🔍
          </span>
          {/* Keyboard badge ⌘ S */}
          <span style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "10px",
            color: "#94a3b8",
            background: "#f3f4f6",
            padding: "2px 4px",
            borderRadius: "4px",
            border: "1px solid #e5e7eb",
            fontFamily: "monospace"
          }}>
            ⌘S
          </span>
        </div>

        {/* General Categories */}
        <div style={{ marginBottom: "28px" }}>
          <span style={sidebarHeaderStyle}>General</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "dna", label: "Style DNA", icon: "🧬" },
              { id: "inspiration", label: "Inspiration", icon: "🖼" }
            ].map(item => {
              const isActive = page === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  style={{
                    ...sidebarItemStyle,
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "#1e293b" : "#64748b",
                    fontWeight: isActive ? "700" : "500",
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
                    border: isActive ? "1px solid #e5e7eb" : "1px solid transparent"
                  }}
                >
                  <span style={{ marginRight: "10px" }}>{item.icon}</span>
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic Project Canvases (Private Space) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <span style={sidebarHeaderStyle}>Private Space</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
            {filteredProjects.map(proj => {
              const isActive = page === "chat" && activeProjectId === proj.id
              return (
                <div
                  key={proj.id}
                  onClick={() => handleNavigate("chat", proj.id)}
                  style={{
                    ...sidebarItemStyle,
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "#1e293b" : "#64748b",
                    fontWeight: isActive ? "700" : "500",
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
                    border: isActive ? "1px solid #e5e7eb" : "1px solid transparent"
                  }}
                >
                  {/* Small color dot accent */}
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: proj.color,
                    marginRight: "12px",
                    boxShadow: `0 0 6px ${proj.color}`
                  }} />
                  <span style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                  }}>
                    {proj.name}
                  </span>
                </div>
              )
            })}
            
            {filteredProjects.length === 0 && (
              <div style={{ fontSize: "12px", color: "#94a3b8", padding: "8px 12px", fontStyle: "italic" }}>
                No canvas found
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info badge */}
        <div style={{
          background: "rgba(99, 102, 241, 0.05)",
          border: "1px solid rgba(99, 102, 241, 0.1)",
          borderRadius: "12px",
          padding: "12px 14px",
          marginTop: "auto"
        }}>
          <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Memory Sync
          </span>
          <span style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.4", display: "block" }}>
            Cognee namespace active on local sandbox.
          </span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT PANEL */}
      <div style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {page === "dashboard" && (
          <Dashboard
            projects={projects}
            onOpenProject={(id) => handleNavigate("chat", id)}
            onViewDNA={() => handleNavigate("dna")}
            onUpdateProjects={updateProjectsList}
          />
        )}
        {page === "chat" && (
          <Chat
            projectId={activeProjectId}
            onBack={() => handleNavigate("dashboard")}
            onInspiration={() => handleNavigate("inspiration")}
          />
        )}
        {page === "dna" && (
          <StyleDNA
            userId={DEMO_USER_ID}
            onBack={() => handleNavigate("dashboard")}
          />
        )}
        {page === "inspiration" && (
          <Inspiration
            projectId={activeProjectId}
            onBack={() => handleNavigate("chat")}
          />
        )}
      </div>

    </div>
  )
}

// Sidebar Styles Definitions
const sidebarHeaderStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase",
  fontWeight: "800",
  letterSpacing: "0.08em",
  display: "block",
  paddingLeft: "10px"
}

const sidebarItemStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "13.5px",
  cursor: "pointer",
  transition: "all 0.15s ease-in-out",
  boxSizing: "border-box"
}

