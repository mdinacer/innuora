"use client";

import { useState } from "react";
import { Calendar, Camera, Globe, Mail, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

interface ProfileSettingsProps {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
}

// =========================
// Profile Settings Component
// =========================

export default function ProfileSettings({ userId, userEmail, userName }: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userName || "");

  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <button className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors">
            <Camera className="h-3 w-3 text-gray-600" />
          </button>
        </div>

        {/* Basic Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{userName || "Anonymous User"}</h3>
            <Badge variant="outline" className="text-xs">
              Verified
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Mail className="h-4 w-4" />
            <span>{userEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Member since Dec 2024</span>
          </div>
        </div>

        {/* Edit Button */}
        <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Profile Details */}
      <div className="space-y-6">
        {/* Display Name */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="display-name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Display Name
          </label>
          <div className="col-span-2">
            {isEditing ? (
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your display name"
              />
            ) : (
              <span className="text-gray-900">{userName || "Not set"}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </div>
          <div className="col-span-2">
            <span className="text-gray-900">{userEmail}</span>
            <p className="text-xs text-gray-500 mt-1">Email changes require verification</p>
          </div>
        </div>

        {/* Language */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="language" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language
          </label>
          <div className="col-span-2">
            {isEditing ? (
              <select
                id="language"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            ) : (
              <span className="text-gray-900">English</span>
            )}
          </div>
        </div>

        {/* Timezone */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="timezone" className="text-sm font-medium text-gray-700">
            Timezone
          </label>
          <div className="col-span-2">
            {isEditing ? (
              <select
                id="timezone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Dubai">Dubai</option>
              </select>
            ) : (
              <span className="text-gray-900">UTC</span>
            )}
          </div>
        </div>
      </div>

      {/* Save Changes */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
        </div>
      )}

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Account Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">User ID:</span>
            <span className="ml-2 font-mono text-xs">{userId}</span>
          </div>
          <div>
            <span className="text-gray-600">Account Type:</span>
            <span className="ml-2">Individual</span>
          </div>
          <div>
            <span className="text-gray-600">Account Status:</span>
            <Badge variant="default" className="ml-2 text-xs">
              Active
            </Badge>
          </div>
          <div>
            <span className="text-gray-600">Verification:</span>
            <Badge variant="outline" className="ml-2 text-xs">
              Email Verified
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
