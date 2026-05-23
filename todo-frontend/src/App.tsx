import { useState, useEffect } from 'react';
import Auth from './Auth/Auth';
import Dashboard from './Dashboard/Dashboard';
import api from './api';
import './index.css';

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/me')
      .then(res => {
        setUser(res.data)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Ошибка при выходе', err)
    } finally {
      setUser(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Синхронизация сессии...</h3>
      </div>
    )
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  )
}
