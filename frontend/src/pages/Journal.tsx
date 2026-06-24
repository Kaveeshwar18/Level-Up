import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Calendar,
  Save,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  CheckCircle
} from 'lucide-react';
import journalService from '../services/journal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export const Journal: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Check if a date was passed from the Calendar page
  const passedDate = location.state?.date;
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(passedDate || todayStr);

  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Fetch all past journal entries for the list sidebar
  const { data: pastEntries, isLoading: listLoading } = useQuery({
    queryKey: ['journals-list'],
    queryFn: journalService.getJournals,
  });

  // Fetch the specific journal entry for the selected date
  const { data: currentEntry, isLoading: entryLoading } = useQuery({
    queryKey: ['journal-entry', selectedDate],
    queryFn: () => journalService.getJournalByDate(selectedDate).catch(() => null),
    retry: false,
  });

  // Save journal entry mutation
  const saveEntryMutation = useMutation({
    mutationFn: (data: { date: string; content: string }) => journalService.createOrUpdateJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals-list'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entry', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsSaved(true);
    },
  });

  // Delete mutation
  const deleteEntryMutation = useMutation({
    mutationFn: journalService.deleteJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals-list'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entry', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setIsSaved(true);
    },
  });

  // Load entry content into the editor on change
  useEffect(() => {
    if (editorRef.current) {
      if (currentEntry) {
        editorRef.current.innerHTML = currentEntry.content;
      } else {
        editorRef.current.innerHTML = '';
      }
      setIsSaved(true);
    }
  }, [currentEntry, selectedDate, entryLoading]);

  const handleEditorChange = () => {
    setIsSaved(false);
  };

  const handleSave = () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    if (!htmlContent.trim() || htmlContent === '<br>') {
      return;
    }
    saveEntryMutation.mutate({
      date: selectedDate,
      content: htmlContent,
    });
  };

  const handleDelete = () => {
    if (currentEntry && confirm('Are you sure you want to delete this diary entry?')) {
      deleteEntryMutation.mutate(currentEntry.id);
    }
  };

  // Executing editor commands (Bold, Italic, etc.)
  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setIsSaved(false);
  };

  const handleSelectPastEntry = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Daily Journal</h1>
        <p className="text-slate-400 text-xs mt-1">Reflect on your day, write notes, and log mental milestones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Sidebar index of past logs (4 cols) */}
        <GlassCard className="lg:col-span-4 max-h-[80vh] flex flex-col justify-between">
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Past Reflections</h3>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[60vh]">
            {listLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-800/20 rounded-xl animate-pulse"></div>
              ))
            ) : pastEntries && pastEntries.length === 0 ? (
              <p className="text-2xs text-slate-500 italic py-8 text-center">No past entries written yet.</p>
            ) : (
              pastEntries?.map((entry) => {
                const isActive = entry.date === selectedDate;
                // Strip HTML tags for clean text preview
                const cleanText = entry.content.replace(/<[^>]*>/g, '');
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectPastEntry(entry.date)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 select-none ${
                      isActive
                        ? 'bg-primary/10 border-primary text-slate-200'
                        : 'bg-slate-950/20 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-2xs font-bold text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-primary-light" /> {entry.date}
                    </div>
                    <p className="text-3xs line-clamp-2 leading-relaxed opacity-80 mt-1">{cleanText}</p>
                  </button>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Right Side: Notion-style editor panel (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard className="space-y-6">
            {/* Editor header settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Writing Board</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-950/40 border border-white/5 rounded px-2 py-0.5 text-2xs font-bold text-slate-300 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Status & save actions */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-slate-400 select-none">
                  {isSaved ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Saved
                    </span>
                  ) : (
                    <span className="text-amber-400 animate-pulse">Unsaved Changes</span>
                  )}
                </span>

                {currentEntry && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteEntryMutation.isPending}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-transparent hover:border-red-500/35 text-red-400 hover:text-red-300 transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <Button
                  onClick={handleSave}
                  isLoading={saveEntryMutation.isPending}
                  variant="primary"
                  className="py-1.5 px-4 text-xs font-bold"
                >
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>
            </div>

            {/* Rich text formatting toolbar */}
            <div className="flex flex-wrap gap-1 p-1.5 rounded-xl bg-slate-950/40 border border-white/5">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-all"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-all"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-all"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-[1px] bg-white/5 mx-1.5 my-1" />
              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-all"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Content canvas */}
            {entryLoading ? (
              <div className="h-64 bg-slate-800/10 border border-white/5 rounded-2xl animate-pulse"></div>
            ) : (
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                className="glass-input px-5 py-6 rounded-2xl text-slate-100 text-sm focus:ring-2 focus:ring-primary/10 border border-white/5 min-h-[300px] max-h-[50vh] overflow-y-auto leading-relaxed focus:outline-none select-text cursor-text"
                style={{ caretColor: '#7C3AED' }}
              />
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Journal;
