import React, { useContext, useEffect, useState } from 'react'
import './Coin.css'
import { useParams } from 'react-router-dom'
import { CoinContext } from '../../context/CoinContext'
import LineChart from '../../components/LineChart/LineChart'

const Coin = () => {
  const {coinId} = useParams()
  const [coinData, setCoinData] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {currency} = useContext(CoinContext)

  const fetchCoinData = async () => {
    console.log('🔍 Fetching coin data for ID:', coinId)
    
    try {
      const url = `https://api.coinlore.net/api/ticker/?id=${coinId}`
      console.log('📡 Fetching from:', url)
      
      const res = await fetch(url)
      console.log('📊 Response status:', res.status)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      console.log('✅ Coin data received:', data)
      
      if (data && data.length > 0) {
        const coin = data[0]
        console.log('💰 Coin info:', coin.name, coin.symbol)
        setCoinData(coin)
        
        // Create mock chart data since Coinlore doesn't provide historical data
        createMockChartData(coin)
      } else {
        throw new Error('No coin data found')
      }
      
    } catch (err) {
      console.error('💥 Error fetching coin data:', err)
      setError(err.message)
    }
  }

  const createMockChartData = (coin) => {
    console.log('📈 Creating mock chart data for:', coin.name)
    
    // Create mock historical data based on current price and recent changes
    const currentPrice = parseFloat(coin.price_usd)
    const change24h = parseFloat(coin.percent_change_24h) || 0
    const change7d = parseFloat(coin.percent_change_7d) || 0
    
    const mockPrices = []
    const now = Date.now()
    
    // Generate 10 days of mock data
    for (let i = 9; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000)
      
      // Calculate mock price with some variation
      let mockPrice = currentPrice
      if (i === 0) {
        mockPrice = currentPrice // Today's price
      } else if (i === 1) {
        // Yesterday's price based on 24h change
        mockPrice = currentPrice / (1 + change24h / 100)
      } else if (i === 7) {
        // 7 days ago price based on 7d change
        mockPrice = currentPrice / (1 + change7d / 100)
      } else {
        // Interpolate or add some random variation
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        mockPrice = currentPrice * (1 + variation)
      }
      
      mockPrices.push([timestamp, mockPrice])
    }
    
    const mockChartData = {
      prices: mockPrices,
      market_caps: mockPrices.map(([timestamp, price]) => [timestamp, price * parseFloat(coin.csupply || 0)]),
      total_volumes: mockPrices.map(([timestamp, price]) => [timestamp, parseFloat(coin.volume24 || 0)])
    }
    
    console.log('📊 Mock chart data created:', mockChartData.prices.length, 'data points')
    setChartData(mockChartData)
  }

  const convertPrice = (usdPrice) => {
    const price = parseFloat(usdPrice)
    
    switch (currency.name) {
      case 'eur':
        return (price * 0.85).toFixed(2) // Rough USD to EUR conversion
      case 'inr':
        return (price * 83).toFixed(2) // Rough USD to INR conversion
      default:
        return price.toFixed(2)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 Starting data fetch for coinId:', coinId)
      
      setLoading(true)
      setError(null)
      setCoinData(null)
      setChartData(null)
      
      if (!coinId) {
        console.error('❌ No coinId provided')
        setError('No coin ID provided')
        setLoading(false)
        return
      }
      
      await fetchCoinData()
      setLoading(false)
    }

    fetchData()
  }, [coinId, currency.name])

  console.log('🖥️ Render state:', { 
    loading, 
    hasCoinData: !!coinData, 
    hasChartData: !!chartData, 
    error 
  })

  if (error) {
    return (
      <div className="error">
        <h2>❌ Error loading coin data</h2>
        <p><strong>Error:</strong> {error}</p>
        <button onClick={() => window.location.reload()} style={{marginTop: '10px', padding: '10px 20px'}}>
          🔄 Retry
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="spinner">
        <div className="spin"></div>
        <p>Loading coin data...</p>
      </div>
    )
  }

  if (!coinData) {
    return (
      <div className="error">
        <p>❌ No coin data available</p>
        <button onClick={() => window.location.reload()}>🔄 Retry</button>
      </div>
    )
  }

  return (
    <div className='coin'>
      <div className="coin-name">
        <img 
          src={`https://coinicons-api.vercel.app/api/icon/${coinData.symbol.toLowerCase()}`} 
          alt={coinData.name}
          onError={(e) => {
            // Try alternative icon sources
            if (e.target.src.includes('coinicons-api')) {
              e.target.src = `https://assets.coincap.io/assets/icons/${coinData.symbol.toLowerCase()}@2x.png`
            } else if (e.target.src.includes('coincap')) {
              e.target.src = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinData.id}.png`
            } else {
              // Final fallback to a generic crypto icon
              e.target.src = 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/32/color/generic.png'
            }
          }}
          style={{width: '80px', height: '80px', objectFit: 'contain'}}
        />
        <p><b>{coinData.name} ({coinData.symbol.toUpperCase()})</b></p>
      </div>
      
      {chartData && (
        <div className="coin-chart">
          <LineChart historicalData={chartData} />
          <p style={{fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px'}}>
            * Chart shows simulated historical data based on current price trends
          </p>
        </div>
      )}
      
      <div className="coin-info">
        <ul>
          <li>Crypto Market Rank</li>
          <li>{coinData.rank}</li>
        </ul>
        <ul>
          <li>Current Price</li>
          <li>{currency.symbol} {convertPrice(coinData.price_usd)}</li>
        </ul>
        <ul>
          <li>Market Cap</li>
          <li>{currency.symbol} {parseFloat(coinData.market_cap_usd).toLocaleString()}</li>
        </ul>
        <ul>
          <li>24 Hour Change</li>
          <li style={{color: parseFloat(coinData.percent_change_24h) >= 0 ? 'green' : 'red'}}>
            {coinData.percent_change_24h}%
          </li>
        </ul>
        <ul>
          <li>7 Day Change</li>
          <li style={{color: parseFloat(coinData.percent_change_7d) >= 0 ? 'green' : 'red'}}>
            {coinData.percent_change_7d}%
          </li>
        </ul>
        <ul>
          <li>24 Hour Volume</li>
          <li>{currency.symbol} {parseFloat(coinData.volume24).toLocaleString()}</li>
        </ul>
        <ul>
          <li>Circulating Supply</li>
          <li>{parseFloat(coinData.csupply).toLocaleString()} {coinData.symbol}</li>
        </ul>
      </div>
    </div>
  )
}

export default Coin