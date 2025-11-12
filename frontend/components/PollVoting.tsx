'use client';

import { useState, useEffect } from 'react';
import { pollApi, Poll } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { auth } from '@/lib/auth';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import Link from 'next/link';

interface PollVotingProps {
  pollId: string;
  onVoteSuccess?: (poll: Poll) => void;
  showResults?: boolean; // Whether to show results even if user hasn't voted
  className?: string;
}

export default function PollVoting({ 
  pollId, 
  onVoteSuccess,
  showResults = false,
  className = '' 
}: PollVotingProps) {
  const { t } = useTranslation();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const isAuthenticated = auth.isAuthenticated();

  useEffect(() => {
    loadPoll();
  }, [pollId]);

  const loadPoll = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await pollApi.getById(pollId);
      if (response.status && response.data) {
        setPoll(response.data);
        if (response.data.userVote) {
          setSelectedOption(response.data.userVote);
        }
      } else {
        setError(response.message || 'Failed to load poll');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!isAuthenticated) {
      setError('Please login to vote');
      return;
    }

    if (poll?.hasVoted && !poll.allowMultipleVotes) {
      setError(t('polls.hasVoted') || 'You have already voted on this poll');
      return;
    }

    setVoting(true);
    setError('');
    
    try {
      const response = await pollApi.vote(pollId, optionId);
      if (response.status && response.data) {
        setPoll(response.data);
        setSelectedOption(optionId);
        if (onVoteSuccess) {
          onVoteSuccess(response.data);
        }
      } else {
        setError(response.message || 'Failed to submit vote');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  // Calculate percentage for each option
  const getPercentage = (votes: number, totalVotes: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  // Check if poll is expired
  const isExpired = poll?.expiresAt ? new Date(poll.expiresAt) < new Date() : false;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-[#181b23] rounded-lg shadow-md p-6 ${className} transition-colors`}>
        <LoadingSpinner size="md" text="Loading poll..." />
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className={`bg-white dark:bg-[#181b23] rounded-lg shadow-md p-6 ${className} transition-colors`}>
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className={`bg-white dark:bg-[#181b23] rounded-lg shadow-md p-6 ${className} transition-colors`}>
        <EmptyState
          icon="📊"
          title={t('polls.noPolls') || 'Poll not found'}
          description="The poll you're looking for doesn't exist or has been removed"
        />
      </div>
    );
  }

  const canVote = isAuthenticated && (!poll.hasVoted || poll.allowMultipleVotes) && !isExpired && poll.isActive;
  const showVoteResults = poll.hasVoted || showResults || !isAuthenticated;

  return (
    <div className={`bg-white dark:bg-[#181b23] rounded-lg shadow-md p-4 sm:p-6 ${className} transition-colors`}>
      {/* Poll Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-pink-100 flex-1">
            {poll.title}
          </h3>
          {poll.category && (
            <span className="px-2 py-1 text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded whitespace-nowrap">
              {poll.category}
            </span>
          )}
        </div>
        
        {poll.description && (
          <p className="text-sm text-gray-600 dark:text-pink-200 mb-3">
            {poll.description}
          </p>
        )}

        {/* Poll Status */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-pink-300 mb-4">
          <span>{poll.totalVotes} {t('polls.totalVotes') || 'votes'}</span>
          {isExpired && (
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              Expired
            </span>
          )}
          {!poll.isActive && (
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              Inactive
            </span>
          )}
          {poll.hasVoted && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
              ✓ Voted
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-400 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Voting Options */}
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = showVoteResults ? getPercentage(option.votes, poll.totalVotes) : 0;
          const isSelected = selectedOption === option._id;
          const isWinning = showVoteResults && poll.totalVotes > 0 && option.votes === Math.max(...poll.options.map(o => o.votes));

          return (
            <div
              key={option._id}
              className={`
                relative border-2 rounded-lg p-3 sm:p-4 transition-all
                ${canVote && !voting
                  ? 'border-gray-300 dark:border-[#303341] hover:border-pink-500 dark:hover:border-pink-400 cursor-pointer'
                  : 'border-gray-200 dark:border-[#303341]'
                }
                ${isSelected ? 'border-pink-500 dark:border-pink-400 bg-pink-50 dark:bg-pink-900/10' : ''}
                ${isWinning && showVoteResults ? 'ring-2 ring-green-400 dark:ring-green-500' : ''}
              `}
              onClick={() => {
                if (canVote && !voting) {
                  handleVote(option._id);
                }
              }}
            >
              {/* Option Text */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm sm:text-base font-medium ${
                  isSelected 
                    ? 'text-pink-700 dark:text-pink-300' 
                    : 'text-gray-900 dark:text-pink-100'
                }`}>
                  {option.text}
                </span>
                {showVoteResults && (
                  <span className="text-sm font-semibold text-gray-700 dark:text-pink-200 ml-2">
                    {percentage}%
                  </span>
                )}
              </div>

              {/* Progress Bar (if showing results) */}
              {showVoteResults && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isWinning
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-pink-500 to-pink-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}

              {/* Vote Count (if showing results) */}
              {showVoteResults && (
                <div className="text-xs text-gray-500 dark:text-pink-300 mt-1">
                  {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            Please login to vote on this poll
          </p>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login →
          </Link>
        </div>
      )}

      {/* Voting in Progress */}
      {voting && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-pink-300">
          <LoadingSpinner size="sm" />
          <span>Submitting vote...</span>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#303341] text-xs text-gray-500 dark:text-pink-300">
        {poll.createdBy && typeof poll.createdBy === 'object' && (
          <span>Created by {poll.createdBy.name}</span>
        )}
        {poll.expiresAt && !isExpired && (
          <span className="ml-2">
            • Expires {new Date(poll.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

