# Code Review - Issues Found

## Critical Issues

### 1. **AIChat.tsx - Bug: Using cleared input variable** ⚠️
**Location:** `src/components/AIChat.tsx:52`
**Problem:** The `input` variable is cleared on line 46, but then used on line 52 to send to the backend. This will send an empty message.

**Current code:**
```typescript
setInput("");  // Line 46 - clears input
// ...
const response = await invoke<string>("chat_with_ai", {
  message: input,  // Line 52 - input is now empty!
```

**Fix:** Save the input before clearing:
```typescript
const messageText = input;  // Save before clearing
setInput("");
// ...
const response = await invoke<string>("chat_with_ai", {
  message: messageText,
```

### 2. **Missing Icons** ⚠️
**Location:** `src-tauri/tauri.conf.json:30-35`
**Problem:** Icon files are referenced but don't exist. Build will fail or app won't have icons.

**Fix:** Create icon files or remove icon references from config.

## Medium Priority Issues

### 3. **Template Loader Naming Conflict** 
**Location:** `src/store.ts:53-55`
**Problem:** Function `loadTemplates` imports a function with the same name, which is confusing but works.

**Current:**
```typescript
loadTemplates: async () => {
  const { loadTemplates } = await import("./utils/templateLoader");
  const templates = await loadTemplates();
```

**Fix:** Rename the imported function:
```typescript
loadTemplates: async () => {
  const { loadTemplates: loadTemplatesFromFile } = await import("./utils/templateLoader");
  const templates = await loadTemplatesFromFile();
```

### 4. **useEffect Dependency Issue**
**Location:** `src/App.tsx:13-15`
**Problem:** `loadTemplates` is in the dependency array, but Zustand functions might change reference.

**Current:**
```typescript
useEffect(() => {
  loadTemplates();
}, [loadTemplates]);
```

**Fix:** Either remove from deps (run once) or use useCallback:
```typescript
useEffect(() => {
  loadTemplates();
}, []); // Run once on mount
```

### 5. **Store updateDocument Null Assertion**
**Location:** `src/store.ts:95`
**Problem:** Uses `!` assertion which could fail if `currentDocument` is null.

**Current:**
```typescript
currentDocument:
  state.currentDocumentId === id
    ? { ...state.currentDocument!, ...updates, updatedAt: new Date() }
```

**Fix:** Add null check:
```typescript
currentDocument:
  state.currentDocumentId === id && state.currentDocument
    ? { ...state.currentDocument, ...updates, updatedAt: new Date() }
    : state.currentDocument,
```

## Low Priority / Potential Issues

### 6. **Tauri v2 API Verification Needed**
**Location:** `src/components/Editor.tsx:6-7`
**Problem:** Need to verify Tauri v2 API usage is correct.

**Current:**
```typescript
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
```

**Note:** These imports look correct for Tauri v2, but should be tested.

### 7. **crypto.randomUUID Browser Compatibility**
**Location:** Multiple files
**Problem:** `crypto.randomUUID()` is used but might not be available in all browsers (requires secure context).

**Files affected:**
- `src/store.ts:70, 110`
- `src/components/AIChat.tsx:39, 60, 70`

**Fix:** Add fallback:
```typescript
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

### 8. **Missing Error Handling in Editor**
**Location:** `src/components/Editor.tsx:36`
**Problem:** `writeTextFile` might fail but error is only logged, not shown to user.

**Fix:** Add user-visible error notification.

### 9. **AIChat Context Type Mismatch**
**Location:** `src/components/AIChat.tsx:53-56`
**Problem:** The context object structure might not match what Rust expects.

**Current:**
```typescript
context: currentDocument ? {
  name: currentDocument.name,
  requirementsCount: currentDocument.requirements.length,
} : null,
```

**Rust expects:**
```rust
struct ChatContext {
    name: Option<String>,
    requirements_count: Option<usize>,
}
```

**Note:** Snake_case vs camelCase - might need serialization handling.

### 10. **No Persistence**
**Problem:** Documents are only stored in memory. Closing the app loses all data.

**Fix:** Add local storage or file-based persistence.

## Configuration Issues

### 11. **Missing Icons Directory**
**Location:** `src-tauri/tauri.conf.json`
**Problem:** Icons directory doesn't exist.

**Fix:** Create icons or update config to not require them for development.

### 12. **CSP Security**
**Location:** `src-tauri/tauri.conf.json:24`
**Problem:** CSP is set to `null`, which might be insecure.

**Note:** For development this is fine, but should be configured for production.

## Summary

**Critical:** 2 issues (AIChat bug, missing icons)
**Medium:** 3 issues (naming, dependencies, null assertion)
**Low:** 7 issues (API verification, browser compatibility, error handling, etc.)

**Total:** 12 issues found

## Recommended Fix Order

1. Fix AIChat input bug (critical)
2. Create/remove icon references (critical)
3. Fix useEffect dependency (medium)
4. Add error handling (low)
5. Add persistence (low)
6. Verify Tauri API usage (low)

