import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, ArrowRight, ShieldCheck, MapPin, Calendar, CheckSquare, Square, RotateCw } from 'lucide-react';

const ShiftPlanner = () => {
  const { user, roommateProfile } = useAuth();
  
  const [destinationCity, setDestinationCity] = useState(user?.preferredCity || user?.currentCity || 'your new city');
  const [targetDate, setTargetDate] = useState('2026-09-15');
  
  // Custom tasks list state
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Generate system tasks based on services and city
  const generateSystemTasks = (services, city) => {
    const generatedTasks = [];
    let stepIndex = 1;

    if (services.includes('room')) {
      generatedTasks.push({
        id: `step-${stepIndex++}`,
        text: `Shortlist PGs/Rooms in ${city}`,
        link: '/marketplace?tab=rooms',
        completed: false,
        isSystem: true
      });
    }


    if (services.includes('tiffin')) {
      generatedTasks.push({
        id: `step-${stepIndex++}`,
        text: `Find and subscribe to a tiffin provider in ${city}`,
        link: '/marketplace?tab=services',
        completed: false,
        isSystem: true
      });
    }

    if (services.includes('laundry')) {
      generatedTasks.push({
        id: `step-${stepIndex++}`,
        text: 'Find laundry washing providers near your PG',
        link: '/marketplace?tab=services',
        completed: false,
        isSystem: true
      });
    }

    if (services.includes('cleaning')) {
      generatedTasks.push({
        id: `step-${stepIndex++}`,
        text: 'Schedule a room deep clean for your move-in date',
        link: '/marketplace?tab=services',
        completed: false,
        isSystem: true
      });
    }

    if (services.includes('maintenance')) {
      generatedTasks.push({
        id: `step-${stepIndex++}`,
        text: 'Save emergency electrician & plumbing contacts in your area',
        link: '/marketplace?tab=services',
        completed: false,
        isSystem: true
      });
    }

    if (services.includes('movers')) {
      generatedTasks.push({
        id: `step-${stepIndex++}`,
        text: 'Book Packers & Movers to transport luggage',
        link: '/marketplace?tab=services',
        completed: false,
        isSystem: true
      });
    }

    generatedTasks.push({
      id: `step-${stepIndex++}`,
      text: 'Estimate monthly living costs with the budget tool',
      link: '/expenses',
      completed: false,
      isSystem: true
    });

    return generatedTasks;
  };

  // Auto-generate checklists on mount based on selectedServices
  useEffect(() => {
    const activeCity = user?.preferredCity || user?.currentCity || 'your city';
    setDestinationCity(activeCity);

    const defaultServices = roommateProfile?.selectedServices || ['room'];
    const savedTasksStr = localStorage.getItem(`staysync_tasks_${user?.id || 'guest'}`);
    
    if (savedTasksStr) {
      const parsed = JSON.parse(savedTasksStr);
      // Keep custom user-added tasks and merge with updated system tasks
      const customOnly = parsed.filter(t => !t.isSystem);
      const systemTasks = generateSystemTasks(defaultServices, activeCity);
      
      // Preserve completion status of system tasks if ID matches
      const mergedSystem = systemTasks.map(sys => {
        const existing = parsed.find(t => t.text === sys.text || t.id === sys.id);
        return existing ? { ...sys, completed: existing.completed } : sys;
      });

      setTasks([...mergedSystem, ...customOnly]);
    } else {
      const initialSystemTasks = generateSystemTasks(defaultServices, activeCity);
      setTasks(initialSystemTasks);
      localStorage.setItem(`staysync_tasks_${user?.id || 'guest'}`, JSON.stringify(initialSystemTasks));
    }
  }, [user, roommateProfile]);

  // Persist tasks in localStorage
  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem(`staysync_tasks_${user?.id || 'guest'}`, JSON.stringify(updatedTasks));
  };

  const handleResetTasks = () => {
    const activeCity = user?.preferredCity || user?.currentCity || 'your city';
    const defaultServices = roommateProfile?.selectedServices || ['room'];
    const freshTasks = generateSystemTasks(defaultServices, activeCity);
    saveTasks(freshTasks);
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) return { ...t, completed: !t.completed };
      return t;
    });
    saveTasks(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `custom-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      isSystem: false
    };

    saveTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const handleDeleteTask = (id) => {
    const filtered = tasks.filter(t => t.id !== id);
    saveTasks(filtered);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-green-600" />
          Shift to a New City Planner
        </h1>
        <p className="text-xs text-gray-500 mt-1">Organize and execute your relocation tasks step-by-step.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Panel */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b">Relocation Parameters</h2>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Moving To
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Target Move Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none font-semibold"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          {/* Progress bar info */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-gray-500">Plan Progress</span>
              <span className="font-bold text-green-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 leading-none text-right font-medium">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetTasks}
            className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-gray-600" />
            <span>Re-sync with Profile Modules</span>
          </button>
        </div>

        {/* Interactive Checklist list panel */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Custom Task Add Form */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom task (e.g. Buy study table, book train tickets)"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-150">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between gap-4 group">
                  <div className="flex items-start gap-3 select-none flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="text-gray-400 hover:text-green-600 shrink-0 mt-0.5"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5 text-green-600 fill-green-50" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {task.text}
                      </p>
                      
                      {/* Marketplace Link Shortcut */}
                      {task.link && !task.completed && (
                        <Link
                          to={task.link}
                          className="text-[10px] text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-0.5 mt-1 transition-colors"
                        >
                          <span>Explore Marketplace</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions (Delete custom tasks) */}
                  <div className="shrink-0 flex items-center gap-2">
                    {!task.isSystem && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {task.completed && (
                      <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded border border-green-100">Done</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-xs">No tasks available. Configure your preferred services in Profile to generate a checklist.</p>
              </div>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-150 flex items-start gap-3 shadow-inner">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-xs text-green-800">
              <strong className="block mb-0.5 font-bold">Interactive Planner Activated</strong>
              All checklist actions are bound to your active modules. Completing steps like "Shortlist PG" will redirect you to the filter listings where you can contact local verified providers.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ShiftPlanner;
