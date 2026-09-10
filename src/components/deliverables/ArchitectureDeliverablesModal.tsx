import { useState } from 'react';
import { deliverablesData, DeliverableCategory, CodeFile } from '../../data/deliverables.ts';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderTree,
  Smartphone,
  Server,
  Sparkles,
  Database,
} from 'lucide-react';

export function ArchitectureDeliverablesModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(deliverablesData[0].id);
  const activeCategory = deliverablesData.find((c) => c.id === activeCategoryId) || deliverablesData[0];

  const [selectedFileName, setSelectedFileName] = useState<string>(activeCategory.files[0].name);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile: CodeFile =
    activeCategory.files.find((f) => f.name === selectedFileName) || activeCategory.files[0];

  function copyCode() {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadFile() {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                Project Source Code & Architecture Deliverables
              </h3>
              <p className="text-xs text-slate-400">
                Flutter Mobile App • Node.js Backend • Python FastAPI Microservice • Firebase Rules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 p-2 flex items-center gap-1.5 overflow-x-auto text-xs">
          {deliverablesData.map((cat) => {
            const isCatActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setSelectedFileName(cat.files[0].name);
                }}
                className={`py-2 px-3 rounded-xl flex items-center gap-2 whitespace-nowrap font-semibold transition-all ${
                  isCatActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.id === 'flutter' && <Smartphone className="w-3.5 h-3.5 text-cyan-300" />}
                {cat.id === 'backend' && <Server className="w-3.5 h-3.5 text-amber-300" />}
                {cat.id === 'python_ai' && <Sparkles className="w-3.5 h-3.5 text-emerald-300" />}
                {cat.id === 'firebase' && <Database className="w-3.5 h-3.5 text-rose-300" />}
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area: Files list on left + Code on right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Roster */}
          <div className="w-full md:w-72 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-3 overflow-y-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">
              Source Files ({activeCategory.files.length})
            </span>

            {activeCategory.files.map((file) => {
              const isSelected = file.name === selectedFileName;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileName(file.name)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-800 text-blue-400 font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <div className="truncate">
                    <span className="block truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {file.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
            {/* File Path & Actions */}
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-mono text-xs text-slate-200 font-semibold truncate">
                  {currentFile.path}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono shrink-0">
                  {currentFile.language}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyCode}
                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={downloadFile}
                  className="py-1 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed select-text">
              <pre>
                <code>{currentFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
