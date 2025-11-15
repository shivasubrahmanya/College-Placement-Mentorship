import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import MentorsList from './pages/MentorsList'
import MentorProfile from './pages/MentorProfile'
import Feed from './pages/Feed'
import CreatePost from './pages/CreatePost'
import ResourcesList from './pages/ResourcesList'
import Chat from './pages/Chat'
import Leaderboard from './pages/Leaderboard'
import TestConnection from './pages/TestConnection'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Feed />} />
          <Route path="mentors" element={<MentorsList />} />
          <Route path="mentors/:id" element={<MentorProfile />} />
          <Route path="posts/create" element={<CreatePost />} />
          <Route path="resources" element={<ResourcesList />} />
          <Route path="chat/:userId" element={<Chat />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

