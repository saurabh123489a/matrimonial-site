'use client';

import { useState, useEffect, useMemo } from 'react';
import { eventApi, Event } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import Link from 'next/link';

interface EventCalendarProps {
  onEventClick?: (event: Event) => void;
  initialDate?: Date;
  className?: string;
}

export default function EventCalendar({ 
  onEventClick, 
  initialDate = new Date(),
  className = '' 
}: EventCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate month start and end dates
  const monthStart = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return start;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return end;
  }, [currentDate]);

  // Load events for the current month
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const startDate = monthStart.toISOString().split('T')[0];
        const endDate = monthEnd.toISOString().split('T')[0];
        
        const response = await eventApi.getAll({
          startDate,
          endDate,
          status: 'upcoming',
        });
        
        if (response.status) {
          setEvents(response.data || []);
        } else {
          setError(response.message || 'Failed to load events');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [monthStart, monthEnd]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach(event => {
      const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
      if (!grouped[eventDate]) {
        grouped[eventDate] = [];
      }
      grouped[eventDate].push(event);
    });
    return grouped;
  }, [events]);

  // Get calendar days for the month
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean; events: Event[] }> = [];
    
    // Get first day of month and what day of week it is (0 = Sunday, 6 = Saturday)
    const firstDay = monthStart.getDay();
    
    // Get last day of previous month
    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    // Add days from previous month to fill the first week
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(prevMonthEnd);
      date.setDate(prevMonthEnd.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        events: [],
      });
    }
    
    // Add days of current month
    const daysInMonth = monthEnd.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: true,
        events: eventsByDate[dateKey] || [],
      });
    }
    
    // Add days from next month to fill the last week (to make 6 weeks total)
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: [],
      });
    }
    
    return days;
  }, [currentDate, monthStart, monthEnd, eventsByDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month and year
  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={`bg-white dark:bg-[#181b23] rounded-lg shadow-md p-4 sm:p-6 ${className} transition-colors`}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-600 dark:text-pink-200 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-pink-100">
            {monthYearLabel}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-600 dark:text-pink-200 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-[#1f212a] rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading events..." />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Calendar grid */}
      {!loading && !error && (
        <>
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-pink-300 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => {
              const { date, isCurrentMonth, events: dayEvents } = dayData;
              const dateKey = date.toISOString().split('T')[0];
              const isTodayDate = isToday(date);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={`${dateKey}-${index}`}
                  className={`
                    min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border border-gray-200 dark:border-[#303341] rounded-lg
                    ${isCurrentMonth ? 'bg-white dark:bg-[#181b23]' : 'bg-gray-50 dark:bg-[#0f1117] opacity-50'}
                    ${isTodayDate ? 'ring-2 ring-pink-500 dark:ring-pink-400' : ''}
                    ${hasEvents ? 'cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/10' : ''}
                    transition-colors
                  `}
                  onClick={() => {
                    if (hasEvents && onEventClick && dayEvents.length > 0) {
                      onEventClick(dayEvents[0]);
                    }
                  }}
                >
                  {/* Date number */}
                  <div
                    className={`
                      text-xs sm:text-sm font-medium mb-1
                      ${isCurrentMonth ? 'text-gray-900 dark:text-pink-100' : 'text-gray-400 dark:text-pink-600'}
                      ${isTodayDate ? 'text-pink-600 dark:text-pink-400 font-bold' : ''}
                    `}
                  >
                    {date.getDate()}
                  </div>

                  {/* Events indicators */}
                  {hasEvents && (
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event._id}
                          className="text-[10px] sm:text-xs px-1 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded truncate"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] sm:text-xs text-pink-600 dark:text-pink-400 font-medium">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Events list for selected date (if any) */}
          {events.length === 0 && !loading && (
            <div className="mt-6">
              <EmptyState
                icon="📅"
                title={t('events.noEvents') || 'No events this month'}
                description="Check back later for upcoming community events"
              />
            </div>
          )}
        </>
      )}

      {/* Legend */}
      {!loading && events.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#303341] flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-pink-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-pink-500 dark:border-pink-400 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-100 dark:bg-pink-900/30 rounded"></div>
            <span>Has events</span>
          </div>
        </div>
      )}
    </div>
  );
}

