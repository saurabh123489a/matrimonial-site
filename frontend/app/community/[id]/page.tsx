'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionApi, answerApi } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (questionId) {
      loadQuestion();
      loadAnswers();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      const response = await questionApi.getById(questionId);
      if (response.status && response.data) {
        setQuestion(response.data.question || response.data);
      }
    } catch (err: any) {
      console.error('Failed to load question:', err);
    }
  };

  const loadAnswers = async () => {
    try {
      const response = await answerApi.getByQuestion(questionId);
      if (response.status) {
        setAnswers(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!answerContent.trim()) {
      alert('Please enter an answer');
      return;
    }

    setSubmitting(true);
    try {
      const response = await answerApi.create(questionId, answerContent);
      if (response.status) {
        setAnswerContent('');
        loadAnswers();
        loadQuestion(); 
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (type: 'question' | 'answer', id: string, voteType: 'upvote' | 'downvote') => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      if (type === 'question') {
        await questionApi.vote(id, voteType);
        loadQuestion();
      } else {
        await answerApi.vote(id, voteType);
        loadAnswers();
      }
    } catch (err: any) {
      console.error('Failed to vote:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Question not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/community" className="text-pink-600 hover:text-pink-700 mb-4 inline-block">
        ← Back to Community
      </Link>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 flex flex-col items-center">
            <button
              onClick={() => handleVote('question', question._id, 'upvote')}
              className="text-2xl text-gray-400 hover:text-pink-600"
            >
              ▲
            </button>
            <div className="text-xl font-bold text-gray-900">{question.upvotes - question.downvotes}</div>
            <button
              onClick={() => handleVote('question', question._id, 'downvote')}
              className="text-2xl text-gray-400 hover:text-pink-600"
            >
              ▼
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{question.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">{question.category}</span>
              <span>Asked by {question.author?.name || 'Unknown User'}</span>
              <span>• {new Date(question.createdAt).toLocaleDateString()}</span>
              <span>• {question.views} views</span>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {question.answersCount || 0} {question.answersCount === 1 ? 'Answer' : 'Answers'}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Form */}
      {auth.isAuthenticated() && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Answer</h2>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 mb-4"
            placeholder="Write your answer here..."
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={submitting}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      )}

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Answers</h2>
        {answers.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No answers yet. Be the first to answer!</p>
          </div>
        ) : (
          answers.map((answer) => (
            <div key={answer._id} className={`bg-white rounded-lg shadow-md p-6 ${answer.isAccepted ? 'border-2 border-green-500' : ''}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <button
                    onClick={() => handleVote('answer', answer._id, 'upvote')}
                    className="text-xl text-gray-400 hover:text-pink-600"
                  >
                    ▲
                  </button>
                  <div className="font-bold text-gray-900">{answer.upvotes - answer.downvotes}</div>
                  <button
                    onClick={() => handleVote('answer', answer._id, 'downvote')}
                    className="text-xl text-gray-400 hover:text-pink-600"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1">
                  {answer.isAccepted && (
                    <div className="mb-2 text-green-600 font-semibold">✓ Accepted Answer</div>
                  )}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{answer.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Answered by {answer.author?.name || 'Unknown User'} • {new Date(answer.createdAt).toLocaleDateString()}
                    </div>
                    {question.author?._id && !answer.isAccepted && (
                      <button
                        onClick={async () => {
                          try {
                            await answerApi.accept(answer._id, questionId);
                            loadAnswers();
                            loadQuestion();
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Failed to accept answer');
                          }
                        }}
                        className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Accept Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

