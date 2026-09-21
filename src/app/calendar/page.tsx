'use client';

import { useState, useEffect } from 'react';
import { getCalendarEvents } from '@/lib/api';
import { CalendarEvent } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

const EVENT_TYPES = {
  'ipo_opens': { color: 'bg-green-500', label: 'IPO Opens' },
  'ipo_closes': { color: 'bg-red-500', label: 'IPO Closes' },
  'allotment': { color: 'bg-blue-500', label: 'Allotment' },
  'refund': { color: 'bg-amber-500', label: 'Refund' },
  'listing': { color: 'bg-purple-500', label: 'Listing' },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sept 2026 as requested
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getCalendarEvents(month, year);
      setEvents(data);
    };
    fetchEvents();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 1)); // Reset to Sept 2026
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const selectedDateEvents = selectedDate 
    ? events.filter(e => e.date === `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`)
    : [];

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">IPO Calendar</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          View important dates for upcoming and ongoing IPOs.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{monthName} {year}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleToday} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900">
                Today
              </button>
              <button onClick={handleNextMonth} className="p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-slate-50 dark:bg-slate-900 p-3 text-center text-sm font-semibold text-slate-500">
                {day}
              </div>
            ))}
            
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="bg-white dark:bg-slate-950 min-h-[100px] p-2" />
            ))}
            
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
              
              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`bg-white dark:bg-slate-950 min-h-[100px] p-2 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                    isSelected ? 'ring-2 ring-inset ring-emerald-500' : ''
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className="flex items-center gap-1.5 text-xs truncate">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPES[e.type as keyof typeof EVENT_TYPES]?.color || 'bg-slate-400'}`} />
                        <span className="truncate" title={e.companyName}>{e.companyName}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-500 font-medium pl-3.5">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {Object.entries(EVENT_TYPES).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${value.color}`} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{value.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 h-full min-h-[400px]">
            {selectedDate ? (
              <>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-600" />
                  Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => {
                      const typeInfo = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES];
                      return (
                        <div key={event.id} className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeInfo?.color || 'bg-slate-400'}`} />
                            <div>
                              <Link href={`/ipos/${event.slug}`} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline block mb-1">
                                {event.companyName}
                              </Link>
                              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 inline-block mb-2 text-slate-600 dark:text-slate-300">
                                {typeInfo?.label || event.type}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-slate-500 mb-2">No events on this date</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[300px]">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500">Select a date on the calendar to view events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
