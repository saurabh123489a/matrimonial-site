'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { sanitizeFormInput } from '@/hooks/useSanitizedInput';

export default function AskQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await questionApi.create({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
      });

      if (response.status && response.data) {
        const questionId = response.data._id || (response.data.question && response.data.question._id);
        if (questionId) {
          router.push(`/community/${questionId}`);
        } else {
          setError('Question created but invalid response received');
        }
      } else {
        setError('Failed to create question');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'relationship', label: 'Relationship' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'family', label: 'Family' },
    { value: 'traditions', label: 'Traditions' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'career', label: 'Career' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/community" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
        ← Back to Community
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ask a Question</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Title *
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: sanitizeFormInput(e.target.value, 'text') })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            placeholder="What's your question?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Details *
          </label>
          <textarea
            required
            rows={8}
            maxLength={5000}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: sanitizeFormInput(e.target.value, 'textarea') })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            placeholder="Provide details about your question..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: sanitizeFormInput(e.target.value, 'text') })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            placeholder="e.g., marriage, dowry, traditions"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Question'}
          </button>
          <Link
            href="/community"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

