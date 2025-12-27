import React, { useState, useEffect } from 'react';
import { User, LogOut, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { AuthService } from './services/AuthService';
import { TodoService } from './services/TodoService';

function App() {
  const [screen, setScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    const result = await TodoService.getTodos(user.userId, user.token);
    if (result.success) {
      setTodos(result.todos);
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await AuthService.login(formData.username, formData.password);
    
    if (result.success) {
      setUser({
        username: result.username,
        userId: result.userId,
        token: result.token
      });
      setScreen('dashboard');
      setFormData({ username: '', password: '' });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleCreateAccount = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await AuthService.createAccount(formData.username, formData.password);
    
    if (result.success) {
      setError('');
      alert('Account created successfully! Please login.');
      setScreen('login');
      setFormData({ username: '', password: '' });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setTodos([]);
    setScreen('welcome');
  };

  const handleAddTodo = async () => {
    if (!newTask.trim()) return;
    
    const result = await TodoService.createTodo(user.userId, newTask, user.token);
    if (result.success) {
      setTodos([...todos, result.todo]);
      setNewTask('');
    }
  };

  const handleToggleTodo = async (todoId) => {
    const todo = todos.find(t => t.id === todoId);
    const result = await TodoService.updateTodo(user.userId, todoId, {
      completed: !todo.completed
    }, user.token);
    
    if (result.success) {
      setTodos(todos.map(t => t.id === todoId ? result.todo : t));
    }
  };

  const handleDeleteTodo = async (todoId) => {
    const result = await TodoService.deleteTodo(user.userId, todoId, user.token);
    if (result.success) {
      setTodos(todos.filter(t => t.id !== todoId));
    }
  };

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.task);
  };

  const handleSaveEdit = async (todoId) => {
    if (!editingText.trim()) return;
    
    const result = await TodoService.updateTodo(user.userId, todoId, {
      task: editingText
    }, user.token);
    
    if (result.success) {
      setTodos(todos.map(t => t.id === todoId ? result.todo : t));
      setEditingId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to App</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setScreen('login')}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Login
            </button>
            
            <button
              onClick={() => setScreen('createAccount')}
              className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Login</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              onClick={() => {
                setScreen('welcome');
                setError('');
                setFormData({ username: '', password: '' });
              }}
              className="w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Account Screen
  if (screen === 'createAccount') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Account</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleCreateAccount)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleCreateAccount)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <button
              onClick={() => {
                setScreen('welcome');
                setError('');
                setFormData({ username: '', password: '' });
              }}
              className="w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="text-indigo-600" size={24} />
              </div>
              <span className="text-xl font-semibold text-gray-800">
                {user?.username}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Add Todo */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddTodo)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleAddTodo}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tasks</h2>
          
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks yet. Add one to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  {editingId === todo.id ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => handleSaveEdit(todo.id))}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(todo.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.task}
                      </span>
                      <button
                        onClick={() => handleStartEdit(todo)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;