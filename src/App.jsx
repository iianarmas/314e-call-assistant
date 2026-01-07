import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ContactsPage from './pages/ContactsPage'
import CallPage from './pages/CallPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ContactsPage />} />
        <Route path="/call/:contactId" element={<CallPage />} />
      </Routes>
    </Router>
  )
}

export default App
