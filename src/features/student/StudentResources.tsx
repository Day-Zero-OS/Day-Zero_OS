import { useState } from 'react'
import type { Screen } from '@/types/navigation'

interface Props {
  onNavigate: (screen: Screen) => void
  workspaceId?: string
  initialTab?: 'notes' | 'files'
}

const NOTES = [
  { id: '1', subject: 'Mathematics', title: 'Matrix Operations', preview: 'Row reduction, echelon form, inverse matrices and determinant shortcuts...', date: 'Aug 15', tags: ['Linear Algebra'] },
  { id: '2', subject: 'Physics', title: 'Physics Lab Notes', preview: 'Pendulum experiment observations and analysis, timing errors noted...', date: 'Aug 14', tags: ['Lab'] },
  { id: '3', subject: 'Mathematics', title: 'Exam Preparation', preview: 'Integration by parts, Taylor series and convergence formulas...', date: 'Aug 13', tags: ['Exam Prep'] },
  { id: '4', subject: 'Data Structures', title: 'Tree Traversal', preview: 'Inorder, Preorder, Postorder methods with code examples...', date: 'Aug 12', tags: ['Trees'] },
]

const FILES = [
  { id: '1', name: 'Matrices.pdf', subject: 'Mathematics', date: 'Aug 15', size: '2.4 MB', ext: 'pdf' },
  { id: '2', name: 'Physics-Lab-Report.pdf', subject: 'Physics', date: 'Aug 14', size: '1.8 MB', ext: 'pdf' },
  { id: '3', name: 'DS-Notes.pdf', subject: 'Data Structures', date: 'Aug 12', size: '3.1 MB', ext: 'pdf' },
  { id: '4', name: 'Organic-Reactions.pdf', subject: 'Chemistry', date: 'Aug 10', size: '0.9 MB', ext: 'pdf' },
]

export default function StudentResources({ onNavigate, initialTab = 'notes' }: Props) {
  const [tab, setTab] = useState<'notes' | 'files'>(initialTab)

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Academic Resources</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Subject notes, lecture summaries, and uploaded study materials
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setTab('notes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'notes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setTab('files')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === 'files' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Files
          </button>
        </div>
      </div>

      {tab === 'notes' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Knowledge Base Notes
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + New Note
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NOTES.map((note) => (
              <div key={note.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    {note.subject}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{note.date}</span>
                </div>
                <h3 className="text-base font-bold text-card-foreground">{note.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{note.preview}</p>
                <div className="flex gap-1.5 pt-2">
                  {note.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Uploaded Files & Vault
            </h2>
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              + Upload File
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Uploaded</th>
                  <th className="p-3">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-card-foreground">
                {FILES.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-blue-600 hover:underline cursor-pointer">{file.name}</td>
                    <td className="p-3 text-muted-foreground">{file.subject}</td>
                    <td className="p-3 text-muted-foreground">{file.date}</td>
                    <td className="p-3 font-medium text-muted-foreground">{file.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
