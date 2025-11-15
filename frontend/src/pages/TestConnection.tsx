/**
 * Test Connection Page
 * Diagnostic page to test backend connectivity
 */
import { useState } from 'react'
import { apiClient } from '../api/client'

export default function TestConnection() {
  const [results, setResults] = useState<string[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setTesting(true)
    setResults([])
    
    addResult('Starting connection tests...')
    
    // Test 1: Health endpoint
    try {
      addResult('Test 1: Testing /health endpoint...')
      const healthResponse = await apiClient.get('/health')
      addResult(`✅ Health check passed: ${JSON.stringify(healthResponse.data)}`)
    } catch (error: any) {
      addResult(`❌ Health check failed: ${error.message}`)
      addResult(`   Error code: ${error.code}`)
      addResult(`   Has response: ${!!error.response}`)
      addResult(`   Has request: ${!!error.request}`)
    }
    
    // Test 2: CORS test endpoint (optional - may not exist)
    try {
      addResult('Test 2: Testing CORS with /health endpoint...')
      const corsResponse = await apiClient.get('/health')
      addResult(`✅ CORS test passed: Backend is responding with CORS headers`)
      addResult(`   Response: ${JSON.stringify(corsResponse.data)}`)
    } catch (error: any) {
      addResult(`❌ CORS test failed: ${error.message}`)
    }
    
    // Test 3: Signup endpoint (should fail with validation, but should connect)
    try {
      addResult('Test 3: Testing /auth/signup endpoint (connection only)...')
      await apiClient.post('/auth/signup', {})
      addResult('✅ Signup endpoint is reachable')
    } catch (error: any) {
      if (error.response) {
        addResult(`✅ Signup endpoint is reachable (got ${error.response.status} - expected validation error)`)
      } else {
        addResult(`❌ Signup endpoint failed: ${error.message}`)
      }
    }
    
    // Test 4: Check API base URL
    addResult(`Test 4: API Base URL: ${apiClient.defaults.baseURL}`)
    addResult(`   Environment: ${import.meta.env.VITE_API_URL || 'using default'}`)
    
    setTesting(false)
    addResult('Tests completed!')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>
          
          <button
            onClick={testConnection}
            disabled={testing}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Run Connection Tests'}
          </button>
          
          <div className="bg-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-gray-500">Click "Run Connection Tests" to start</div>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>What to check:</strong></p>
            <ul className="list-disc list-inside mt-2">
              <li>All tests should show ✅ (green checkmark)</li>
              <li>If you see ❌ (red X), check the error message</li>
              <li>Check browser console (F12) for more details</li>
              <li>Make sure backend is running on http://127.0.0.1:8000</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

