import { useState } from 'react';
import { campusFacilities } from '../../data/mockData.ts';
import { CampusFacility } from '../../types/index.ts';
import { MapPin, Navigation, Clock, Users, Cpu, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

export function CampusMapView() {
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility>(campusFacilities[1]);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFacilities = campusFacilities.filter((fac) => {
    const matchesType = filterType === 'all' || fac.type === filterType;
    const matchesFloor = selectedFloor === 'all' || fac.floor === selectedFloor;
    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fac.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fac.block.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesFloor && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/70 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              Interactive Campus & Facility Navigation
            </h2>
            <p className="text-xs text-slate-400">
              Locate departments, laboratories, and inspect live classroom vacancies
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {campusFacilities.filter(f => f.isAvailable).length} Available Now
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {campusFacilities.filter(f => !f.isAvailable).length} In-Session
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room, lab, or block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 overflow-x-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            {(['all', 'classroom', 'laboratory', 'department'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-1 rounded-lg capitalize whitespace-nowrap transition-all ${
                  filterType === t
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All Types' : t + 's'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 text-[11px] px-1 font-medium">Floor:</span>
            {(['all', 1, 2, 3, 4] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  selectedFloor === f
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : `${f}F`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual Map Canvas */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 rounded-2xl p-4 overflow-hidden relative shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Campus Blueprint & Geo-Zones
            </span>
            <span className="text-[11px] text-slate-400">Click any pin to inspect real-time status</span>
          </div>

          {/* SVG Map Layout */}
          <div className="relative w-full aspect-[16/10] bg-slate-950/70 rounded-xl border border-slate-800 overflow-hidden select-none p-4">
            {/* Campus Architectural Ground Polygons */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Campus Roads / Walkways */}
              <path d="M 0 50 Q 50 48 100 50" stroke="#334155" strokeWidth="6" fill="none" />
              <path d="M 50 0 L 50 100" stroke="#334155" strokeWidth="5" fill="none" />
              <circle cx="50" cy="50" r="10" stroke="#475569" strokeWidth="2" fill="#1e293b" />

              {/* Buildings Outline */}
              {/* Academic Block A */}
              <rect x="18" y="15" width="28" height="30" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />
              <text x="32" y="19" fill="#93c5fd" fontSize="2.5" textAnchor="middle" fontWeight="bold">Academic Block A</text>

              {/* Tech Tower */}
              <rect x="58" y="12" width="26" height="26" rx="3" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1" opacity="0.8" />
              <text x="71" y="16" fill="#c4b5fd" fontSize="2.5" textAnchor="middle" fontWeight="bold">Tech Tower</text>

              {/* Academic Block B */}
              <rect x="38" y="55" width="26" height="28" rx="3" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1" opacity="0.8" />
              <text x="51" y="59" fill="#7dd3fc" fontSize="2.5" textAnchor="middle" fontWeight="bold">Academic Block B</text>

              {/* Central Knowledge Center / Library */}
              <rect x="40" y="75" width="24" height="20" rx="3" fill="#1e293b" stroke="#10b981" strokeWidth="1" opacity="0.8" />
              <text x="52" y="79" fill="#6ee7b7" fontSize="2.2" textAnchor="middle" fontWeight="bold">Knowledge Commons</text>

              {/* Hardware Innovations Wing */}
              <rect x="70" y="55" width="24" height="24" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" opacity="0.8" />
              <text x="82" y="59" fill="#fcd34d" fontSize="2.2" textAnchor="middle" fontWeight="bold">Hardware Wing</text>
            </svg>

            {/* Interactive Location Markers */}
            {filteredFacilities.map((fac) => {
              const isSelected = selectedFacility.id === fac.id;
              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  style={{
                    left: `${fac.coordinates.x}%`,
                    top: `${fac.coordinates.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-10`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Pulsing ring if available */}
                    {fac.isAvailable && (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping"></span>
                    )}

                    {/* Marker Badge */}
                    <div
                      className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-lg transition-transform ${
                        isSelected
                          ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-20'
                          : 'group-hover:scale-105'
                      } ${
                        fac.isAvailable
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{fac.code}</span>
                    </div>

                    {/* Tooltip on hover/selected */}
                    <div
                      className={`mt-1 px-2 py-0.5 rounded bg-slate-900/95 border border-slate-700 text-[10px] text-slate-200 whitespace-nowrap pointer-events-none shadow ${
                        isSelected ? 'block' : 'hidden group-hover:block'
                      }`}
                    >
                      {fac.name} • {fac.isAvailable ? 'Free' : 'Busy'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-700/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available / Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Class in Session
              </span>
            </div>
            <span>Academic Zone A & Tech Quadrangle</span>
          </div>
        </div>

        {/* Selected Facility Details Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {selectedFacility.type}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">
                  {selectedFacility.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedFacility.block} • Floor {selectedFacility.floor} • Code: <span className="font-mono text-slate-300 font-bold">{selectedFacility.code}</span>
                </p>
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${
                  selectedFacility.isAvailable
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {selectedFacility.isAvailable ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> In Session
                  </>
                )}
              </div>
            </div>

            {/* Current Activity Banner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 mb-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Current Status / Activity:</span>
              </div>
              <p className="text-slate-300 pl-5 leading-relaxed">
                {selectedFacility.currentActivity || 'Open for general student access'}
              </p>
              {selectedFacility.nextAvailableSlot && (
                <div className="pl-5 text-emerald-400 font-medium text-[11px]">
                  Next Free Slot: {selectedFacility.nextAvailableSlot}
                </div>
              )}
            </div>

            {/* Capacity & Key Specs */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Seating Capacity</span>
                </div>
                <span className="text-base font-bold text-slate-200">
                  {selectedFacility.capacity} Seats
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Equipment Count</span>
                </div>
                <span className="text-base font-bold text-slate-200">
                  {selectedFacility.equipment?.length || 3}+ Units
                </span>
              </div>
            </div>

            {/* Equipment installed */}
            {selectedFacility.equipment && (
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Installed Hardware & Smart Amenities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFacility.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded text-[11px] border border-slate-600/50"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coordinator */}
            {selectedFacility.contactPerson && (
              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500">Facility In-Charge: </span>
                <span className="text-slate-300 font-medium">{selectedFacility.contactPerson}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2">
            <button
              onClick={() => alert(`Directions copied to clipboard: Go to ${selectedFacility.block}, take elevator to Floor ${selectedFacility.floor}, Room ${selectedFacility.code}`)}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              Get Turn-by-Turn Path
            </button>
          </div>
        </div>
      </div>

      {/* Directory of all facilities list */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Campus Facility Directory & Real-Time Availability Roster
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {filteredFacilities.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFacility(f)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedFacility.id === f.id
                  ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50'
                  : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-xs text-slate-200 truncate">{f.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    f.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {f.isAvailable ? 'Free' : 'Occupied'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{f.block} (Floor {f.floor})</span>
                <span className="font-mono text-slate-300 font-bold">{f.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
