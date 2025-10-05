"use client";

import { useState } from "react";
import { Tester } from "@prisma/client";
import { CheckCircle, Filter, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { acceptUser, deleteTester, updateTester } from "@/app/actions/tester-actions";
import { Button } from "@/components/mir-ui/button";
import Card from "@/components/mir-ui/card";

interface Props {
  initialTesters: Tester[];
}

type FilterType = "all" | "pending" | "accepted" | "rejected";

export default function TesterManagementClient({ initialTesters }: Props) {
  const [testers, setTesters] = useState<Tester[]>(initialTesters);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Filter testers
  const filteredTesters = testers.filter((tester) => {
    // Search filter
    const matchesSearch = tester.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesFilter = true;
    if (filter === "pending") {
      matchesFilter = !tester.accepted;
    } else if (filter === "accepted") {
      matchesFilter = tester.accepted;
    }

    return matchesSearch && matchesFilter;
  });

  const handleAccept = async (testerId: string) => {
    setLoadingActions((prev) => ({ ...prev, [testerId]: true }));
    try {
      const result = await acceptUser(testerId);
      if (result) {
        setTesters((prev) => prev.map((t) => (t.id === testerId ? { ...t, accepted: true } : t)));
        toast.success("Tester accepted successfully");
      }
    } catch {
      toast.error("Failed to accept tester");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [testerId]: false }));
    }
  };

  const handleReject = async (testerId: string) => {
    setLoadingActions((prev) => ({ ...prev, [testerId]: true }));
    try {
      await updateTester(testerId, { accepted: false });
      setTesters((prev) => prev.map((t) => (t.id === testerId ? { ...t, accepted: false } : t)));
      toast.success("Tester rejected");
    } catch {
      toast.error("Failed to reject tester");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [testerId]: false }));
    }
  };

  const handleDelete = async (testerId: string) => {
    if (!confirm("Are you sure you want to delete this tester application?")) {
      return;
    }

    setLoadingActions((prev) => ({ ...prev, [testerId]: true }));
    try {
      await deleteTester(testerId);
      setTesters((prev) => prev.filter((t) => t.id !== testerId));
      toast.success("Tester deleted successfully");
    } catch {
      toast.error("Failed to delete tester");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [testerId]: false }));
    }
  };

  const handleSaveNotes = async (testerId: string) => {
    setLoadingActions((prev) => ({ ...prev, [testerId]: true }));
    try {
      await updateTester(testerId, { notes: notesValue });
      setTesters((prev) => prev.map((t) => (t.id === testerId ? { ...t, notes: notesValue } : t)));
      setEditingNotes(null);
      toast.success("Notes updated");
    } catch {
      toast.error("Failed to update notes");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [testerId]: false }));
    }
  };

  const startEditingNotes = (testerId: string, currentNotes: string | null) => {
    setEditingNotes(testerId);
    setNotesValue(currentNotes || "");
  };

  const stats = {
    total: testers.length,
    pending: testers.filter((t) => !t.accepted).length,
    accepted: testers.filter((t) => t.accepted).length,
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-inn-text-secondary mb-1">Total Applications</div>
          <div className="text-3xl font-bold text-inn-text-primary">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-inn-text-secondary mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-inn-text-secondary mb-1">Accepted</div>
          <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-inn-text-secondary" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-inn-bg-secondary text-inn-text-primary border border-inn-border rounded-lg focus:outline-none focus:ring-2 focus:ring-inn-bg-accent"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-inn-text-secondary" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-4 py-2 bg-inn-bg-secondary text-inn-text-primary border border-inn-border rounded-lg focus:outline-none focus:ring-2 focus:ring-inn-bg-accent"
            >
              <option value="all">All ({stats.total})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="accepted">Accepted ({stats.accepted})</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Testers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-inn-bg-secondary border-b border-inn-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Source</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Occupation</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Struggles</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Notes</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-inn-text-primary">Date</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-inn-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inn-border">
              {filteredTesters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-inn-text-secondary">
                    No testers found
                  </td>
                </tr>
              ) : (
                filteredTesters.map((tester) => (
                  <tr key={tester.id} className="hover:bg-inn-bg-secondary/50">
                    <td className="px-4 py-3 text-sm text-inn-text-primary font-medium">{tester.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          tester.accepted
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {tester.accepted ? (
                          <>
                            <CheckCircle className="size-3" />
                            Accepted
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-inn-text-secondary">{tester.source || "-"}</td>
                    <td className="px-4 py-3 text-sm text-inn-text-secondary max-w-xs truncate">
                      {tester.occupation || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-inn-text-secondary max-w-xs truncate">
                      {tester.struggles || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingNotes === tester.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-inn-bg-primary border border-inn-border rounded resize-none"
                            rows={2}
                            placeholder="Add notes..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(tester.id)}
                              disabled={loadingActions[tester.id]}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingNotes(tester.id, tester.notes)}
                          className="text-inn-text-secondary hover:text-inn-text-primary text-left max-w-xs truncate"
                        >
                          {tester.notes || "Add notes..."}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-inn-text-secondary">
                      {new Date(tester.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!tester.accepted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAccept(tester.id)}
                            disabled={loadingActions[tester.id]}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                        )}
                        {tester.accepted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(tester.id)}
                            disabled={loadingActions[tester.id]}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <XCircle className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(tester.id)}
                          disabled={loadingActions[tester.id]}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
