import React from 'react';
import { Edit2, Trash2, CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react';
import { Reminder, Priority } from '../types';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onToggleComplete: (id: string) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    [Priority.LOW]: 'bg-green-100 text-green-800 border-green-200',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [Priority.HIGH]: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const ReminderList: React.FC<ReminderListProps> = ({ reminders, onDelete, onEdit, onToggleComplete }) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Nenhum lembrete encontrado</h3>
        <p className="text-slate-500 mt-1">Comece adicionando uma nova tarefa acima!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div 
          key={reminder.id}
          className={`group bg-white rounded-xl p-4 border transition-all hover:shadow-md ${
            reminder.isCompleted ? 'border-slate-100 bg-slate-50 opacity-75' : 'border-slate-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onToggleComplete(reminder.id)}
              className={`mt-1 flex-shrink-0 transition-colors ${
                reminder.isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-primary'
              }`}
            >
              {reminder.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className={`font-semibold text-lg truncate ${
                  reminder.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                }`}>
                  {reminder.title}
                </h3>
                <PriorityBadge priority={reminder.priority} />
              </div>
              
              {reminder.description && (
                <p className={`text-sm mb-2 ${
                  reminder.isCompleted ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {reminder.description}
                </p>
              )}
              
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>Criado em {new Date(reminder.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center">
              <button
                onClick={() => onEdit(reminder)}
                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(reminder.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
