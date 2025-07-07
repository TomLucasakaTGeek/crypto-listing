import React, { useContext, useEffect, useState } from 'react'
import './Coin.css'
import { useParams } from 'react-router-dom'
import { CoinContext } from '../../context/CoinContext'
import LineChart from '../../components/LineChart/LineChart'

const Coin = () => {
  const {coinId} = useParams()
  const [coinData, setCoinData] = useState()
  const [chartData, setChartData] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {currency} = useContext(CoinContext)

  // Use consistent API key - replace with your working key
  const API_KEY = 'CG-R3VX9z5u2mMauHaRkELUWLAL'

  const fetchCoinData = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json', 
        'x-cg-pro-api-key': API_KEY
      }
    };
    
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setCoinData(data)
    } catch (err) {
      console.error('Error fetching coin data:', err)
      setError(err.message)
    }
  }

  const fetchHistoricalData = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-pro-api-key': API_KEY
      }
    };
    
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`, 
        options
      )
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setChartData(data)
    } catch (err) {
      console.error('Error fetching historical data:', err)
      setError(err.message)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Add small delay to avoid rate limiting
        await Promise.all([
          fetchCoinData(),
          new Promise(resolve => setTimeout(resolve, 100)).then(() => fetchHistoricalData())
        ])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (coinId) {
      fetchData()
    }
  }, [currency, coinId]) // Added coinId to dependencies

  if (error) {
    return (
      <div className="error">
        <p>Error loading coin data: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (loading || !coinData || !chartData) {
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    )
  }

  return (
    <div className='coin'>
      <div className="coin-name">
        <img src={coinData.image.large} alt="" />
        <p><b>{coinData.name} ({coinData.symbol.toUpperCase()})</b></p>
      </div>
      <div className="coin-chart">
        <LineChart historicalData={chartData} />
      </div>
      <div className="coin-info">
        <ul>
          <li>Crypto Market Rank</li>
          <li>{coinData.market_cap_rank}</li>
        </ul>
        <ul>
          <li>Current Price</li>
          <li>{currency.symbol} {coinData.market_data.current_price[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>Market Cap</li>
          <li>{currency.symbol} {coinData.market_data.market_cap[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>24 Hour High</li>
          <li>{currency.symbol} {coinData.market_data.high_24h[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>24 Hour Low</li>
          <li>{currency.symbol} {coinData.market_data.low_24h[currency.name].toLocaleString()}</li>
        </ul>
      </div>
    </div>
  )
}

export default Coin