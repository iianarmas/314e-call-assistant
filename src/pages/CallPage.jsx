import { useParams, useNavigate } from 'react-router-dom'

export default function CallPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Call Interface
        </h1>
        <p className="text-gray-600 mb-6">
          Contact ID: {contactId}
        </p>
        <p className="text-gray-500 mb-6">
          (This page will be fully built in the next step with script generation and qualification tracking)
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-600 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700"
        >
          ← Back to Contacts
        </button>
      </div>
    </div>
  )
}
