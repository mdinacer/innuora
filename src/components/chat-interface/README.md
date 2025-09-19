# Chat Interface Components

This is the optimized and consolidated version of the chat UI system, replacing the original `chat-ui` folder.

## Architecture

### Clean Separation

- **shared/**: Common components used by both chat modes
- **flow-chat/**: Guided therapeutic conversation components
- **open-chat/**: Free-form conversation components
- **types/**: Shared TypeScript types

### Key Improvements

- ✅ **No Code Duplication**: Single configurable ChatContainer
- ✅ **Complete Implementation**: Flow chat is fully functional
- ✅ **Clean Types**: Centralized type definitions
- ✅ **Simple Usage**: Clear, focused component APIs

## Usage

### Flow Chat (Guided)

```tsx
import { FlowChat } from "@/components/chat-interface";

<FlowChat
  session={session}
  messages={flowMessages}
  onUserInput={handleUserInput}
  onUserSelect={handleUserSelect}
  onFlowEnd={handleFlowEnd}
  onMoveToNextStep={handleNextStep}
  onMoveToStep={handleMoveToStep}
/>;
```

### Open Chat (Free-form)

```tsx
import { OpenChat } from "@/components/chat-interface";

<OpenChat session={session} messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />;
```

### Shared Components

```tsx
import { ChatContainer, ChatInput, MessageBubble } from "@/components/chat-interface";

// Build custom chat interfaces
<ChatContainer mode="open" session={session}>
  <MessageBubble role="user">Hello!</MessageBubble>
</ChatContainer>;
```

## Benefits

1. **Single Responsibility**: Each component has one focused job
2. **Composition Over Inheritance**: Build complex UIs from simple parts
3. **Type Safety**: Full TypeScript coverage with discriminated unions
4. **Performance**: Proper memoization and optimization
5. **Maintainability**: Clear structure, no duplication
