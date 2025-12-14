export const defaultChainId = 8453;

export const defaultVerifiedUrl = "https://wallet.verified.network";

export const smsSenderUrl = "https://verified.azurewebsites.net/api/smssender";

export const getPasskeyEndpoint = "https://wallet.verified.network/get-passkey";

export const emailSenderUrl =
  "https://verified.azurewebsites.net/api/emailsender";

export const verifiedOtpEndpoint =
  "https://verified.azurewebsites.net/api/otpsender";

export const gatewayFunctionKey =
  "23o7dHkKdIMtjnft5q/J4mqpdBqqOOuajepmYqY0eAi9TaqQYsVSBA==";

export const firebaseConfig = {
  apiKey: "AIzaSyC9NftjURlBho082sU7jzkLfI25ChqOUrk",
  authDomain: "verified-custody.firebaseapp.com",
  projectId: "verified-custody",
  storageBucket: "verified-custody.firebasestorage.app",
  messagingSenderId: "575278027010",
  appId: "1:575278027010:web:efde7726d858a8b9ff721b",
  measurementId: "G-ZXVZTFJ5PN",
};

export const firebaseVapid =
  "BNkRzfJrlIYAtG5sKnpmi3uqEP3mJBKA_CGGk8tzkDbOF--n4-TpMO4n4m_X229yEfa8CLtCZ5oT65whfbcCNfc";

export const methodsToRequests = {
  connectWallet: "connectWallet",
  eth_requestAccounts: "eth_requestAccounts",
  invitation: "invitation",
  getAccount: "getAccounts",
  requestPk: "getPk",
  signRecovery: "signRecovery",
  completeRecovery: "completeRecovery",
  sendTransaction: "sendTransaction",
  eth_sendTransaction: "eth_sendTransaction",
  closePopup: "closePopup",

  //Dev Only ???
  pair_walletconnect_uri: "pair_walletconnect_uri",
};

export const walletConnectMethods = [
  "eth_sendRawTransaction",
  "eth_sign",
  "eth_signTransaction",
  "eth_signTypedData",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
];

export const projectId = "90b0e2ff886ba98147f2780659cf12a6";

export const rpcRequestMethods = [
  // ETH
  "eth_blockNumber",
  "eth_chainId",
  "eth_protocolVersion",
  "eth_syncing",
  "eth_coinbase",
  "eth_getBalance",
  "eth_getStorageAt",
  "eth_getTransactionCount",
  "eth_getCode",
  "eth_getProof",
  "eth_getBlockByHash",
  "eth_getBlockByNumber",
  "eth_getBlockTransactionCountByHash",
  "eth_getBlockTransactionCountByNumber",
  "eth_getUncleByBlockHashAndIndex",
  "eth_getUncleByBlockNumberAndIndex",
  "eth_getUncleCountByBlockHash",
  "eth_getUncleCountByBlockNumber",
  "eth_getTransactionByHash",
  "eth_getTransactionByBlockHashAndIndex",
  "eth_getTransactionByBlockNumberAndIndex",
  "eth_getTransactionReceipt",
  "eth_call",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
  "eth_newFilter",
  "eth_newBlockFilter",
  "eth_newPendingTransactionFilter",
  "eth_getFilterChanges",
  "eth_getFilterLogs",
  "eth_uninstallFilter",
  "eth_getLogs",
  "eth_sendRawTransaction",
  "eth_subscribe",
  "eth_unsubscribe",

  // Net
  "net_version",
  "net_listening",
  "net_peerCount",

  // Web3
  "web3_clientVersion",
  "web3_sha3",
];
