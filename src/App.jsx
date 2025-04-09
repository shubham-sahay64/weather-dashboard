import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

function App() {
  // this where city name and all data is kept
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recent, setRecent] = useState([])
  const [dark, setDark] = useState(false)

  // when page open, get old cities from memory
  useEffect(() => {
    const saved = localStorage.getItem("recentCities")
    if (saved) setRecent(JSON.parse(saved))
  }, [])

  // this do dark mode or light mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  // keep city in list, not same city 2 times
  const updateRecent = (name) => {
    const updated = [name, ...recent.filter(c => c !== name)].slice(0, 5)
    setRecent(updated)
    localStorage.setItem("recentCities", JSON.stringify(updated))
  }

  // go to weather website and get data
  const fetchWeather = async (name = city) => {
    if (!name.trim()) return
    setLoading(true)
    setError("")
    try {
      const current = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apiKey}&units=metric`
      )
      const upcoming = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${apiKey}&units=metric`
      )
      setWeather(current.data)
      setForecast(upcoming.data.list.slice(0, 5))
      updateRecent(current.data.name)
    } catch {
      setError("City not found or API error.")
      setWeather(null)
      setForecast([])
    } finally {
      setLoading(false)
    }
  }

  // if you press enter, do search
  const handleSearch = (e) => {
    if (e.key === "Enter") fetchWeather()
  }

  return (
    <div className="app">
      <div className="toggle">
        <button onClick={() => setDark(!dark)} className="toggle-btn">
          {dark ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="card">
        <div className="search">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search city"
            className="input"
          />
          <button onClick={() => fetchWeather()} className="search-btn">Go</button>
        </div>

        {recent.length > 0 && (
          <div>
            <p className="title">Recent:</p>
            <div className="tags">
              {recent.map((c, i) => (
                <button key={i} onClick={() => fetchWeather(c)} className="tag">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="spinner"></div>
              <p>Loading...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="error">{error}</p>}

        <AnimatePresence>
          {weather && (
            <motion.div className="weather" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="weather-header">
                <h2>{weather.name}</h2>
                <button onClick={() => fetchWeather(weather.name)} className="refresh">🔄 Refresh</button>
              </div>
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="icon" className="weather-icon" />
              <p className="temp">{weather.main.temp}°C</p>
              <p className="feels">Feels like: {weather.main.feels_like}°C</p>
              <p className="desc">{weather.weather[0].description}</p>
              <p className="info">Humidity: {weather.main.humidity}%</p>
              <p className="info">Wind: {weather.wind.speed} km/h</p>
            </motion.div>
          )}
        </AnimatePresence>

        {forecast.length > 0 && (
          <div className="forecast">
            <p className="title">5-Day Forecast</p>
            <div className="forecast-grid">
              {forecast.map((f, index) => (
                <div key={index} className="forecast-item">
                  <p>{new Date(f.dt_txt).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  <img src={`https://openweathermap.org/img/wn/${f.weather[0].icon}.png`} alt="icon" className="forecast-icon" />
                  <p>{f.main.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
