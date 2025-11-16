'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { eventApi, Event, RSVP } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import LazyImage from '@/components/LazyImage';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'notGoing' | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await eventApi.getById(eventId);
      if (response.status && response.data) {
        setEvent(response.data);
        
        const eventData = response.data as any;
        if (eventData.userRSVP) {
          setRsvpStatus(eventData.userRSVP.status);
        }
      } else {
        setError(response.message || 'Event not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status: 'going' | 'maybe' | 'notGoing') => {
    if (!isAuthenticated) {
      showError('Please login to RSVP');
      router.push('/login');
      return;
    }

    if (!eventId) return;

    setRsvping(true);
    setError('');
    
    try {
      const response = await eventApi.rsvp(eventId, status);
      if (response.status) {
        setRsvpStatus(status);
        showSuccess(t('events.rsvpSuccess') || 'RSVP submitted successfully');
        
        loadEvent();
      } else {
        setError(response.message || 'Failed to submit RSVP');
        showError(response.message || 'Failed to submit RSVP');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit RSVP';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setRsvping(false);
    }
  };

  const handleCancelRSVP = async () => {
    if (!eventId || !isAuthenticated) return;

    setRsvping(true);
    setError('');
    
    try {
      const response = await eventApi.cancelRSVP(eventId);
      if (response.status) {
        setRsvpStatus(null);
        showSuccess(t('events.rsvpCancelled') || 'RSVP cancelled');
        loadEvent();
      } else {
        setError(response.message || 'Failed to cancel RSVP');
        showError(response.message || 'Failed to cancel RSVP');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to cancel RSVP';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setRsvping(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      gathering: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      celebration: 'bg-pink-100 text-pink-800',
      workshop: 'bg-purple-100 text-purple-800',
      seminar: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="Loading event..." />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/community" className="text-pink-600">
            ← Back to Community
          </Link>
          <EmptyState
            icon="❌"
            title="Event Not Found"
            description={error}
            action={{
              label: 'Go to Community',
              onClick: () => router.push('/community'),
            }}
          />
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();
  const isExpired = event.status === 'completed' || event.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/community" 
          className="text-pink-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50">
            {error}
          </div>
        )}

        {/* Event Header */}
        <div className="bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {event.title}
                </h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
              </div>
              
              {event.description && (
                <p className="text-gray-600">
                  {event.description}
                </p>
              )}
            </div>

            {/* Event Image */}
            {event.imageUrl && (
              <div className="flex-shrink-0">
                <LazyImage
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full sm:w-48 h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Date & Time
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(event.eventDate)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(event.eventTime)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Location
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {event.location}
                </div>
                {event.address && (
                  <div className="text-sm text-gray-600">
                    {event.address}
                  </div>
                )}
                {(event.city || event.state) && (
                  <div className="text-sm text-gray-600">
                    {[event.city, event.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {event.maxAttendees && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Max Attendees
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {event.maxAttendees} people
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Organizer
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {typeof event.organizer === 'object' && event.organizer !== null
                    ? event.organizer.name
                    : event.organizerName}
                </div>
              </div>
            </div>
          </div>

          {/* Event Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              event.status === 'upcoming' 
                ? 'bg-green-100 text-green-800'
                : event.status === 'ongoing'
                ? 'bg-blue-100 text-blue-800'
                : event.status === 'completed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            {isPast && !isExpired && (
              <span className="text-sm text-gray-500">
                (Past Event)
              </span>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* RSVP Section */}
          {!isExpired && (
            <div className="border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('events.rsvp') || 'RSVP'}
              </h3>
              
              {!isAuthenticated ? (
                <div className="bg-blue-50">
                  <p className="text-sm text-blue-800">
                    Please login to RSVP to this event
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Login to RSVP
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {rsvpStatus ? (
                    <div className="bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            You have RSVP'd: <span className="font-semibold capitalize">{rsvpStatus}</span>
                          </p>
                          <p className="text-xs text-green-600">
                            {rsvpStatus === 'going' && 'Looking forward to seeing you!'}
                            {rsvpStatus === 'maybe' && 'We hope you can make it!'}
                            {rsvpStatus === 'notGoing' && 'Sorry you can\'t make it.'}
                          </p>
                        </div>
                        <button
                          onClick={handleCancelRSVP}
                          disabled={rsvping}
                          className="px-4 py-2 text-sm font-medium text-red-600"
                        >
                          {rsvping ? 'Cancelling...' : 'Cancel RSVP'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleRSVP('going')}
                        disabled={rsvping}
                        className="flex-1 min-w-[120px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        {rsvping ? 'Submitting...' : '✓ Going'}
                      </button>
                      <button
                        onClick={() => handleRSVP('maybe')}
                        disabled={rsvping}
                        className="flex-1 min-w-[120px] px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        {rsvping ? 'Submitting...' : '? Maybe'}
                      </button>
                      <button
                        onClick={() => handleRSVP('notGoing')}
                        disabled={rsvping}
                        className="flex-1 min-w-[120px] px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        {rsvping ? 'Submitting...' : '✗ Not Going'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            Event Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            {event.isPublic ? (
              <p>✓ This is a public event - all community members are welcome</p>
            ) : (
              <p>🔒 This is a private event - invitation only</p>
            )}
            {event.createdAt && (
              <p>Created on {new Date(event.createdAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

