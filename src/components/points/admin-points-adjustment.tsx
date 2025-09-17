"use client";

import { useState } from "react";

import { adminAdjustPoints } from "@/app/actions/points-actions";

interface AdminPointsAdjustmentProps {
  userId: string;
  userDisplayName?: string;
  onSuccess?: () => void;
}

export function AdminPointsAdjustment({ userId, userDisplayName, onSuccess }: AdminPointsAdjustmentProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adjustmentAmount = parseInt(amount);
    if (isNaN(adjustmentAmount) || adjustmentAmount === 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    if (!reason.trim()) {
      setMessage("Please provide a reason");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await adminAdjustPoints(userId, adjustmentAmount, reason);
      setMessage(`Successfully ${adjustmentAmount > 0 ? "added" : "removed"} ${Math.abs(adjustmentAmount)} points`);
      setAmount("");
      setReason("");
      onSuccess?.();
    } catch (error) {
      setMessage("Failed to adjust points: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        Adjust Points{userDisplayName && ` for ${userDisplayName}`}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (positive to add, negative to remove)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use positive numbers to add points, negative to remove points
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for adjustment"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes("Failed") 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !amount || !reason.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adjusting..." : "Adjust Points"}
        </button>
      </form>
    </div>
  );
}