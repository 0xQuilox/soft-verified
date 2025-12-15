/**
 * Message Flow Reproduction
 * 
 * Reproduces the message passing flow from the extension:
 * Web Page → Injected Script → Content Script → Background → SDK
 */

/**
 * Represents a VW_REQ message (from extension)
 */
interface VWRequest {
  type: 'VW_REQ';
  id: string;
  params: {
    method: string;
    params?: any[];
  };
}

/**
 * Represents a VW_RES message (from extension)
 */
interface VWResponse {
  type: 'VW_RES';
  id: string;
  params: {
    success: boolean;
    response?: any;
    data?: any[];
    error?: any;
    saveToStorage?: boolean;
  };
}

/**
 * Simulates the message flow to identify vulnerabilities
 */
export class MessageFlowSimulator {
  private messageHandlers: Map<string, (req: VWRequest) => Promise<VWResponse>> = new Map();
  
  constructor() {
    this.setupHandlers();
  }
  
  /**
   * Setup message handlers for different methods
   */
  private setupHandlers() {
    // eth_requestAccounts
    this.messageHandlers.set('eth_requestAccounts', async (req) => {
      console.log('[Background] Handling eth_requestAccounts');
      // Simulate SDK call
      return {
        type: 'VW_RES',
        id: req.id,
        params: {
          success: true,
          response: true,
          data: ['0x1234567890123456789012345678901234567890'],
          saveToStorage: true
        }
      };
    });
    
    // eth_sendTransaction
    this.messageHandlers.set('eth_sendTransaction', async (req) => {
      console.log('[Background] Handling eth_sendTransaction');
      // Simulate signing operation
      return {
        type: 'VW_RES',
        id: req.id,
        params: {
          success: true,
          response: true,
          data: ['0x...signed_tx_hash']
        }
      };
    });
    
    // eth_sign
    this.messageHandlers.set('eth_sign', async (req) => {
      console.log('[Background] Handling eth_sign');
      // Simulate signing
      return {
        type: 'VW_RES',
        id: req.id,
        params: {
          success: true,
          response: true,
          data: ['0x...signature']
        }
      };
    });
  }
  
  /**
   * Simulate receiving a message from content script
   */
  async handleMessage(req: VWRequest): Promise<VWResponse> {
    console.log(`[Background] Received message: ${req.type} id: ${req.id} method: ${req.params.method}`);
    
    const handler = this.messageHandlers.get(req.params.method);
    if (!handler) {
      return {
        type: 'VW_RES',
        id: req.id,
        params: {
          success: false,
          error: { message: 'Method not found' }
        }
      };
    }
    
    return await handler(req);
  }
  
  /**
   * Test message injection attacks
   */
  async testMessageInjection() {
    console.log('\n=== Testing Message Injection ===\n');
    
    // Test 1: Malformed message
    console.log('Test 1: Malformed message');
    try {
      await this.handleMessage({
        type: 'VW_REQ',
        id: 'test-1',
        params: { method: null as any }
      });
    } catch (error) {
      console.log('✓ Caught error:', error);
    }
    
    // Test 2: Missing ID
    console.log('\nTest 2: Missing ID');
    try {
      await this.handleMessage({
        type: 'VW_REQ',
        id: '',
        params: { method: 'eth_requestAccounts' }
      });
    } catch (error) {
      console.log('✓ Caught error:', error);
    }
    
    // Test 3: Origin spoofing (simulated)
    console.log('\nTest 3: Origin validation');
    console.log('⚠️  Extension uses "*" origin in postMessage - no validation!');
    
    // Test 4: Message ID collision
    console.log('\nTest 4: Message ID collision');
    const id1 = Math.random().toString(36).substring(2);
    const id2 = Math.random().toString(36).substring(2);
    console.log(`ID 1: ${id1}`);
    console.log(`ID 2: ${id2}`);
    console.log(`Collision risk: ${id1 === id2 ? 'HIGH' : 'LOW'}`);
  }
}

/**
 * Test localStorage exposure
 */
export function testLocalStorageExposure() {
  console.log('\n=== Testing localStorage Exposure ===\n');
  
  // Simulate the extension's localStorage usage
  const mockVault = {
    address: '0x1234567890123456789012345678901234567890',
    regAddress: '0x1234567890123456789012345678901234567890',
    chainId: '8453',
    // Check if private keys are stored here
    privateKey: undefined, // This should NOT exist
    mnemonic: undefined,   // This should NOT exist
  };
  
  console.log('Mock vault data:', JSON.stringify(mockVault, null, 2));
  console.log('⚠️  This data is accessible from web page context!');
  console.log('⚠️  Any website can read: localStorage.getItem("myVault")');
}

if (require.main === module) {
  const simulator = new MessageFlowSimulator();
  simulator.testMessageInjection().catch(console.error);
  testLocalStorageExposure();
}

