# Verified Wallet Security Testing POC - Quick Start Guide

## Overview

This Proof of Concept (POC) tests the security of the Verified Wallet browser extension, specifically focusing on:

1. **Key Management and Recovery Logic**
2. **Transaction Signing and Broadcasting Mechanisms**

## Files

- `key-management-poc.html` - Main testing interface with comprehensive test suite
- `SECURITY_ANALYSIS.md` - Detailed security analysis report
- `exploit.html` - Simple exploit demonstration (original file)

## Quick Start

### 1. Prerequisites

- Chrome/Edge browser with Verified Wallet extension installed
- Basic understanding of browser security concepts

### 2. Running the POC

1. **Open the POC file**:
   ```bash
   # Open key-management-poc.html in your browser
   # Or serve it via a local web server:
   python -m http.server 8000
   # Then navigate to http://localhost:8000/key-management-poc.html
   ```

2. **Verify Extension is Installed**:
   - The POC will automatically detect if the extension is available
   - If not detected, install the Verified Wallet extension first

3. **Run Tests**:
   - Click individual test buttons to test specific functionality
   - Or click "Run All Tests" for comprehensive testing

### 3. Understanding Test Results

#### Color Coding
- **Green (Success)**: Test completed successfully
- **Yellow (Warning)**: Potential security issue detected
- **Red (Error)**: Critical vulnerability or test failure
- **Blue (Info)**: Informational message

#### Key Indicators
- 🚨 **CRITICAL**: Severe security vulnerability
- ⚠️ **WARNING**: Security concern that needs attention
- ✅ **SUCCESS**: Test passed (no issues found)
- ❌ **FAILED**: Test failed or request rejected

## Test Categories

### 1. Key Management & Recovery Tests

#### Test 1.1: Request Private Key (getPk)
- **Purpose**: Tests if private keys can be requested via the API
- **What to Look For**:
  - Does the popup appear?
  - Is the private key exposed in the response?
  - Can the request be made without user interaction?

#### Test 1.2: Sign Recovery Transaction
- **Purpose**: Tests the recovery signing mechanism
- **What to Look For**:
  - Can recovery transactions be manipulated?
  - Is proper authentication required?
  - Can unauthorized recovery be initiated?

#### Test 1.3: Complete Recovery
- **Purpose**: Tests the recovery completion flow
- **What to Look For**:
  - Can recovery be completed without proper authorization?
  - Are security checks bypassed?
  - Is wallet takeover possible?

#### Test 1.4: localStorage Exposure
- **Purpose**: Checks if sensitive data is stored in localStorage
- **What to Look For**:
  - Are private keys or mnemonics stored?
  - Is wallet data accessible from web pages?
  - Is data encrypted?

### 2. Transaction Signing & Broadcasting Tests

#### Test 2.1: Send Transaction (eth_sendTransaction)
- **Purpose**: Tests standard transaction sending
- **What to Look For**:
  - Does popup confirmation appear?
  - Are transaction parameters validated?
  - Can transactions be sent without confirmation?

#### Test 2.2: Silent Transaction Test
- **Purpose**: Attempts to bypass user confirmation
- **What to Look For**:
  - Can transactions be sent without popup?
  - Are there race conditions?
  - Can confirmation be bypassed?

#### Test 2.3: Message Flow Monitoring
- **Purpose**: Monitors all postMessage events
- **What to Look For**:
  - What messages are being sent?
  - Are messages properly authenticated?
  - Can messages be intercepted?

#### Test 2.4: Origin Validation
- **Purpose**: Tests if message origins are validated
- **What to Look For**:
  - Does extension accept messages from any origin?
  - Can origin be spoofed?
  - Is wildcard origin used?

## Interpreting Results

### Critical Vulnerabilities

If you see **🚨 CRITICAL** warnings:

1. **localStorage Key Exposure**:
   - Private keys or mnemonics found in localStorage
   - **Impact**: Any website can read wallet data
   - **Action**: Report immediately

2. **Silent Transaction Success**:
   - Transactions sent without user confirmation
   - **Impact**: Funds can be stolen
   - **Action**: Report immediately

3. **Origin Validation Failure**:
   - Extension accepts messages from untrusted origins
   - **Impact**: Malicious websites can control wallet
   - **Action**: Report immediately

