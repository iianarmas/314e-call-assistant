import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ContactsPage from './pages/ContactsPage'
import CompaniesPage from './pages/CompaniesPage'
import CallPage from './pages/CallPageWithFlowNavigator'
import ScriptsPage from './pages/ScriptsPage'
import ObjectionsPage from './pages/ObjectionsPage'
import SettingsPage from './pages/SettingsPage'
import Navigation from './components/Navigation'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/scripts" element={<ScriptsPage />} />
        <Route path="/objections" element={<ObjectionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/call/:contactId" element={<CallPage />} />
        <Route path="/call/company/:companyId" element={<CallPage />} />
      </Routes>
    </Router>
  )
}

export default App
