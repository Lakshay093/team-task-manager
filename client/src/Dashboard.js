import { useEffect, useState } from "react";
import API from "./api";

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "", project: "", dueDate: "" });
  const [isCreating, setIsCreating] = useState(false);

  // View/Edit Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'admin') {
      fetchUsersAndProjects();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      // If user is a member, ideally backend filters, but we can also filter here for safety.
      // Wait, assignment says members only track progress. Let's show all or just assigned to them.
      // To strictly match "only view", let's filter if member.
      if (user?.role === 'member') {
        setTasks(res.data.filter(t => t.assignedTo?._id === user.id || t.assignedTo === user.id));
      } else {
        setTasks(res.data);
      }
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const fetchUsersAndProjects = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        API.get("/users"),
        API.get("/projects")
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error("Error fetching users/projects", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    setIsCreating(true);
    try {
      const payload = { ...newTask };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.project) delete payload.project;
      if (!payload.dueDate) delete payload.dueDate;
      
      await API.post("/tasks", payload);
      setNewTask({ title: "", assignedTo: "", project: "", dueDate: "" });
      setShowCreateModal(false);
      fetchTasks();
    } catch (err) {
      console.error("Error creating task", err);
      alert("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTask) return;
    setIsUpdating(true);
    try {
      await API.put(`/tasks/${selectedTask._id}`, { status: newStatus });
      setSelectedTask({ ...selectedTask, status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task", err);
      alert("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask || !window.confirm("Are you sure you want to delete this task?")) return;
    setIsUpdating(true);
    try {
      await API.delete(`/tasks/${selectedTask._id}`);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task", err);
      alert("Failed to delete task");
    } finally {
      setIsUpdating(false);
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Dashboard</h1>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
          >
            + New Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-gray-500">
            {user?.role === 'admin' ? 'Get started by creating a new task.' : 'You have no assigned tasks.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div 
              key={task._id} 
              className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border ${isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50/10' : 'border-gray-100'} overflow-hidden flex flex-col`}
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight pr-2">
                    {task.title}
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}
                    </span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-4 space-y-1">
                  <p><span className="font-medium text-gray-700">Assignee:</span> {task.assignedTo?.name || 'Unassigned'}</p>
                  <p><span className="font-medium text-gray-700">Project:</span> {task.project?.name || 'None'}</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <div className={`text-xs font-medium ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-500'}`}>
                  {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No Due Date'}
                </div>
                <button 
                  onClick={() => setSelectedTask(task)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold transition-colors"
                >
                  View details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal Overlay */}
      {showCreateModal && user?.role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="E.g. Review pull requests..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">-- Select Member --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTask.title.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md transition-all flex items-center"
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 pr-8">{selectedTask.title}</h3>
                <div className="text-sm text-gray-500 mt-1 flex space-x-4">
                  <span>Assignee: {selectedTask.assignedTo?.name || 'Unassigned'}</span>
                  <span>Project: {selectedTask.project?.name || 'None'}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Update Status</h4>
                <select 
                  value={selectedTask.status || 'todo'}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white appearance-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                {user?.role === 'admin' ? (
                  <button
                    onClick={handleDeleteTask}
                    disabled={isUpdating}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Task
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-md transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}