const featureFlags = {
  dashboard: true,
  deposit: false,
  withdrawal: false,
  transfers: false,
  history: false,
  trade: false,
  verification: true,
  tokenCreation: false,
  issuanceCreation: false,
  saleCreation: false,
  preIssuanceUpload: false,
  settings: true,
  tfa: false,
  tokens: false,
  sales: false,
  requests: true,
  massTransfers: false,
  artCreation: true,
  arts: true
}

export default Object.assign(
  {
    HIDDEN_ARTS: ['aaa', 'MNLS'],
    AIRDROP_REGISTRATION_END: new Date('2018-02-25T12:00:00'),
    HORIZON_SERVER: '',
    FILE_STORAGE: '',
    NETWORK_PASSPHRASE: '',
    TRANSACTIONS_PER_PAGE: 12,
    REQUESTS_PER_PAGE: 10,
    DECIMAL_POINTS: 6,
    MINIMAL_NUMBER_INPUT_STEP: 0.000001,
    VALIDATE_EMAILS: process.env.NODE_ENV === 'production',
    FEATURE_FLAGS: featureFlags,
    NULL_ASSET_SIGNER: 'GAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHV4',
    LOCAL_STORAGE_KEY: 'tokend-client',
    DEFAULT_QUOTE_ASSET: 'USD',
    DEFAULT_TRADE_PAIRS_RE: [
            // Descending priority
      /BTC.*\/.*ETH/,
      /ETH.*\/.*BTC/
    ]
  },
    process.env,
    document.ENV
)
