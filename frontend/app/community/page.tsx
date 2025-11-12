'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionApi, eventApi, Event } from '@/lib/api';
import { auth } from '@/lib/auth';
import EventCalendar from '@/components/EventCalendar';

interface Question {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    _id: string;
    name: string;
    photos?: Array<{ url: string }>;
  } | null;
  upvotes: number;
  downvotes: number;
  views: number;
  answersCount: number;
  createdAt: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'qa' | 'events'>('qa');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortBy: 'createdAt',
  });

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await questionApi.getAll({
        page: 1,
        limit: 20,
        ...filters
      });
      if (response.status) {
        setQuestions(response.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'relationship', label: 'Relationship' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'family', label: 'Family' },
    { value: 'traditions', label: 'Traditions' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'career', label: 'Career' },
    { value: 'general', label: 'General' },
  ];

  const handleEventClick = (event: Event) => {
    router.push(`/community/event/${event._id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-pink-100">Community</h1>
        {auth.isAuthenticated() && activeTab === 'qa' && (
          <Link
            href="/community/ask"
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
          >
            Ask Question
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-[#303341]">
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'qa'
              ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
              : 'text-gray-600 dark:text-pink-300 hover:text-pink-600 dark:hover:text-pink-400'
          }`}
        >
          Q&A
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'events'
              ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
              : 'text-gray-600 dark:text-pink-300 hover:text-pink-600 dark:hover:text-pink-400'
          }`}
        >
          Events
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <EventCalendar onEventClick={handleEventClick} />
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qa' && (
        <>

      {/* Filters */}
      <div className="bg-white dark:bg-[#181b23] p-4 rounded-lg shadow-md mb-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#303341] rounded-md focus:outline-none focus:ring-pink-500 bg-white dark:bg-[#181b23] text-gray-900 dark:text-pink-100 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search questions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#303341] rounded-md focus:outline-none focus:ring-pink-500 bg-white dark:bg-[#181b23] text-gray-900 dark:text-pink-100 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-pink-200 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#303341] rounded-md focus:outline-none focus:ring-pink-500 bg-white dark:bg-[#181b23] text-gray-900 dark:text-pink-100 transition-colors"
            >
              <option value="createdAt">Newest</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="answersCount">Most Answered</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No questions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question._id}
              href={`/community/${question._id}`}
              className="block bg-white dark:bg-[#181b23] rounded-lg shadow-md p-6 hover:shadow-lg transition-all transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl font-bold text-pink-600">{question.upvotes - question.downvotes}</div>
                  <div className="text-sm text-gray-500">votes</div>
                  <div className="text-sm text-gray-500 mt-2">{question.answersCount} answers</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-pink-100 mb-2">{question.title}</h3>
                  <p className="text-gray-600 dark:text-pink-200 mb-3 line-clamp-2">{question.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-pink-300">
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">
                      {question.category}
                    </span>
                    <span>by {question.author?.name || 'Unknown User'}</span>
                    <span>• {new Date(question.createdAt).toLocaleDateString()}</span>
                    <span>• {question.views} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
