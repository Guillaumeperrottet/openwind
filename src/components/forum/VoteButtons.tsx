"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useFavContext } from "@/lib/FavContext";

interface VoteButtonsProps {
  topicId?: string;
  postId?: string;
  score: number;
  userVote?: number | null;
  inline?: boolean;
}

export function VoteButtons({
  topicId,
  postId,
  score: initialScore,
  userVote: initialVote,
  inline,
}: VoteButtonsProps) {
  const { user, requestAuth } = useFavContext();
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<number | null>(initialVote ?? null);
  const [loading, setLoading] = useState(false);

  const vote = async (value: 1 | -1) => {
    if (!user) {
      requestAuth();
      return;
    }
    if (loading) return;
    setLoading(true);

    // Optimistic
    const prevScore = score;
    const prevVote = myVote;

    if (myVote === value) {
      // Toggle off
      setScore(score - value);
      setMyVote(null);
    } else {
      setScore(score - (myVote ?? 0) + value);
      setMyVote(value);
    }

    try {
      const res = await fetch("/api/forum/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, postId, value }),
      });
      if (!res.ok) {
        setScore(prevScore);
        setMyVote(prevVote);
      }
    } catch {
      setScore(prevScore);
      setMyVote(prevVote);
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => vote(1)}
          className={`p-0.5 rounded transition-colors ${
            myVote === 1
              ? "text-orange-500"
              : "text-gray-400 hover:text-orange-500"
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span
          className={`text-xs font-bold tabular-nums ${
            score > 0
              ? "text-gray-700"
              : score < 0
                ? "text-gray-400"
                : "text-gray-400"
          }`}
        >
          {score}
        </span>
        <button
          onClick={() => vote(-1)}
          className={`p-0.5 rounded transition-colors ${
            myVote === -1
              ? "text-blue-600"
              : "text-gray-400 hover:text-blue-600"
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => vote(1)}
        className={`p-0.5 rounded transition-colors ${
          myVote === 1
            ? "text-orange-500"
            : "text-gray-400 hover:text-orange-500"
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span
        className={`text-xs font-bold tabular-nums ${
          score > 0
            ? "text-gray-700"
            : score < 0
              ? "text-gray-400"
              : "text-gray-400"
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        className={`p-0.5 rounded transition-colors ${
          myVote === -1 ? "text-blue-600" : "text-gray-400 hover:text-blue-600"
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
