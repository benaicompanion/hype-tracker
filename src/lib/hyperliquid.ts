const API_URL = 'https://api.hyperliquid.xyz/info'
const EVM_RPC = 'https://rpc.hyperliquid.xyz/evm'
const HWYHPE_CONTRACT = '0x0D745EAA9E70bb8B6e2a0317f85F1d536616bD34'
const DEFAULT_ADDRESS = '0x43112BfFEB174D3EE9117060E1F8D38F30d245A3'

// ERC20 balanceOf(address) selector
const BALANCE_OF_SELECTOR = '0x70a08231'

export interface BalanceBreakdown {
  spotHype: number
  hyperLendHype: number
  evmNativeHype: number
  perpValueUsd: number
  totalHype: number
  totalUsd: number
  totalBtc: number
  hypePrice: number
  btcPrice: number
}

async function postInfo(body: Record<string, string>): Promise<unknown> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Hyperliquid API error: ${res.status}`)
  return res.json()
}

async function evmRpcCall(method: string, params: unknown[]): Promise<string> {
  const res = await fetch(EVM_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`EVM RPC error: ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(`EVM RPC error: ${data.error.message}`)
  return data.result
}

export async function getSpotHype(address: string = DEFAULT_ADDRESS): Promise<number> {
  try {
    const data = await postInfo({ type: 'spotClearinghouseState', user: address }) as {
      balances: Array<{ coin: string; total: string }>
    }
    const hypeBalance = data.balances?.find((b) => b.coin === 'HYPE')
    return hypeBalance ? parseFloat(hypeBalance.total) : 0
  } catch (e) {
    console.error('Error fetching spot HYPE:', e)
    return 0
  }
}

export async function getPerpAccountValue(address: string = DEFAULT_ADDRESS): Promise<number> {
  try {
    const data = await postInfo({ type: 'clearinghouseState', user: address }) as {
      marginSummary: { accountValue: string }
    }
    return parseFloat(data.marginSummary?.accountValue || '0')
  } catch (e) {
    console.error('Error fetching perp value:', e)
    return 0
  }
}

export async function getHyperLendBalance(address: string = DEFAULT_ADDRESS): Promise<number> {
  try {
    // Encode balanceOf(address) call
    const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0')
    const callData = BALANCE_OF_SELECTOR + paddedAddress

    const result = await evmRpcCall('eth_call', [
      { to: HWYHPE_CONTRACT, data: callData },
      'latest',
    ])

    // Result is hex, convert from 18 decimals
    const balanceWei = BigInt(result)
    return Number(balanceWei) / 1e18
  } catch (e) {
    console.error('Error fetching HyperLend balance:', e)
    return 0
  }
}

export async function getEvmNativeBalance(address: string = DEFAULT_ADDRESS): Promise<number> {
  try {
    const result = await evmRpcCall('eth_getBalance', [address, 'latest'])
    const balanceWei = BigInt(result)
    return Number(balanceWei) / 1e18
  } catch (e) {
    console.error('Error fetching EVM native balance:', e)
    return 0
  }
}

export async function getPrices(): Promise<{ hype: number; btc: number }> {
  try {
    const data = await postInfo({ type: 'allMids' }) as Record<string, string>
    return {
      hype: parseFloat(data['HYPE'] || '0'),
      btc: parseFloat(data['BTC'] || '0'),
    }
  } catch (e) {
    console.error('Error fetching prices:', e)
    return { hype: 0, btc: 0 }
  }
}

export async function getFullBalance(address: string = DEFAULT_ADDRESS): Promise<BalanceBreakdown> {
  const [spotHype, perpValueUsd, hyperLendHype, evmNativeHype, prices] = await Promise.all([
    getSpotHype(address),
    getPerpAccountValue(address),
    getHyperLendBalance(address),
    getEvmNativeBalance(address),
    getPrices(),
  ])

  const totalHype = spotHype + hyperLendHype + evmNativeHype
  const totalUsd = totalHype * prices.hype + perpValueUsd
  const totalBtc = prices.btc > 0 ? totalUsd / prices.btc : 0

  return {
    spotHype,
    hyperLendHype,
    evmNativeHype,
    perpValueUsd,
    totalHype,
    totalUsd,
    totalBtc,
    hypePrice: prices.hype,
    btcPrice: prices.btc,
  }
}
