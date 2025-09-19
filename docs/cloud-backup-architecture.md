# Cloud Backup Architecture

## Clear User Mental Model: "Backup + Cross-Device Access"

Instead of confusing "sync" terminology, frame it as **backup with device continuity**.

## User-Friendly Framing

### **Simple Message:**

> 💾 **"Create a backup on the cloud"**  
> ✨ **"Continue this conversation on any device"**

### **Clear Benefits:**

- 📱➡️💻 **Switch devices** - Start on phone, continue on laptop
- 🔒 **Safe backup** - Never lose important conversations
- 🌐 **Access anywhere** - Available when you need support
- 🔐 **Always encrypted** - Your privacy is protected

## UI/UX Design

### **1. Session Creation Flow**

```typescript
const NewSessionDialog = () => (
  <Dialog>
    <DialogContent>
      <h2>Start a New Conversation</h2>

      <div className="backup-option">
        <div className="option-card">
          <div className="icon">💾</div>
          <div className="content">
            <h3>Backup to cloud</h3>
            <p>Continue this conversation on any device</p>
            <ul className="benefits">
              <li>✓ Access from phone, tablet, or computer</li>
              <li>✓ Never lose your conversations</li>
              <li>✓ Always encrypted and private</li>
            </ul>
          </div>
          <Switch checked={backupEnabled} onChange={setBackupEnabled} />
        </div>

        <div className="option-card">
          <div className="icon">📱</div>
          <div className="content">
            <h3>This device only</h3>
            <p>Keep conversation completely private</p>
            <ul className="benefits">
              <li>✓ Maximum privacy</li>
              <li>✓ No cloud storage</li>
              <li>✓ Device-specific access</li>
            </ul>
          </div>
          <Switch checked={!backupEnabled} onChange={() => setBackupEnabled(false)} />
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
```

### **2. Session Status Indicators**

```typescript
const SessionBackupStatus = ({ session }: { session: Session }) => {
  const isBackedUp = session.persistOnCloud;

  return (
    <div className="backup-status">
      {isBackedUp ? (
        <Badge variant="blue" className="backup-badge">
          <CloudCheckIcon className="w-3 h-3" />
          Backed up • Available on all devices
        </Badge>
      ) : (
        <Badge variant="gray" className="local-badge">
          <DeviceIcon className="w-3 h-3" />
          This device only
        </Badge>
      )}
    </div>
  );
};
```

### **3. Mid-Conversation Backup Prompt**

```typescript
const BackupPrompt = ({ session, onBackup }: BackupPromptProps) => (
  <div className="backup-prompt">
    <div className="prompt-content">
      <h4>💾 Create a backup of this conversation?</h4>
      <p>Continue this important discussion on any device</p>

      <div className="benefits">
        <div>📱➡️💻 Switch between devices</div>
        <div>🔒 Secure & encrypted backup</div>
        <div>🌐 Access when you need support</div>
      </div>

      <div className="actions">
        <Button variant="primary" onClick={onBackup}>
          Create Backup
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Keep Local Only
        </Button>
      </div>
    </div>
  </div>
);
```

### **4. Settings Dashboard**

```typescript
const BackupSettings = () => (
  <div className="backup-settings">
    <h3>Conversation Backups</h3>

    <div className="stats">
      <StatCard>
        <div className="stat-number">{localCount}</div>
        <div className="stat-label">📱 Device only</div>
      </StatCard>

      <StatCard>
        <div className="stat-number">{backedUpCount}</div>
        <div className="stat-label">💾 Backed up</div>
      </StatCard>
    </div>

    <div className="settings">
      <SettingItem>
        <label>Default for new conversations</label>
        <Select value={defaultBackup} onChange={setDefaultBackup}>
          <option value="ask">Ask me each time</option>
          <option value="backup">Always create backup</option>
          <option value="local">Keep on device only</option>
        </Select>
      </SettingItem>

      <SettingItem>
        <label>Smart backup suggestions</label>
        <Switch
          checked={smartSuggestions}
          onChange={setSmartSuggestions}
        />
        <p className="help-text">
          Suggest backup for longer or important conversations
        </p>
      </SettingItem>
    </div>
  </div>
);
```

## Smart Backup Triggers

### **When to Suggest Backup:**

