import { useState } from 'react'

type SettingsCategory = 'Profile' | 'Academic' | 'Notifications' | 'Appearance' | 'Workspace' | 'Privacy & Security' | 'Members'

export default function StudentSettings() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('Profile')

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background text-foreground">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Student OS Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your personal profile, academic information, preferences, and workspace setup
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1 bg-card border border-border p-2 rounded-xl h-fit">
          {(['Profile', 'Academic', 'Notifications', 'Appearance', 'Workspace', 'Privacy & Security', 'Members'] as SettingsCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          {activeCategory === 'Profile' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-card-foreground">Student Profile</h2>
              <div className="space-y-3 text-xs max-w-md">
                <div>
                  <label className="block text-muted-foreground mb-1">Full Name</label>
                  <input type="text" defaultValue="Nikshith Goud" className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Email</label>
                  <input type="email" defaultValue="nikshith@dayzero.app" className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Institution</label>
                  <input type="text" defaultValue="University Technology Institute" className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Degree Program</label>
                  <input type="text" defaultValue="B.Tech Computer Science & Engineering" className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <button className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeCategory === 'Academic' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-card-foreground">Academic Preferences</h2>
              <div className="space-y-3 text-xs max-w-md">
                <div>
                  <label className="block text-muted-foreground mb-1">Current Semester</label>
                  <input type="number" defaultValue={5} className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Target Cumulative GPA</label>
                  <input type="number" step="0.01" defaultValue={3.85} className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Minimum Target Attendance (%)</label>
                  <input type="number" defaultValue={85} className="w-full rounded-lg border border-border bg-muted/40 p-2 text-card-foreground focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>
                <button className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Update Academic Target
                </button>
              </div>
            </div>
          )}

          {activeCategory !== 'Profile' && activeCategory !== 'Academic' && (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-card-foreground">{activeCategory} Settings</h2>
              <p className="text-xs text-muted-foreground">
                Configuration options for {activeCategory.toLowerCase()} are managed via your Core workspace preferences.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
