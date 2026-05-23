import React, { useState, useEffect } from 'react';
import api from '../api';
import './TaskModal.css';

interface TaskModalProps {
  currentUser: any
  task?: any 
  onClose: () => void
  onSave: () => void
}

export default function TaskModal({ currentUser, task, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM')
  const [status, setStatus] = useState(task?.status || 'TODO')
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.substring(0, 10) : '')
  const [responsibleId, setResponsibleId] = useState(task?.responsibleId || currentUser.id)
  const [subordinates, setSubordinates] = useState<any[]>([])
  const [error, setError] = useState('')

  const isCreatedByManager = task && task.creatorId === currentUser.managerId

  useEffect(() => {
    api.get('/users')
      .then(res => {
        const list = res.data.filter((u: any) => u.id === currentUser.id || u.managerId === currentUser.id)
        setSubordinates(list)
      })
      .catch(() => setError('Не удалось загрузить список сотрудников'))
  }, [currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const payload = isCreatedByManager 
      ? { status } 
      : { title, description, priority, status, dueDate, responsibleId: Number(responsibleId) }

    try {
      if (task) {
        await api.patch(`/tasks/${task.id}`, payload)
      } else {
        await api.post('/tasks', payload)
      }
      onSave() 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения задачи')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">
          {task ? 'Редактирование задачи' : 'Создание новой задачи'}
        </h3>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Название задачи</label>
          <input 
            type="text" 
            required 
            disabled={isCreatedByManager} 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />

          <label>Описание</label>
          <textarea 
            rows={3} 
            required 
            disabled={isCreatedByManager} 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />

          <label>Приоритет</label>
          <select disabled={isCreatedByManager} value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
          </select>

          <label>Статус</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="TODO">К выполнению</option>
            <option value="IN_PROGRESS">Выполняется</option>
            <option value="DONE">Выполнена</option>
            <option value="CANCELED">Отменена</option>
          </select>

          <label>Срок выполнения</label>
          <input 
            type="date" 
            required 
            disabled={isCreatedByManager} 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />

          <label>Ответственный</label>
          <select disabled={isCreatedByManager} value={responsibleId} onChange={e => setResponsibleId(e.target.value)}>
            {subordinates.length === 0 && task && (
              <option value={task.responsibleId}>{task.responsible?.lastName} {task.responsible?.firstName}</option>
            )}
            {subordinates.map(u => (
              <option key={u.id} value={u.id}>
                {u.id === currentUser.id ? 'Я сам' : `${u.lastName} ${u.firstName}`}
              </option>
            ))}
          </select>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  )
}
