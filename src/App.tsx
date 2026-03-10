/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Globe, 
  ArrowLeftRight, 
  Settings, 
  X, 
  CheckCircle2, 
  Map as MapIcon, 
  ChevronLeft, 
  Star, 
  CalendarPlus, 
  Share2,
  Clock,
  Moon,
  Sun,
  Briefcase,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Pin
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useMotionValue } from 'motion/react';
import { formatInTimeZone } from 'date-fns-tz';
import { addMinutes, startOfMinute } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Location, INITIAL_LOCATIONS, ALL_LOCATIONS } from './types';
import { getTimeOffset } from './utils/timeUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getDSTStatus = (date: Date, timeZone: string) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'long'
    }).formatToParts(date);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
    return tzName.toLowerCase().includes('daylight') ? 'DST' : '';
  } catch (e) {
    return '';
  }
};

// --- Components ---

const SlidingTimeScrubber = ({ offset, setOffset }: { offset: number, setOffset: (o: number) => void }) => {
  const STEP_WIDTH = 24;
  const TOTAL_STEPS = 48; // 24 hours in 30m increments
  
  // Motion value for the x position of the ruler
  const x = useMotionValue(-(offset / 30) * STEP_WIDTH);

  // Update motion value when offset changes externally
  useEffect(() => {
    x.set(-(offset / 30) * STEP_WIDTH);
  }, [offset, x]);

  // Handle drag
  const handleDrag = () => {
    const currentX = x.get();
    const newOffsetSteps = Math.round(-currentX / STEP_WIDTH);
    const newOffset = Math.max(0, Math.min(1410, newOffsetSteps * 30));
    
    if (newOffset !== offset) {
      setOffset(newOffset);
    }
  };

  return (
    <div className="px-0 pt-4 pb-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 select-none">
      <div className="flex justify-between px-8 text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
      
      <div className="relative h-12 overflow-hidden touch-none">
        {/* Fixed Center Indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary z-20 -translate-x-1/2 shadow-[0_0_12px_rgba(0,82,214,0.6)] pointer-events-none">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
        </div>
        
        {/* Draggable Ruler */}
        <motion.div 
          drag="x"
          dragConstraints={{
            left: -(TOTAL_STEPS * STEP_WIDTH),
            right: 0
          }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{ x, left: '50%' }}
          onDrag={handleDrag}
          className="absolute top-0 flex items-end h-full pb-1 cursor-grab active:cursor-grabbing"
        >
          {Array.from({ length: TOTAL_STEPS + 1 }).map((_, i) => {
            const isHour = i % 2 === 0;
            const isQuarter = i % 12 === 0; // Every 6 hours
            const hour = (i / 2) % 24;
            
            return (
              <div 
                key={i} 
                className="flex flex-col items-center shrink-0"
                style={{ width: `${STEP_WIDTH}px` }}
              >
                <div className={cn(
                  "w-0.5 bg-slate-200 dark:bg-slate-700 transition-colors",
                  isQuarter ? "h-8 bg-slate-400 dark:bg-slate-500" : isHour ? "h-5" : "h-3"
                )}></div>
                {isQuarter && (
                  <span className="absolute -bottom-5 text-[8px] font-bold text-slate-400">
                    {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

// --- Views ---

const WorldClockView = ({ 
  locations, 
  onAddClick, 
  onLocationClick,
  scrubOffset,
  onReorder,
  onDelete,
  onSetBase
}: { 
  locations: Location[], 
  onAddClick: () => void,
  onLocationClick: (loc: Location) => void,
  scrubOffset: number,
  onReorder: (newLocs: Location[]) => void,
  onDelete: (id: string) => void,
  onSetBase: (id: string) => void
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayTime = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(0, 0, 0, 0);
    return addMinutes(d, scrubOffset);
  }, [currentTime, scrubOffset]);

  const baseLocation = locations.find(l => l.isBase) || locations[0];

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">TimeShift</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-primary font-medium px-3 py-1 bg-primary/10 rounded-full"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary shadow-sm cursor-pointer" 
            placeholder="Search for a city or timezone" 
            type="text"
            readOnly
            onClick={onAddClick}
          />
        </div>
      </header>

      <section className="px-4 py-4">
        <div className="relative overflow-hidden rounded-xl bg-primary text-white p-6 shadow-lg shadow-primary/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-primary-100" />
              <p className="text-primary-100 text-[10px] font-medium uppercase tracking-wider">Base Location</p>
            </div>
            <h2 className="text-xl font-bold mb-4">{baseLocation.city}, {baseLocation.country} ({baseLocation.offsetLabel})</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums">
                {formatInTimeZone(displayTime, baseLocation.timezone, 'h:mm')}
              </span>
              <span className="text-xl font-medium opacity-80">
                {formatInTimeZone(displayTime, baseLocation.timezone, 'a')}
              </span>
              {getDSTStatus(displayTime, baseLocation.timezone) && (
                <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">DST</span>
              )}
            </div>
            <p className="mt-1 text-sm text-primary-100">
              {formatInTimeZone(displayTime, baseLocation.timezone, 'EEEE, MMM d')}
            </p>
          </div>
          <div className="absolute bottom-4 right-4 opacity-20">
            <Globe size={64} />
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 pb-40">
        <div className="flex items-center justify-between mb-3 mt-4 px-1">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Saved Locations</h3>
        </div>
        
        <Reorder.Group axis="y" values={locations} onReorder={onReorder} className="space-y-3">
          {locations.map((loc) => {
            if (loc.isBase && !isEditing) return null; // Base is shown in hero, unless editing

            const locTime = formatInTimeZone(displayTime, loc.timezone, 'h:mm');
            const locAmPm = formatInTimeZone(displayTime, loc.timezone, 'a');
            const dstStatus = getDSTStatus(displayTime, loc.timezone);
            const locDay = formatInTimeZone(displayTime, loc.timezone, 'd');
            const baseDay = formatInTimeZone(displayTime, baseLocation.timezone, 'd');
            
            let dayLabel = 'Today';
            if (locDay > baseDay) dayLabel = 'Tomorrow';
            else if (locDay < baseDay) dayLabel = 'Yesterday';

            return (
              <Reorder.Item 
                key={loc.id} 
                value={loc}
                dragListener={isEditing}
                className="w-full"
              >
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => onDelete(loc.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      {!loc.isBase && (
                        <button 
                          onClick={() => onSetBase(loc.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Set as Base"
                        >
                          <MapPin size={18} />
                        </button>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={() => !isEditing && onLocationClick(loc)}
                    className={cn(
                      "flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all text-left",
                      !isEditing && "active:scale-[0.98]",
                      loc.isBase && isEditing && "border-primary border-2"
                    )}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {loc.city}{loc.state ? `, ${loc.state}` : ''}, {loc.country}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 font-bold uppercase">{loc.offsetLabel}</span>
                        {dstStatus && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded font-bold uppercase">DST</span>
                        )}
                        {loc.isBase && <span className="text-[10px] text-primary font-bold uppercase">Base</span>}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {getTimeOffset(baseLocation.timezone, loc.timezone, displayTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold tabular-nums">
                          {locTime}<span className="text-sm font-medium ml-1">{locAmPm}</span>
                        </div>
                        <p className={cn("text-[10px]", dayLabel === 'Tomorrow' ? "text-primary font-medium" : "text-slate-400")}>
                          {dayLabel}
                        </p>
                      </div>
                      {isEditing && <GripVertical size={20} className="text-slate-300 cursor-grab active:cursor-grabbing" />}
                    </div>
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </main>
    </div>
  );
};

const AddLocationView = ({ 
  onBack, 
  onAdd,
  pinnedLocations
}: { 
  onBack: () => void, 
  onAdd: (loc: Location) => void, 
  pinnedLocations: Location[],
  key?: string 
}) => {
  const [search, setSearch] = useState('');
  
  const filteredResults = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return ALL_LOCATIONS.filter(loc => 
      loc.city.toLowerCase().includes(term) ||
      loc.country.toLowerCase().includes(term) ||
      (loc.state && loc.state.toLowerCase().includes(term)) ||
      loc.offsetLabel.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-white dark:bg-background-dark flex flex-col max-w-md mx-auto shadow-2xl"
    >
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Add Location</h2>
        <div className="size-10"></div>
      </header>
      
      <div className="px-4 py-4 bg-white dark:bg-background-dark">
        <div className="flex w-full h-12 items-stretch rounded-xl shadow-sm bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="text-slate-400 flex items-center justify-center pl-4">
            <Search size={20} />
          </div>
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-base font-normal" 
            placeholder="Search city, country, state, or zone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider px-4 pb-2 pt-4">
          {search ? 'Search Results' : 'Suggestions'}
        </h3>
        <div className="space-y-px bg-slate-100 dark:bg-slate-800">
          {(search ? filteredResults : ALL_LOCATIONS.slice(0, 5)).map((res) => {
            const isPinned = pinnedLocations.some(l => l.city === res.city && l.country === res.country);
            return (
              <div 
                key={res.id}
                className="w-full flex items-center gap-4 bg-white dark:bg-background-dark px-4 min-h-[80px] py-3 justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group relative overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-12">
                    <Globe size={24} />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-slate-900 dark:text-slate-100 text-base font-semibold leading-tight">
                      {res.city}{res.state ? `, ${res.state}` : ''}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                      {res.country} • {res.offsetLabel}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {isPinned ? (
                    <div className="text-emerald-500 flex items-center gap-1 text-sm font-bold">
                      <CheckCircle2 size={18} />
                      Pinned
                    </div>
                  ) : (
                    <button 
                      onClick={() => onAdd({ ...res, id: Math.random().toString() })}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                    >
                      <Pin size={14} />
                      Pin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {!search && (
          <div className="p-8 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-full h-48 rounded-2xl mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden relative flex items-center justify-center">
              <MapIcon size={64} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">Search for a location to pin it to your dashboard</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ConverterView = ({ 
  baseLoc, 
  targetLoc, 
  onBack,
  scrubOffset
}: { 
  baseLoc: Location, 
  targetLoc: Location, 
  onBack: () => void,
  scrubOffset: number,
  key?: string
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const scrubbedTime = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(0, 0, 0, 0);
    return addMinutes(d, scrubOffset);
  }, [currentTime, scrubOffset]);

  const baseTimeStr = formatInTimeZone(scrubbedTime, baseLoc.timezone, 'h:mm');
  const baseAmPm = formatInTimeZone(scrubbedTime, baseLoc.timezone, 'a');
  const targetTimeStr = formatInTimeZone(scrubbedTime, targetLoc.timezone, 'h:mm');
  const targetAmPm = formatInTimeZone(scrubbedTime, targetLoc.timezone, 'a');

  const baseDST = getDSTStatus(scrubbedTime, baseLoc.timezone);
  const targetDST = getDSTStatus(scrubbedTime, targetLoc.timezone);

  // Simple logic for meeting window
  const baseHour = parseInt(formatInTimeZone(scrubbedTime, baseLoc.timezone, 'H'));
  const targetHour = parseInt(formatInTimeZone(scrubbedTime, targetLoc.timezone, 'H'));
  
  const isGoodTime = baseHour >= 9 && baseHour <= 18 && targetHour >= 9 && targetHour <= 18;
  const isReasonableTime = (baseHour >= 8 && baseHour <= 21) && (targetHour >= 8 && targetHour <= 21);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{baseLoc.city} vs {targetLoc.city}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {baseLoc.offsetLabel} • {targetLoc.offsetLabel}
            </p>
          </div>
          <button className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Star size={24} className="text-primary fill-primary" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-8 overflow-y-auto pb-48">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">24-Hour Cycle</h2>
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
              {getTimeOffset(baseLoc.timezone, targetLoc.timezone, scrubbedTime).replace('+', '').replace('-', '')} Difference
            </span>
          </div>

          {[baseLoc, targetLoc].map((loc, idx) => (
            <div key={loc.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{loc.city}</span>
                <span className="text-xs text-slate-400 italic">
                  {idx === 0 ? 'Home' : getTimeOffset(baseLoc.timezone, loc.timezone, scrubbedTime)}
                </span>
              </div>
              <div className="relative h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                <div className="h-full w-1/4 bg-slate-500/10 border-r border-slate-300/20 flex items-center justify-center">
                  <Moon size={14} className="text-slate-500 opacity-50" />
                </div>
                <div className="h-full w-[12.5%] bg-yellow-500/10 border-r border-slate-300/20"></div>
                <div className="h-full w-[37.5%] bg-emerald-500/20 border-x-2 border-emerald-500/40 flex items-center justify-center relative">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Work</span>
                </div>
                <div className="h-full w-[12.5%] bg-orange-500/10"></div>
                <div className="h-full w-[12.5%] bg-slate-500/10 flex items-center justify-center">
                  <Moon size={14} className="text-slate-500 opacity-50" />
                </div>
                {/* Current Time Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-primary z-10 shadow-[0_0_8px_rgba(0,82,214,0.5)] transition-all duration-300"
                  style={{ left: `${(parseInt(formatInTimeZone(scrubbedTime, loc.timezone, 'H')) / 24) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </section>

        <section className="py-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">{baseLoc.city}</p>
                <p className="text-3xl font-bold text-primary">{baseTimeStr}<span className="text-base font-medium ml-1">{baseAmPm}</span></p>
                {baseDST && <p className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mt-1">Daylight Saving</p>}
              </div>
              <div className="flex items-center">
                <ArrowLeftRight size={20} className="text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">{targetLoc.city}</p>
                <p className="text-3xl font-bold">{targetTimeStr}<span className="text-base font-medium ml-1">{targetAmPm}</span></p>
                {targetDST && <p className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mt-1">Daylight Saving</p>}
              </div>
            </div>
          </div>
        </section>

        <section className={cn(
          "p-5 rounded-xl flex items-start gap-4 border",
          isGoodTime ? "bg-emerald-500/5 border-emerald-500/20" : 
          isReasonableTime ? "bg-yellow-500/5 border-yellow-500/20" : 
          "bg-slate-500/5 border-slate-500/20"
        )}>
          <div className={cn(
            "p-2 rounded-lg",
            isGoodTime ? "bg-emerald-500/20 text-emerald-600" : 
            isReasonableTime ? "bg-yellow-500/20 text-yellow-600" : 
            "bg-slate-500/20 text-slate-600"
          )}>
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              {isGoodTime ? 'Meeting Window Identified' : isReasonableTime ? 'Sub-optimal Window' : 'Poor Meeting Time'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {baseTimeStr} {baseAmPm} in {baseLoc.city} is {targetTimeStr} {targetAmPm} in {targetLoc.city}. 
              {isGoodTime ? (
                <span className="text-emerald-600 font-semibold ml-1">Great time for a meeting!</span>
              ) : isReasonableTime ? (
                <span className="text-yellow-600 font-semibold ml-1">Possible, but not ideal.</span>
              ) : (
                <span className="text-slate-500 font-semibold ml-1">One location is likely outside working hours.</span>
              )}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/25 transition-transform active:scale-95">
            <CalendarPlus size={18} />
            Schedule
          </button>
          <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 py-3 rounded-lg font-bold text-sm transition-transform active:scale-95">
            <Share2 size={18} />
            Share Time
          </button>
        </section>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [scrubOffset, setScrubOffset] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + (now.getMinutes() >= 30 ? 30 : 0);
  });

  const baseLocation = useMemo(() => locations.find(l => l.isBase) || locations[0], [locations]);

  const handleAddLocation = (loc: Location) => {
    setLocations([...locations, loc]);
  };

  const handleReorder = (newLocs: Location[]) => {
    setLocations(newLocs);
  };

  const handleDelete = (id: string) => {
    if (locations.length <= 1) return;
    const newLocs = locations.filter(l => l.id !== id);
    if (locations.find(l => l.id === id)?.isBase) {
      newLocs[0].isBase = true;
    }
    setLocations(newLocs);
  };

  const handleSetBase = (id: string) => {
    setLocations(locations.map(l => ({
      ...l,
      isBase: l.id === id
    })));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        {isAdding ? (
          <AddLocationView 
            key="add"
            onBack={() => setIsAdding(false)} 
            onAdd={handleAddLocation} 
            pinnedLocations={locations}
          />
        ) : selectedLocation ? (
          <ConverterView 
            key="detail"
            baseLoc={baseLocation}
            targetLoc={selectedLocation}
            onBack={() => setSelectedLocation(null)}
            scrubOffset={scrubOffset}
          />
        ) : (
          <div key="main" className="flex-1 overflow-y-auto no-scrollbar">
            <WorldClockView 
              locations={locations} 
              onAddClick={() => setIsAdding(true)}
              onLocationClick={setSelectedLocation}
              scrubOffset={scrubOffset}
              onReorder={handleReorder}
              onDelete={handleDelete}
              onSetBase={handleSetBase}
            />
          </div>
        )}
      </AnimatePresence>

      {!isAdding && (
        <div className="fixed bottom-0 w-full max-w-md z-30">
          <SlidingTimeScrubber offset={scrubOffset} setOffset={setScrubOffset} />
        </div>
      )}
    </div>
  );
}
