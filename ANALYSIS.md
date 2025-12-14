# Verified Wallet Extension - Security Analysis

## 1. Architecture Overview

### Component Identification

#### A. Background.js / Service Worker
- **Location**: `scripts/background.js`
- **Type**: Service Worker (Manifest V3)
- **Key Functions**:
  - Main message handler: `chrome.runtime.onMessage.addListener` (line 5386)
  - Handles `VW_REQ` message types
  - Manages vault data reception with multiple listeners
  - Processes wallet operations and SDK interactions

#### B. Content Scripts
- **Location**: `scripts/content.js`
- **Injection**: Runs at `document_start` on all URLs (`<all_urls>`)
- **Key Functions**:
  - Listens for `postMessage` from injected script
  - Forwards messages to background via `chrome.runtime.sendMessage`
  - Acts as bridge between web page and extension

#### C. Injected Script
- **Location**: `scripts/injected.js`
- **Injection**: Injected into web page context via `web_accessible_resources`
- **Key Functions**:
  - Creates `window.verifiedwallet` provider
  - Creates `VerifiedEthereumProvider` class
  - Implements EIP-6963 provider announcement
  - Uses `postMessage` to communicate with content script
  - Stores wallet state in `localStorage` (`myVault` key)

#### D. Popup / UI
- **Location**: `pages/Popup/index.js`, `components/popup.js`
- **Key Functions**:
  - React-based UI components
  - Success/Error popup components
  - Sends messages via `chrome.runtime.sendMessage`

### Message Passing Architecture

```
Web Page
  ↓ (postMessage with type: "VW_REQ")
Injected Script (window.verifiedwallet)
  ↓ (postMessage)
Content Script (scripts/content.js)
  ↓ (chrome.runtime.sendMessage)
Background / Service Worker (scripts/background.js)
  ↓
Verified Custody SDK (@verified-network/verified-custody)
  ↓
Key Storage / Signing Logic
```

#### Message Types:
- **VW_REQ**: Request from web page/injected script
- **VW_RES**: Response back to web page/injected script

#### Message Flow Example:
1. Web page calls `window.verifiedwallet.request({ method: "eth_requestAccounts" })`
2. Injected script creates message with `type: "VW_REQ"` and `id: <random>`
3. Injected script posts message to window: `window.postMessage({ type: "VW_REQ", id, params }, "*")`
4. Content script listens for `message` events, forwards to background
5. Background processes request, interacts with SDK
6. Response sent back through same chain

## 2. Trust Boundaries Map

### Critical Attack Surfaces

#### Boundary 1: Web Page → Injected Script
- **Mechanism**: `postMessage` with `"*"` origin (NO ORIGIN VALIDATION)
- **Risk**: Any website can send messages
- **Location**: `scripts/injected.js` line 2322-2325
```javascript
this.windowObj.postMessage(
  { type: "VW_REQ", id: messageId, params },
  "*"  // ⚠️ NO ORIGIN CHECK
);
```

#### Boundary 2: Injected Script → Content Script
- **Mechanism**: `postMessage` from window
- **Risk**: Content script must validate source
- **Location**: `scripts/content.js` - needs verification

#### Boundary 3: Content Script → Background
- **Mechanism**: `chrome.runtime.sendMessage`
- **Risk**: Extension context, but needs validation
- **Location**: `scripts/content.js` line 22773+

#### Boundary 4: Background → SDK
- **Mechanism**: Direct SDK calls
- **Risk**: SDK implementation vulnerabilities
- **Location**: `scripts/background.js` - SDK integration points

#### Boundary 5: Storage Access
- **Mechanism**: `localStorage` in injected script context
- **Risk**: Web page can access `localStorage.getItem("myVault")`
- **Location**: `scripts/injected.js` line 2306-2309, 2343-2344
```javascript
localStorage.setItem("myVault", JSON.stringify(event.data.params.data[0]));
```

### Key Storage Locations

1. **localStorage** (`myVault` key):
   - Accessible from web page context
   - Contains wallet address, chainId, potentially sensitive data
   - Location: Injected script context

2. **chrome.storage**:
   - Extension storage (background context)
   - Needs investigation for private key storage

3. **SDK Internal Storage**:
   - Verified Custody SDK may store keys
   - Requires SDK analysis

## 3. Debugging & Logging Points

### Console Logs Found

#### Background Script:
- Line 2357: `console.error("base64Decode failed: ", e)`
- Line 3533: `console.warn(e)`

#### Content Script:
- Line 3831: `console.log(msg)`
- Line 3841: `console.log("Generated random input...")`
- Line 3848: `console.log("Hashed in...")`
- Line 22867: `console.error("Failed to load account from storage:", e2)`
- Line 22842: `console.error("Error While Processing Session Proposal:", err)`
- Line 22960: `console.error("Error While Processing Session Request:", err)`

#### Injected Script:
- Line 2352: `console.warn("[Verified Wallet] Failed to load account from storage:", err)`
- Line 2415: `console.warn("[Verified Wallet] Failed to load account from storage:", err)`

### Debug Flags to Enable

1. **Extension Background Console**:
   - Open: `chrome://extensions` → Developer mode → Service Worker
   - Look for: SDK initialization, message handling, storage operations

2. **Popup DevTools**:
   - Right-click popup → Inspect
   - Look for: React component state, message passing

3. **Web Page Console**:
   - Regular browser DevTools
   - Look for: `window.verifiedwallet`, `window.ethereum`, localStorage access

### Potential Security Issues

1. **No Origin Validation**: `postMessage` uses `"*"` origin
2. **localStorage Exposure**: Wallet data in web-accessible storage
3. **Message ID Collision**: Random ID generation may collide
4. **No Message Validation**: Content script may not validate message structure
5. **SDK Version**: Using `@verified-network/verified-custody@^0.4.8` - check for known vulnerabilities

## 4. SDK Integration Points

### Verified Custody SDK Usage
- **Package**: `@verified-network/verified-custody@^0.4.8`
- **Location**: Background script (needs deeper analysis)
- **Key Operations**:
  - Wallet creation
  - Transaction signing
  - Key management

### Required for PoC
- Install SDK: `npm install @verified-network/verified-custody`
- Reproduce wallet operations outside browser
- Test key storage/retrieval mechanisms
- Validate cryptographic operations

## 5. Next Steps

1. **Create Node/TypeScript PoC**:
   - Set up project with SDK
   - Reproduce wallet operations
   - Test key storage mechanisms

2. **Deep Dive Analysis**:
   - Trace message flow end-to-end
   - Identify all storage locations
   - Map SDK API usage

3. **Security Testing**:
   - Test origin validation bypass
   - Test localStorage manipulation
   - Test message injection
   - Test SDK vulnerabilities