### Warning Signs

If you see **⚠️ WARNING** messages:

1. **Recovery Flow Issues**:
   - Recovery can be manipulated
   - **Impact**: Potential wallet takeover
   - **Action**: Review recovery implementation

2. **Message Authentication Missing**:
   - Messages not cryptographically signed
   - **Impact**: Messages can be tampered with
   - **Action**: Implement message authentication

## Browser Console

### Accessing Console

1. **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

### What to Monitor

- **Message Logs**: All `[POC]` prefixed logs show test activity
- **Extension Messages**: Look for `VW_REQ` and `VW_RES` messages
- **Errors**: Any JavaScript errors or failed requests

### Useful Console Commands

```javascript
// Check if extension is available
console.log(window.verifiedwallet);

// Check localStorage
console.log(localStorage.getItem("myVault"));

// Monitor all messages
window.addEventListener("message", (e) => {
    console.log("Message:", e.data);
});

// Check extension storage (requires extension context)
chrome.storage.local.get(null, (data) => {
    console.log("Extension storage:", data);
});
```

## Extension DevTools

### Background Script Console

1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Find "Verified Wallet"
4. Click "Service Worker" or "background page"
5. View console logs

### Popup DevTools

1. Right-click extension icon
2. Select "Inspect popup"
3. View popup console and network activity

## Common Issues

### Extension Not Detected

**Problem**: POC shows "Extension not detected"

**Solutions**:
1. Verify extension is installed and enabled
2. Refresh the POC page
3. Check browser console for errors
4. Try restarting the browser

### Tests Not Working

**Problem**: Tests fail or timeout

**Solutions**:
1. Check browser console for errors
2. Verify extension is responding
3. Check if popups are blocked
4. Try running tests individually

### No Results Displayed

**Problem**: Test runs but no results shown

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify HTML file is loaded correctly
3. Try refreshing the page
4. Check browser compatibility

## Security Best Practices

### When Testing

1. **Use Test Networks**: Only test on testnets (Sepolia, Base Sepolia)
2. **Use Test Accounts**: Never use accounts with real funds
3. **Isolated Environment**: Test in a separate browser profile
4. **Document Findings**: Keep detailed notes of all findings

### Reporting Issues

1. **Document Steps**: Provide clear reproduction steps
2. **Include Evidence**: Screenshots, console logs, network traffic
3. **Assess Impact**: Describe potential impact of vulnerabilities
4. **Suggest Fixes**: Provide remediation recommendations

## Advanced Testing

### Manual Testing

You can manually test using browser console:

```javascript
// Test requestPk
window.postMessage({
    type: "VW_REQ",
    id: "test-1",
    params: {
        method: "requestPk",
        params: [{ chainId: "8453", vaultData: {} }]
    }
}, "*");

// Test eth_sendTransaction
window.postMessage({
    type: "VW_REQ",
    id: "test-2",
    params: {
        method: "eth_sendTransaction",
        params: [{
            to: "0x000000000000000000000000000000000000dEaD",
            value: "0x1"
        }]
    }
}, "*");
```

### Network Analysis

1. Open DevTools → Network tab
2. Filter for "fetch" or "xhr"
3. Monitor RPC calls to blockchain nodes
4. Check for unencrypted data transmission

### Storage Analysis

1. Open DevTools → Application tab
2. Check Local Storage for `myVault`
3. Check Extension Storage (if accessible)
4. Look for unencrypted sensitive data

## Troubleshooting

### Extension Crashes

- Check background script console for errors
- Verify extension permissions
- Try reloading the extension

### Popup Not Appearing

- Check if popups are blocked
- Verify extension has popup permission
- Check background script logs

### Messages Not Received

- Verify message format is correct
- Check origin validation
- Monitor content script console

## Additional Resources

- **Security Analysis**: See `SECURITY_ANALYSIS.md` for detailed findings
- **Extension Code**: Review source files in `scripts/` directory
- **Constants**: Check `utils/constants.js` for method definitions

## Support

For issues or questions:
1. Check browser console for errors
2. Review `SECURITY_ANALYSIS.md` for context
3. Examine extension source code
4. Test in isolated environment

## Disclaimer

This POC is for **security testing purposes only**. Use responsibly and only on test networks with test accounts. Do not use on production wallets or with real funds.

