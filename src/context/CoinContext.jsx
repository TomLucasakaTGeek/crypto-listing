import { createContext, useEffect, useState, useCallback } from "react";

export const CoinContext = createContext()

const CoinContextProvider = (props) => {

    const [allCoin, setAllCoin] = useState([])
    const [currency, setCurrency] = useState({
        name: "usd",
        symbol: "$",
    })

    const fetchAllCoin = useCallback(async () => {
        
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json', 
                'x-cg-pro-api-key': 'CG-R3VX9z5u2mMauHaRkELUWLAL',
            }
        };

    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}&order=market_cap_desc&per_page=100&page=1&sparkline=false`, options)

        if(!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        setAllCoin(data)
        
    } catch (error) {
        console.error('Error fetching coins:', error)
        setAllCoin([])
    }

    }, [currency.name]) 

    useEffect(() => {
        fetchAllCoin()
    }, [fetchAllCoin])

    const contextValue = {
        allCoin, 
        currency, 
        setCurrency
    }

    return (
        <CoinContext.Provider value={contextValue}>
            {props.children}
        </CoinContext.Provider>
    )
}

export default CoinContextProvider