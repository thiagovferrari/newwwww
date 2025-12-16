import React, { useState, useEffect } from 'react';
import { Plus, Save, Sparkles, Loader2, X } from 'lucide-react';
import { Reminder, Priority } from '../types';
import { enhanceReminder } from '../services/ai';

interface ReminderFormProps {
  initialData?: Reminder | null;
  onSave: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onCancel: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPriority(initialData.priority);
    } else {
      setTitle('');
      setDescription('');
      setPriority(Priority.MEDIUM);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, priority });
    if (!initialData) {
      setTitle('');
      setDescription('');
      setPriority(Priority.MEDIUM);
    }
  };

  const handleAIEnhance = async () => {
    if (!title.trim()) return;
    
    setIsEnhancing(true);
    try {
      const input = `${title} ${description}`;
      const enhanced = await enhanceReminder(input);
      setTitle(enhanced.improvedTitle);
      setDescription(enhanced.improvedDescription);
      setPriority(enhanced.suggestedPriority);
    } catch (error) {
      console.error("AI enhancement failed", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mb-6 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? 'Editar Lembrete' : 'Novo Lembrete'}
        </h2>
        {initialData && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Comprar leite"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={handleAIEnhance}
              disabled={isEnhancing || !title.trim()}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium text-sm"
              title="Melhorar com IA"
            >
              {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              <span className="hidden sm:inline">IA Mágica</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes adicionais..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-24 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
          <div className="flex gap-4">
            {Object.values(Priority).map((p) => (
              <label key={p} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className={`ml-2 text-sm ${
                  p === Priority.HIGH ? 'text-red-600 font-medium' : 
                  p === Priority.MEDIUM ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {p}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          {initialData && (
             <button
             type="button"
             onClick={onCancel}
             className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
           >
             Cancelar
           </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all font-medium"
          >
            {initialData ? <Save size={18} /> : <Plus size={18} />}
            {initialData ? 'Salvar Alterações' : 'Adicionar Lembrete'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReminderForm;
