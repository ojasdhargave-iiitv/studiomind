import { useState, useEffect } from "react"
import { sendMessage, sendFeedback, getChatHistory } from "../api"
import MemoryPanel from "../components/MemoryPanel"
import ChatWindow from "../components/ChatWindow"
import PreferencePopup from "../components/PreferencePopup"

export default function Chat({ projectId, onBack, onInspiration }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [memory, setMemory] = useState(null)
  const [error, setError] = useState(null)
  const [showMemory, setShowMemory] = useState(true)
  const [pendingPreference, setPendingPreference] = useState(null)

  useEffect(() => {
    if (!projectId) return
    setMessages([])
    setMemory(null)
    setError(null)
    getChatHistory(projectId)
      .then(data => setMessages(data.messages))
      .catch(err => {
        console.error("Failed to load chat history:", err)
        setMessages([])
        setError("Could not load chat history. Make sure the backend server is running.")
      })
  }, [projectId])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setInput("")
    setError(null)

    const updatedMessages = [...messages, { role: "user", content: userText }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const result = await sendMessage(userText, projectId)

      const newMessagesList = [...updatedMessages, { role: "assistant", content: result.reply }]
      setMessages(newMessagesList)

      const recalledMem = result.recalled_memory || ""
      setMemory(recalledMem)

      if (result.suggested_preferences && result.suggested_preferences.length > 0) {
        setPendingPreference(result.suggested_preferences[0])
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
    } catch (err) {
      console.error("Feedback transmission failed:", err)
    }
  }

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", overflow: "hidden" }}>
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

      {showMemory && <MemoryPanel memory={memory} />}

      {pendingPreference && (
        <PreferencePopup
          suggestion={pendingPreference}
          onClose={() => setPendingPreference(null)}
        />
      )}
    </div>
  )
}
