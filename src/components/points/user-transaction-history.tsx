"use client";

import { useState, useEffect } from "react";

import { getUserTransactions } from "@/app/actions/points-actions";

interface PointsTransaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface TransactionData {
  transactions: PointsTransaction[];
  totalPages: number;
  currentPage: number;
  total: number;
}

interface UserTransactionHistoryProps {
  userId: string;
}

export function UserTransactionHistory({ userId }: UserTransactionHistoryProps) {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [userId, currentPage]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await getUserTransactions(userId, currentPage);
      setData(result);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {data.transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === "credit"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type === "credit" ? "+" : "-"}
                  {Math.abs(transaction.amount)}
                </span>
                <span className="text-sm text-gray-600">{transaction.reason}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(transaction.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Page {data.currentPage} of {data.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
              disabled={currentPage === data.totalPages}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}