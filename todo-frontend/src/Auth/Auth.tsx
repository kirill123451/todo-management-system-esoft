import React, { useState, useEffect } from 'react';
import api from '../api' ;
import './Auth.css';

interface AuthProps {
  onAuthSuccess: (user: any) => void
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [managerId, setManagerId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLogin) {
      api.get('/users')
        .then(res => setUsers(res.data))
        .catch(() => setError('Не удалось загрузить список руководителей'))
    }
  }, [isLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { login, password })
        onAuthSuccess(res.data.user)
      } else {
        await api.post('/users/register', {
          login,
          password,
          firstName,
          lastName,
          middleName: middleName || undefined,
          managerId: managerId ? Number(managerId) : undefined
        })
        alert('Регистрация успешна! Теперь войдите.')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Что-то пошло не так')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>Имя *</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} />
              
              <label>Фамилия *</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} />
              
              <label>Отчество</label>
              <input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} />

              <label>Кто ваш руководитель?</label>
              <select value={managerId} onChange={e => setManagerId(e.target.value)}>
                <option value="">Нет руководителя (Я топ-менеджер)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{`${u.lastName} ${u.firstName}`}</option>
                ))}
              </select>
            </>
          )}

          <label>Логин *</label>
          <input type="text" required value={login} onChange={e => setLogin(e.target.value)} />

          <label>Пароль *</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />

          <button type="submit" className="primary auth-submit-btn">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-footer-text">
          {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'} {' '}
          <span className="auth-switch-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Создать' : 'Войти'}
          </span>
        </p>
      </div>
    </div>
  )
}
