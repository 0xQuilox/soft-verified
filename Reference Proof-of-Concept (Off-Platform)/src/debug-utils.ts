/**
 * Debug Utilities
 * 
 * Tools for aggressive debugging and logging
 */

/**
 * Enable verbose logging for SDK operations
 */
export function enableVerboseLogging() {
  // Override console methods to capture all logs
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalDebug = console.debug;
  
  const logs: Array<{ level: string; message: any; timestamp: Date }> = [];
  
  console.log = (...args: any[]) => {
    logs.push({ level: 'log', message: args, timestamp: new Date() });
    originalLog('[LOG]', ...args);
  };
  
  console.warn = (...args: any[]) => {
    logs.push({ level: 'warn', message: args, timestamp: new Date() });
    originalWarn('[WARN]', ...args);
  };
  
  console.error = (...args: any[]) => {
    logs.push({ level: 'error', message: args, timestamp: new Date() });
    originalError('[ERROR]', ...args);
  };
  
  console.debug = (...args: any[]) => {
    logs.push({ level: 'debug', message: args, timestamp: new Date() });
    originalDebug('[DEBUG]', ...args);
  };
  
  return {
    getLogs: () => logs,
    clearLogs: () => logs.length = 0,
    searchLogs: (pattern: string) => {
      return logs.filter(log => 
        JSON.stringify(log.message).includes(pattern)
      );
    }
  };
}

/**
 * Search for sensitive data in logs
 */
export function searchForSensitiveData(logs: Array<{ level: string; message: any }>) {
  const sensitivePatterns = [
    /privateKey/i,
    /private_key/i,
    /mnemonic/i,
    /seed/i,
    /secret/i,
    /password/i,
    /0x[a-fA-F0-9]{64}/, // Private key pattern
    /[a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+ [a-z]+/i, // Mnemonic pattern
  ];
  
  const found: Array<{ pattern: string; log: any }> = [];
  
  for (const log of logs) {
    const logStr = JSON.stringify(log.message);
    for (const pattern of sensitivePatterns) {
      if (pattern.test(logStr)) {
        found.push({ pattern: pattern.toString(), log });
      }
    }
  }
  
  return found;
}

/**
 * Monitor object property access
 */
export function monitorObjectAccess<T extends object>(obj: T, name: string): T {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      console.log(`[MONITOR] Accessing ${name}.${String(prop)}`);
      const value = Reflect.get(target, prop, receiver);
      
      // Check if accessing sensitive properties
      const sensitiveProps = ['privateKey', 'private_key', 'mnemonic', 'seed', 'secret'];
      if (sensitiveProps.includes(String(prop))) {
        console.warn(`⚠️  [SECURITY] Accessing sensitive property: ${name}.${String(prop)}`);
        console.warn(`⚠️  Value type: ${typeof value}`);
        if (typeof value === 'string') {
          console.warn(`⚠️  Value length: ${value.length}`);
          console.warn(`⚠️  Value preview: ${value.substring(0, 20)}...`);
        }
      }
      
      return value;
    },
    set(target, prop, value, receiver) {
      console.log(`[MONITOR] Setting ${name}.${String(prop)}`);
      
      // Check if setting sensitive properties
      const sensitiveProps = ['privateKey', 'private_key', 'mnemonic', 'seed', 'secret'];
      if (sensitiveProps.includes(String(prop))) {
        console.warn(`⚠️  [SECURITY] Setting sensitive property: ${name}.${String(prop)}`);
        console.warn(`⚠️  Value type: ${typeof value}`);
        if (typeof value === 'string') {
          console.warn(`⚠️  Value length: ${value.length}`);
        }
      }
      
      return Reflect.set(target, prop, value, receiver);
    }
  });
}

/**
 * Capture serialized wallet state
 */
export function captureSerializedState(data: any, label: string = 'State') {
  console.log(`\n=== Capturing Serialized ${label} ===`);
  console.log('Type:', typeof data);
  console.log('Is Array:', Array.isArray(data));
  console.log('Is Object:', typeof data === 'object' && data !== null);
  
  if (typeof data === 'string') {
    console.log('Length:', data.length);
    console.log('Preview:', data.substring(0, 200));
    
    // Check for base64 encoding
    if (/^[A-Za-z0-9+/=]+$/.test(data)) {
      console.log('⚠️  Appears to be base64 encoded');
    }
    
    // Check for JSON
    try {
      const parsed = JSON.parse(data);
      console.log('✓ Valid JSON');
      console.log('Parsed keys:', Object.keys(parsed));
      
      // Search for sensitive keys
      const sensitiveKeys = ['privateKey', 'private_key', 'mnemonic', 'seed', 'secret'];
      for (const key of sensitiveKeys) {
        if (key in parsed) {
          console.error(`❌ [CRITICAL] Found sensitive key in serialized data: ${key}`);
        }
      }
    } catch (e) {
      // Not JSON
    }
  } else {
    console.log('Serialized:', JSON.stringify(data, null, 2));
    
    // Search for sensitive keys
    const dataStr = JSON.stringify(data);
    const sensitiveKeys = ['privateKey', 'private_key', 'mnemonic', 'seed', 'secret'];
    for (const key of sensitiveKeys) {
      if (dataStr.includes(key)) {
        console.error(`❌ [CRITICAL] Found sensitive key in serialized data: ${key}`);
      }
    }
  }
  
  console.log('=== End Capture ===\n');
}

/**
 * Test debug flag detection
 */
export function testDebugFlags() {
  console.log('\n=== Testing Debug Flags ===\n');
  
  // Check for common debug flags
  const debugFlags = [
    'DEBUG',
    'NODE_ENV',
    'VERBOSE',
    'LOG_LEVEL',
    'ENABLE_LOGGING'
  ];
  
  for (const flag of debugFlags) {
    const value = process.env[flag];
    if (value) {
      console.log(`✓ Found debug flag: ${flag}=${value}`);
    }
  }
  
  // Check for development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Running in development mode - may expose more information');
  }
}