```typescript
const shouldSuggestBackup = (session: Session): boolean => {
  // Smart triggers for backup suggestions
  return (
    session.messages.length >= 10 || // Substantial conversation
    session.metadata.costUSD > 0.50 || // Valuable conversation
    session.continuitySummary || // Important insights generated
    containsBreakthroughMoment(session) // AI detected important moment
  );
};

const BackupSuggestion = () => (
  <div className="backup-suggestion">
    <div className="suggestion-icon">💡</div>
    <div className="suggestion-content">
      <h4>This seems like an important conversation</h4>
      <p>Would you like to back it up so you can continue on other devices?</p>

      <div className="suggestion-actions">
        <Button size="sm" onClick={handleBackup}>
          Yes, create backup
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          No thanks
        </Button>
      </div>
    </div>
  </div>
);
```

## Technical Implementation

### **Modified Session Interface:**

```typescript
interface Session {
  id: string;
  // ... existing fields

  // Backup settings
  cloudBackup: {
    enabled: boolean;
    lastBackupAt?: Date;
    backupStatus: "none" | "pending" | "backed-up" | "failed";
    autoBackup: boolean;
  };

  // Device continuity
  deviceAccess: {
    originalDevice: string;
    accessedDevices: string[];
    currentDevice: string;
  };
}
```

### **Backup Service:**

```typescript
export class CloudBackupService {
  async createBackup(session: Session): Promise<BackupResult> {
    try {
      // Encrypt session data
      const encrypted = await this.encryptForBackup(session);

      // Upload to Supabase
      const result = await supabase.from("session_backups").insert({
        session_id: session.id,
        encrypted_data: encrypted.data,
        encryption_metadata: encrypted.metadata,
        device_id: this.getCurrentDeviceId(),
        created_at: new Date().toISOString(),
      });

      return { success: true, backupId: result.data.id };
    } catch (error) {
      return { success: false, error };
    }
  }

  async restoreFromBackup(sessionId: string): Promise<Session | null> {
    // Retrieve and decrypt backup from Supabase
    const backup = await supabase.from("session_backups").select("*").eq("session_id", sessionId).single();

    if (!backup.data) return null;

    return await this.decryptBackup(backup.data);
  }
}
```

### **Auto-Sync with Backup Context:**

```typescript
export class SessionSyncManager {
  queueSync(sessionId: string, obfuscatedId: string, operation: string, data: Session): void {
    // Always sync locally (immediate)
    this.queueLocalSync(sessionId, obfuscatedId, operation, data);

    // Backup to cloud if enabled
    if (data.cloudBackup.enabled) {
      this.queueCloudBackup(sessionId, operation, data);
    }
  }

  private async queueCloudBackup(sessionId: string, operation: string, data: Session) {
    // Update backup with current session state
    await this.cloudBackupService.updateBackup(sessionId, data);

    // Update backup status
    data.cloudBackup.lastBackupAt = new Date();
    data.cloudBackup.backupStatus = "backed-up";
  }
}
```

## User Experience Flow

### **1. First Time User:**

```
┌─ Create conversation ─┐
│                       │
│ 💾 Backup to cloud?   │
│ ✨ Continue anywhere  │
│                       │
│ [Yes] [No, device only] │
└─────────────────────────┘
```

### **2. Existing User with Important Conversation:**

```
┌─ After meaningful exchange ─┐
│                             │
│ 💡 This seems important!    │
│ 💾 Create backup to         │
│    continue on other        │
│    devices?                 │
│                             │
│ [Create Backup] [No thanks] │
└─────────────────────────────┘
```

### **3. Cross-Device Access:**

```
┌─ On new device ─┐
│                 │
│ 📱➡️💻 Continue │
│ conversation    │
│ from phone?     │
│                 │
│ [Yes] [Start    │
│       new]      │
└─────────────────┘
```

## Benefits of This Approach:

### **Clear Mental Model:**

- ✅ **"Backup"** is universally understood
- ✅ **"Continue anywhere"** shows clear benefit
- ✅ **No confusing "sync" terminology**

### **User Control:**

- ✅ **Explicit choice** for each conversation
- ✅ **Smart suggestions** for important conversations
- ✅ **Easy to understand** privacy implications

### **Privacy Focused:**

- ✅ **Device-only by default** for privacy
- ✅ **Backup is optional** enhancement
- ✅ **Always encrypted** in cloud storage

This framing makes the cloud storage feel like a **helpful feature** rather than a privacy concern, while maintaining full user control.
