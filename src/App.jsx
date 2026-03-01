import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const fetchCoins = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
      );
      if (!response.ok) {
        throw new Error('Ошибка API');
      }
      const data = await response.json();
      setCoins(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCoins();

   
    const intervalId = setInterval(fetchCoins, 60000);

    
    return () => clearInterval(intervalId);
  }, []);

 
  const handleSort = (key) => {
    let direction = 'ascending';
 
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  
  const sortedCoins = [...filteredCoins].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return ' ↕';
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🚀 Crypto Tracker</h1>
        <p>Топ-100 криптовалют по рыночной капитализации</p>
        
        <input
          type="text"
          placeholder="Поиск монеты "
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading-text">Загрузка данных...</p>
      ) : (
        <div className="table-container">
          <table className="crypto-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('market_cap_rank')}># {getSortIcon('market_cap_rank')}</th>
                <th onClick={() => handleSort('name')}>Монета {getSortIcon('name')}</th>
                <th onClick={() => handleSort('current_price')}>Цена (USD) {getSortIcon('current_price')}</th>
                <th onClick={() => handleSort('price_change_percentage_24h')}>Изменение (24ч) {getSortIcon('price_change_percentage_24h')}</th>
                <th onClick={() => handleSort('market_cap')}>Капитализация {getSortIcon('market_cap')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedCoins.length > 0 ? (
                sortedCoins.map((coin) => (
                  <tr key={coin.id}>
                    <td>{coin.market_cap_rank}</td>
                    <td className="coin-name-cell">
                      <img src={coin.image} alt={coin.name} className="coin-icon" />
                      <strong>{coin.name}</strong>
                      <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                    </td>
                    <td>${coin.current_price.toLocaleString()}</td>
                    <td className={coin.price_change_percentage_24h >= 0 ? 'text-green' : 'text-red'}>
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td>${coin.market_cap.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">Монеты не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;