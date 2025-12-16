import React, { useState, useEffect } from 'react';
import { Reminder } from './types';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import { Layout, BrainCircuit } from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setReminders(data.map(r => ({
          ...r,
          createdAt: new Date(r.created_at).getTime(),
          isCompleted: r.is_completed // Map snake_case to camelCase
        })));
      }
    } catch (e) {
      console.error("Failed to fetch reminders", e);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (data: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    try {
      const { data: newReminder, error } = await supabase
        .from('reminders')
        .insert([{
          title: data.title,
          description: data.description,
          priority: data.priority,
          is_completed: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      if (newReminder) {
        setReminders(prev => [{
          ...newReminder,
          createdAt: new Date(newReminder.created_at).getTime(),
          isCompleted: newReminder.is_completed
        }, ...prev]);
      }
    } catch (e) {
      console.error("Error adding reminder:", e);
      alert("Erro ao salvar lembrete");
    }
  };

  const updateReminder = async (data: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    if (!editingReminder) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority
        })
        .eq('id', editingReminder.id);

      if (error) throw error;

      setReminders(prev => prev.map(r =>
        r.id === editingReminder.id
          ? { ...r, ...data }
          : r
      ));
      setEditingReminder(null);
    } catch (e) {
      console.error("Error updating reminder:", e);
      alert("Erro ao atualizar lembrete");
    }
  };

  const deleteReminder = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      try {
        const { error } = await supabase
          .from('reminders')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setReminders(prev => prev.filter(r => r.id !== id));
      } catch (e) {
        console.error("Error deleting reminder:", e);
        alert("Erro ao excluir lembrete");
      }
    }
  };

  const toggleComplete = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !reminder.isCompleted })
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.map(r =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      ));
    } catch (e) {
      console.error("Error toggling status:", e);
    }
  };

  const handleSave = (data: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    if (editingReminder) {
      updateReminder(data);
    } else {
      addReminder(data);
    }
  };

  const filteredReminders = reminders
    .filter(r => {
      if (filter === 'active') return !r.isCompleted;
      if (filter === 'completed') return r.isCompleted;
      return true;
    })
    .sort((a, b) => {
      if (a.isCompleted === b.isCompleted) {
        return b.createdAt - a.createdAt;
      }
      return a.isCompleted ? 1 : -1;
    });

  const stats = {
    total: reminders.length,
    active: reminders.filter(r => !r.isCompleted).length,
    completed: reminders.filter(r => r.isCompleted).length
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Lembretes AI</h1>
              <p className="text-xs text-slate-500 font-medium">Gerenciador Inteligente</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-slate-600">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-semibold text-slate-800">{stats.active}</span>
              <span className="text-xs">Pendentes</span>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-semibold text-green-600">{stats.completed}</span>
              <span className="text-xs">Concluídas</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Intro / AI Callout */}
        {!process.env.API_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <BrainCircuit className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-800 text-sm">IA não configurada</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Para usar os recursos de aprimoramento de texto com IA, configure sua <code>API_KEY</code> do Gemini no ambiente.
              </p>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        <ReminderForm
          initialData={editingReminder}
          onSave={handleSave}
          onCancel={() => setEditingReminder(null)}
        />

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === f
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Pendentes' : 'Concluídos'}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-10 text-slate-500">Carregando lembretes...</div>
        ) : (
          <ReminderList
            reminders={filteredReminders}
            onDelete={deleteReminder}
            onEdit={setEditingReminder}
            onToggleComplete={toggleComplete}
          />
        )}
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 mt-12 bg-white">
        <p className="flex items-center justify-center gap-2">
          Desenvolvido com React, Tailwind e IA
        </p>
      </footer>
    </div>
  );
};

export default App;
