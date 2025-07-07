import { createContext, useEffect, useState, useCallback } from "react";

export const CoinContext = createContext()

const CoinContextProvider = (props) => {

    const [allCoin, setAllCoin] = useState([])
    const [currency, setCurrency] = useState({
        name: "usd",
        symbol: "$",
    })

    const fetchAllCoin = useCallback(async () => {
        console.log('🔍 Fetching all coins from Coinlore API')
        
        try {
            // Fetch first 100 coins from Coinlore
            const res = await fetch('https://api.coinlore.net/api/tickers/')
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            console.log('✅ Coinlore data received:', data.info?.coins_num, 'total coins available')
            console.log('📊 Fetched coins:', data.data?.length)
            
            if (data && data.data && Array.isArray(data.data)) {
                // Transform Coinlore data to match your existing structure
                const transformedData = data.data.map(coin => ({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol,
                    image: `https://coinicons-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}`,
                    current_price: parseFloat(coin.price_usd),
                    market_cap: parseFloat(coin.market_cap_usd),
                    market_cap_rank: coin.rank,
                    price_change_percentage_24h: parseFloat(coin.percent_change_24h),
                    // Add original coinlore data for reference
                    coinlore_data: coin
                }))
                
                setAllCoin(transformedData)
                console.log('✅ Transformed', transformedData.length, 'coins for display')
            } else {
                throw new Error('Invalid data structure received from Coinlore API')
            }
            
        } catch (error) {
            console.error('💥 Error fetching coins from Coinlore:', error)
            setAllCoin([])
        }

    }, []) // Removed currency dependency since Coinlore only provides USD

    useEffect(() => {
        fetchAllCoin()
    }, [fetchAllCoin])

    const contextValue = {
        allCoin, 
        currency, 
        setCurrency,
        fetchAllCoin // Expose function to allow manual refresh
    }

    return (
        <CoinContext.Provider value={contextValue}>
            {props.children}
        </CoinContext.Provider>
    )
}

export default CoinContextProvider