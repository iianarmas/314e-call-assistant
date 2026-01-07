import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ContactsPage from './pages/ContactsPage'
import CallPage from './pages/CallPage'
import ScriptsPage from './pages/ScriptsPage'
import ObjectionsPage from './pages/ObjectionsPage'
import Navigation from './components/Navigation'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/scripts" element={<ScriptsPage />} />
        <Route path="/objections" element={<ObjectionsPage />} />
        <Route path="/call/:contactId" element={<CallPage />} />
      </Routes>
    </Router>
  )
}

export default App
