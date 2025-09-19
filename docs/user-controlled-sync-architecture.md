# User-Controlled Database Sync Architecture

## Privacy-First Approach

### **Core Principle: User Control Over Their Data**

Users should have **explicit control** over what gets synced to the cloud database, especially for sensitive emotional conversations.

## Recommended Architecture

### **1. Local-First Storage**

```typescript
// All sessions start as local-only by default
interface Session {
  id: string;
  // ... other fields
  persistOnCloud: boolean; // Default: false
  syncSettings: {
    autoSyncToCloud: boolean;
    lastCloudSync?: Date;
    cloudSyncEnabled: boolean;
  };
}
```

### **2. User-Controlled Sync Options**

#### **Option A: Per-Session Control** (Most Granular)

```typescript
// Each session can be individually controlled
const SessionSyncControls = () => (
  <div className="sync-controls">
    <Switch
      checked={session.persistOnCloud}
      onChange={handleToggleCloudSync}
      label="Sync this session to cloud"
    />
    <p className="text-sm text-gray-600">
      Keep this conversation private (local only) or sync for access across devices
    </p>
  </div>
);
```

#### **Option B: Global User Preference** (Simpler)

```typescript
// User sets global preference in settings
interface UserSettings {
  defaultSyncToCloud: boolean;
  alwaysAskBeforeSync: boolean;
  localOnlyMode: boolean;
}
```

#### **Option C: Hybrid Approach** (Recommended)

```typescript
// Global preference + per-session override
const getSyncBehavior = (session: Session, userSettings: UserSettings) => {
  if (userSettings.localOnlyMode) return "local-only";
  if (session.syncSettings.cloudSyncEnabled !== undefined) {
    return session.syncSettings.cloudSyncEnabled ? "cloud-sync" : "local-only";
  }
  return userSettings.defaultSyncToCloud ? "cloud-sync" : "local-only";
};
```

### **3. Transparent Sync Status**

#### **Visual Indicators**

```typescript
const SyncStatusBadge = ({ session }: { session: Session }) => {
  const status = session.persistOnCloud ? 'cloud' : 'local';

  return (
    <Badge variant={status === 'cloud' ? 'blue' : 'gray'}>
      {status === 'cloud' ? (
        <>
          <CloudIcon className="w-3 h-3" />
          Synced to cloud
        </>
      ) : (
        <>
          <DeviceIcon className="w-3 h-3" />
          Local only
        </>
      )}
    </Badge>
  );
};
```

#### **User Dashboard**

```typescript
const PrivacyDashboard = () => (
  <div className="privacy-dashboard">
    <h3>Your Data Control</h3>
    <div className="stats">
      <div>📱 Local sessions: {localSessionCount}</div>
      <div>☁️ Cloud sessions: {cloudSessionCount}</div>
      <div>🔒 Private conversations stay on your device</div>
    </div>

    <Button onClick={exportLocalData}>
      Export Local Data
    </Button>
  </div>
);
```

## Implementation Strategy

### **Phase 1: Current Sessions**

For existing sessions, we should:

1. **Default to local-only** for privacy
2. **Show migration dialog** explaining options
3. **Let users choose** what to sync

```typescript
const SessionMigrationDialog = () => (
  <Dialog>
    <DialogContent>
      <h2>Control Your Data Privacy</h2>
      <p>You have {existingSessionCount} conversations. Choose how to handle them:</p>

      <div className="options">
        <RadioGroup>
          <Radio value="local-only">
            Keep all conversations private (local only)
          </Radio>
          <Radio value="selective">
            Let me choose which conversations to sync
          </Radio>
          <Radio value="sync-all">
            Sync all conversations to cloud for device access
          </Radio>
        </RadioGroup>
      </div>

      <p className="privacy-note">
        💡 You can always change these settings later for individual conversations
      </p>
    </DialogContent>
  </Dialog>
);
```

### **Phase 2: New Sessions**

```typescript
const NewSessionDialog = () => {
  const [syncToCloud, setSyncToCloud] = useState(userSettings.defaultSyncToCloud);

  return (
    <Dialog>
      <DialogContent>
        <h2>New Conversation</h2>

        <div className="sync-option">
          <Switch
            checked={syncToCloud}
            onChange={setSyncToCloud}
          />
          <div>
            <label>Sync to cloud</label>
            <p className="text-sm">Access this conversation across your devices</p>
          </div>
        </div>

        <div className="privacy-notice">
          🔒 Your conversations are always encrypted.
          Local conversations never leave your device.
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## Technical Implementation

### **Modified Auto-Sync System**

```typescript
export class SessionSyncManager {
  queueSync(sessionId: string, obfuscatedId: string, operation: string, data: Session): void {
    // Always sync locally (encrypted store)
    this.queueLocalSync(sessionId, obfuscatedId, operation, data);

    // Only sync to cloud if user has enabled it for this session
    if (data.persistOnCloud && data.syncSettings?.cloudSyncEnabled) {
      this.queueCloudSync(sessionId, operation, data);
    }
  }

  private async queueCloudSync(sessionId: string, operation: string, data: Session) {
    // Sync to Supabase only when explicitly enabled
    await this.cloudSyncQueue.add({
      sessionId,
      operation,
      data,
      timestamp: new Date(),
    });
  }
}
```

## Privacy Benefits

### **1. User Autonomy**

- ✅ Users decide what's private vs synced
- ✅ Can change sync settings anytime
- ✅ Full control over their emotional data

### **2. Privacy by Design**

- ✅ Local-first architecture
- ✅ Explicit consent for cloud sync
- ✅ No surprise data uploads

### **3. Compliance Ready**

- ✅ GDPR compliant (explicit consent)
- ✅ Right to data portability (export)
- ✅ Right to deletion (local-only sessions)

### **4. Trust Building**

- ✅ Transparent about data handling
- ✅ Users see exactly what's synced
- ✅ Privacy-focused design signals

## Recommendation

**Use the Hybrid Approach** with:

1. **Default to local-only** for new sessions
2. **User chooses** cloud sync per session or globally
3. **Clear migration dialog** for existing sessions
4. **Transparent sync status** throughout the UI

This gives users **maximum control** while still enabling the convenience of cross-device sync when they want it.
