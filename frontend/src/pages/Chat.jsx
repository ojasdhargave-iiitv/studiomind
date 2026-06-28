import { useState, useEffect } from "react"
import { sendMessage, sendFeedback } from "../api"
import MemoryPanel from "../components/MemoryPanel"
import ChatWindow from "../components/ChatWindow"

export default function Chat({ projectId, onBack, onInspiration }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [memory, setMemory] = useState(null) // What Cognee recalled — shown in panel
  const [error, setError] = useState(null)

  const [showMemory, setShowMemory] = useState(true)

  // Load chat history and initial memories from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && projectId) {
      // 1. Load chat log
      const chatLog = localStorage.getItem(`studiomind_chats_${projectId}`)
      if (chatLog) {
        try {
          setMessages(JSON.parse(chatLog))
        } catch (_) {
          setMessages([
            { role: "assistant", content: "Hi! I'm StudioMind. Tell me about your project — I'll remember everything to help you design better." }
          ])
        }
      } else {
        const defaultMessages = [
          { role: "assistant", content: "Hi! I'm StudioMind. Tell me about your project — I'll remember everything to help you design better." }
        ]
        setMessages(defaultMessages)
        localStorage.setItem(`studiomind_chats_${projectId}`, JSON.stringify(defaultMessages))
      }

      // 2. Load active memories for the MemoryPanel on mount
      const memories = localStorage.getItem(`studiomind_memories_${projectId}`)
      if (memories) {
        try {
          const list = JSON.parse(memories)
          setMemory(list.join("\n"))
        } catch (_) {
          setMemory("")
        }
      } else {
        setMemory("")
      }
    }
  }, [projectId])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setInput("")
    setError(null)
    
    // Add user message optimistically
    const updatedMessages = [...messages, { role: "user", content: userText }]
    setMessages(updatedMessages)
    setLoading(true)
    
    try {
      // API call (goes through local storage mock or real API fetch)
      const result = await sendMessage(userText, projectId)
      
      const newMessagesList = [...updatedMessages, { role: "assistant", content: result.reply }]
      setMessages(newMessagesList)
      
      // Update memory panel with what Cognee recalled
      const recalledMem = result.recalled_memory || ""
      setMemory(recalledMem)
      if (recalledMem) {
        localStorage.setItem(`studiomind_memories_${projectId}`, JSON.stringify(recalledMem.split("\n")))
      }
    } catch (err) {
      console.error(err)
      const errStr = err.message || "";
      if (errStr.includes("generativelanguage") || errStr.includes("Gemini") || errStr.includes("Quota exceeded")) {
        setError("Your Google Gemini API key has exceeded its free tier quota limit. Please wait and try again later, or configure a different API key in backend/.env.");
      } else if (errStr.includes("余额不足") || errStr.includes("1113") || errStr.includes("429")) {
        setError("API Rate Limit Exceeded (429) or Insufficient Balance. If using Groq/OpenAI, you may have hit a rate limit. Please wait a moment and try again, or check your API provider dashboard.");
      } else {
        setError(errStr || "Failed to communicate with StudioMind partner. Please check your connection.");
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (type, msgContent) => {
    try {
      await sendFeedback(type, msgContent, projectId)
      
      // Refresh memory panel to show updated/improved graph state
      if (typeof window !== "undefined") {
        const memories = localStorage.getItem(`studiomind_memories_${projectId}`)
        if (memories) {
          const list = JSON.parse(memories)
          setMemory(list.join("\n"))
        }
      }
    } catch (err) {
      console.error("Feedback transmission failed:", err)
    }
  }

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", overflow: "hidden" }}>
      {/* Central Chat Window Area */}
      <ChatWindow
        projectId={projectId}
        messages={messages}
        loading={loading}
        error={error}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleFeedback={handleFeedback}
        onInspiration={onInspiration}
        onBack={onBack}
        showMemory={showMemory}
        toggleMemory={() => setShowMemory(!showMemory)}
      />
      
      {/* Right side: Memory Panel */}
      {showMemory && <MemoryPanel memory={memory} />}
    </div>
  )
}
