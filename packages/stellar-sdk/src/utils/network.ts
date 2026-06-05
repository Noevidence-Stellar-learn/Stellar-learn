import { Networks, Horizon } from '@stellar/stellar-sdk'

export type StellarNetwork = 'testnet' | 'mainnet'

export const NETWORK_CONFIG = {
  testnet: {
    networkPassphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  mainnet: {
    networkPassphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    friendbotUrl: null,
  },
} as const

export function getHorizonServer(network: StellarNetwork = 'testnet') {
  return new Horizon.Server(NETWORK_CONFIG[network].horizonUrl)
}

export function getNetworkPassphrase(network: StellarNetwork = 'testnet') {
  return NETWORK_CONFIG[network].networkPassphrase
}

export function getActiveNetwork(): StellarNetwork {
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK
  return env === 'mainnet' ? 'mainnet' : 'testnet'
}
