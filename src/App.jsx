import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ContactsPage from './pages/ContactsPage'
import CallPage from './pages/CallPage'
import Navigation from './components/Navigation'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/call/:contactId" element={<CallPage />} />
      </Routes>
    </Router>
  )
}

export default App
