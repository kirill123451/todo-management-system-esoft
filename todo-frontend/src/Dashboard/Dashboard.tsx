import { useEffect, useState } from 'react'
import api from '../api'
import TaskModal from '../TaskModal/TaskModal'
import './Dashboard.css'

interface DashboardProps {
  user: any
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<any[]>([])
  const [view, setView] = useState<'my' | 'subordinates'>('my')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?view=${view}`)
      setTasks(res.data)
    } catch (err) {
      alert('Не удалось загрузить задачи')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [view])

  function isOverdue(dateStr: string, status: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateStr)
    return dueDate < today && status !== 'DONE' && status !== 'CANCELED'
  }

  const getGroupedTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endOfWeek = new Date()
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    endOfWeek.setHours(23, 59, 59, 999)

    const groupToday: any[] = []
    const groupWeek: any[] = []
    const groupFuture: any[] = []

    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate)
      const isPastOrToday = taskDate <= today || taskDate.toDateString() === today.toDateString()

      if (isPastOrToday) {
        groupToday.push(task)
      } else if (taskDate > today && taskDate <= endOfWeek) {
        groupWeek.push(task)
      } else {
        groupFuture.push(task)
      }
    })

    return { groupToday, groupWeek, groupFuture }
  }

  const { groupToday, groupWeek, groupFuture } = getGroupedTasks()

  const handleCreateClick = () => {
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleSaveSuccess = () => {
    setIsModalOpen(false)
    fetchTasks()
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          Вы вошли как: <strong>{user.lastName} {user.firstName}</strong> 
          {user.managerId ? ' (Подчиненный)' : ' (Руководитель / Top-менеджер)'}
        </div>
        <button onClick={onLogout} style={{ backgroundColor: '#e53e3e', color: 'white' }}>
          Выйти
        </button>
      </header>

      <div className="controls-row">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${view === 'my' ? 'active' : ''}`} 
            onClick={() => setView('my')}
          >
            Мои задачи
          </button>
          <button 
            className={`filter-btn ${view === 'subordinates' ? 'active' : ''}`} 
            onClick={() => setView('subordinates')}
          >
            Задачи подчиненных
          </button>
        </div>
        <button className="primary" onClick={handleCreateClick}>
          + Создать задачу
        </button>
      </div>

      <div className="task-grid">
        <div className="date-group-column">
          <h3 className="group-title">Сегодня ({groupToday.length})</h3>
          {groupToday.map(task => (
            <div key={task.id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
              <TaskCard task={task} isOverdue={isOverdue} />
            </div>
          ))}
        </div>

        <div className="date-group-column">
          <h3 className="group-title">На неделю ({groupWeek.length})</h3>
          {groupWeek.map(task => (
            <div key={task.id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
              <TaskCard task={task} isOverdue={isOverdue} />
            </div>
          ))}
        </div>

        <div className="date-group-column">
          <h3 className="group-title">Будущее ({groupFuture.length})</h3>
          {groupFuture.map(task => (
            <div key={task.id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
              <TaskCard task={task} isOverdue={isOverdue} />
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <TaskModal 
          currentUser={user} 
          task={selectedTask} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveSuccess} 
        />
      )}
    </div>
  )
}

function TaskCard({ task, isOverdue }: { task: any, isOverdue: Function }) {
  const overdue = isOverdue(task.dueDate, task.status)
  let color = 'title-gray'
  
  if (task.status === 'DONE') {
    color = 'title-green'
  } else if (overdue) {
    color = 'title-red'
  }

  return (
    <div className={`task-card priority-${task.priority}`}>
      <h4 className={`task-title ${color}`}>
        {task.title} {overdue && '⚠️ (Просрочено!)'}
      </h4>
      <p className="task-desc">{task.description}</p>
      
      <div className="task-meta">
        <span>До: {new Date(task.dueDate).toLocaleDateString()}</span>
        <span className={`badge status-${task.status}`}>{task.status}</span>
      </div>
      <div style={{ fontSize: '11px', marginTop: '8px', color: '#a0aec0' }}>
        Ответственный: {task.responsible?.lastName} {task.responsible?.firstName}
      </div>
    </div>
  )
}
