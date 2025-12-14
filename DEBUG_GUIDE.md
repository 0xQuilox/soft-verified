# Verified Wallet Extension - Debugging Guide

## Quick Reference

### 1. Extension Background Console
**How to Access:**
1. Open Chrome: `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Find "Verified Wallet" extension
4. Click "Service Worker" link (opens DevTools)

**What to Look For:**
- SDK initialization logs
- Message handling (`chrome.runtime.onMessage`)
- Storage operations (`chrome.storage`)
- Error messages
- `console.log(privateKey...)` 😬

**Key Log Points:**
- Line 2357: `console.error("base64Decode failed: ", e)`
- Line 3533: `console.warn(e)`
- Line 5386: Main message handler

### 2. Popup DevTools
**How to Access:**
1. Right-click extension icon in toolbar
2. Select "Inspect popup"
3. DevTools opens for popup window

**What to Look For:**
- React component state
- Message passing to background
- Storage reads/writes
- Error popups

**Key Components:**
- `pages/Popup/index.js`
- `components/popup.js`

### 3. Web Page Console
**How to Access:**
1. Open any website
2. Press F12 (or right-click → Inspect)
3. Go to Console tab

**What to Look For:**
- `window.verifiedwallet` object
- `window.ethereum` provider
- `localStorage.getItem("myVault")`
- `postMessage` events
- Provider announcements (EIP-6963)

**Test Commands:**
```javascript
// Check if provider exists
console.log(window.verifiedwallet);
console.log(window.ethereum);

// Check localStorage
console.log(localStorage.getItem("myVault"));

// Listen for messages
window.addEventListener("message", (e) => {
  console.log("Message received:", e.data);
});

// Request accounts
window.verifiedwallet?.request({ method: "eth_requestAccounts" });
```

### 4. Content Script Context
**How to Access:**
1. Open web page
2. Open DevTools
3. Go to Sources tab
4. Look for extension files under "Content scripts"

**What to Look For:**
- Message forwarding logic
- Origin validation
- Event listeners

**Key File:** `scripts/content.js`

## Debug Flags to Enable

### Verbose Logging
Add to background script:
```javascript
const DEBUG = true;
if (DEBUG) {
  console.log("[DEBUG] Message received:", message);
  console.log("[DEBUG] SDK state:", sdkState);
}
```

### Storage Monitoring
```javascript
// Monitor chrome.storage
chrome.storage.onChanged.addListener((changes, area) => {
  console.log("[STORAGE]", area, changes);
});
```

### Message Tracing
```javascript
// In content script
const originalPostMessage = window.postMessage;
window.postMessage = function(...args) {
  console.log("[POSTMESSAGE]", args);
  return originalPostMessage.apply(this, args);
};
```

## Common Issues to Check

### 1. Private Key Exposure
**Search for:**
- `console.log(privateKey`
- `console.log(mnemonic`
- `console.log(seed`
- Serialized wallet state containing keys

**Check:**
- Background console logs
- Popup console logs
- Network requests (if keys sent over network)

### 2. localStorage Exposure
**Check:**
```javascript
// In web page console
const vault = localStorage.getItem("myVault");
console.log(JSON.parse(vault));
// Look for: privateKey, mnemonic, seed, etc.
```

### 3. Message Injection
**Test:**
```javascript
// From malicious website
window.postMessage({
  type: "VW_REQ",
  id: "attack-1",
  params: {
    method: "eth_sendTransaction",
    params: [{
      from: "0x...victim",
      to: "0x...attacker",
      value: "0x...all_funds"
    }]
  }
}, "*");
```

### 4. Origin Validation
**Check:**
- Injected script uses `"*"` origin in postMessage
- Content script should validate `event.source`
- Background should validate sender

## Serialized Wallet State

### Where to Find:
1. **localStorage**: `localStorage.getItem("myVault")`
2. **chrome.storage**: Background script storage
3. **Message payloads**: Check `VW_RES` messages
4. **SDK state**: Internal SDK storage

### What to Check:
- Private keys in plaintext
- Weak encryption
- Insecure serialization format
- Keys in error messages

## Network Monitoring

### Check Network Tab:
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for:
   - API calls to Verified Network
   - Keys sent over network
   - Unencrypted data

### RPC Calls:
- Check for keys in RPC request/response
- Monitor `eth_sendTransaction` calls
- Check signing operations

## SDK Debugging

### Enable SDK Logging:
```typescript
// In PoC
import { enableVerboseLogging } from './debug-utils';
const logger = enableVerboseLogging();
```

### Monitor SDK Operations:
```typescript
import { monitorObjectAccess } from './debug-utils';
const monitored = monitorObjectAccess(sdkInstance, 'SDK');
```

### Search for Sensitive Data:
```typescript
import { searchForSensitiveData } from './debug-utils';
const sensitive = searchForSensitiveData(logs);
```

## Attack Surface Checklist

- [ ] Origin validation in postMessage
- [ ] localStorage exposure
- [ ] Message ID collision
- [ ] Message structure validation
- [ ] Sender validation
- [ ] Private key in logs
- [ ] Private key in serialized state
- [ ] Private key in network requests
- [ ] Weak encryption
- [ ] Insecure key derivation
- [ ] Debug flags enabled in production
- [ ] Verbose logging in production

## Quick Test Script

```javascript
// Run in web page console
(async () => {
  console.log("=== Verified Wallet Debug Test ===");
  
  // 1. Check provider
  console.log("1. Provider:", window.verifiedwallet);
  console.log("2. Ethereum:", window.ethereum);
  
  // 2. Check localStorage
  const vault = localStorage.getItem("myVault");
  console.log("3. Vault:", vault ? JSON.parse(vault) : null);
  
  // 3. Test message
  try {
    const accounts = await window.verifiedwallet?.request({
      method: "eth_requestAccounts"
    });
    console.log("4. Accounts:", accounts);
  } catch (e) {
    console.error("4. Error:", e);
  }
  
  // 4. Monitor messages
  window.addEventListener("message", (e) => {
    if (e.data?.type === "VW_REQ" || e.data?.type === "VW_RES") {
      console.log("5. Message:", e.data);
    }
  });
  
  console.log("=== Test Complete ===");
})();
```

