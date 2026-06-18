import React, { useEffect, useState } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from "axios";

const TASKS_STORAGE_KEY = "tasks-list-project-web";
const METEOBLUE_API_KEY = "ВСТАВЬ_СЮДА_СВОЙ_КЛЮЧ_METEOBLUE";

function App() {
  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [dayInfo, setDayInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function fetchCurrency() {
      const currencyResponse = await axios.get(
        "https://www.cbr-xml-daily.ru/daily_json.js"
      );

      if (!currencyResponse.data || !currencyResponse.data.Valute) {
        throw new Error("Нет данных о валюте.");
      }

      const USDrate = currencyResponse.data.Valute.USD.Value.toFixed(2).replace(
        ".",
        ","
      );

      const EURrate = currencyResponse.data.Valute.EUR.Value.toFixed(2).replace(
        ".",
        ","
      );

      setRates({
        USDrate,
        EURrate,
      });
    }

    async function fetchDayInfo() {
      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const formattedDate = `${year}${month}${day}`;

      const dayResponse = await axios.get(
        `https://isdayoff.ru/${formattedDate}?cc=ru`
      );

      const dayCode = String(dayResponse.data).trim();

      let dayText = "Не удалось определить тип дня";

      if (dayCode === "0") {
        dayText = "Сегодня рабочий день";
      } else if (dayCode === "1") {
        dayText = "Сегодня выходной или праздничный день";
      } else if (dayCode === "2") {
        dayText = "Сегодня сокращённый рабочий день";
      }

      setDayInfo({
        date: `${day}.${month}.${year}`,
        code: dayCode,
        text: dayText,
      });
    }

    async function fetchWeatherByCoords(lat, lon) {
      try {
        setWeatherError("");

        const weatherResponse = await axios.get(
          `https://my.meteoblue.com/packages/basic-1h?lat=${lat}&lon=${lon}&format=json&apikey=${METEOBLUE_API_KEY}`
        );

        console.log("Meteoblue response:", weatherResponse.data);

        const data = weatherResponse.data?.data_1h;

        if (!data) {
          throw new Error("Meteoblue не вернул блок data_1h.");
        }

        const temperature = data.temperature?.[0];
        const feltTemperature = data.felttemperature?.[0];
        const windSpeed = data.windspeed?.[0];
        const precipitation = data.precipitation?.[0];
        const humidity = data.relativehumidity?.[0];

        setWeatherData({
          temperature,
          feltTemperature,
          windSpeed,
          precipitation,
          humidity,
        });
      } catch (err) {
        console.error("Ошибка загрузки погоды:", err);
        setWeatherError("Погода временно недоступна.");
        setWeatherData(null);
      }
    }

    async function fetchWeather() {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          fetchWeatherByCoords(55.7558, 37.6173).finally(resolve);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            await fetchWeatherByCoords(lat, lon);
            resolve();
          },
          async () => {
            await fetchWeatherByCoords(55.7558, 37.6173);
            resolve();
          }
        );
      });
    }

    async function fetchAllApiData() {
      try {
        setLoading(true);
        setError("");

        await Promise.all([fetchCurrency(), fetchDayInfo(), fetchWeather()]);
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных из API.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllApiData();
  }, []);

  useEffect(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);

        if (Array.isArray(parsedTasks)) {
          setTodos(parsedTasks);
        }
      } catch (err) {
        console.error("Ошибка чтения задач из localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.error("Ошибка сохранения задач в localStorage:", err);
    }
  }, [todos]);

  const addTask = (userInput) => {
    if (userInput.trim()) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        task: userInput,
        complete: false,
      };

      setTodos([...todos, newItem]);
    }
  };

  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleToggle = (id) => {
    setTodos(
      todos.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : task
      )
    );
  };

  return (
    <div className="App">
      <main className="page">
        <section className="hero">
          <p className="subtitle">React + API</p>
          <h1>Список задач</h1>
          <p className="hero-text">
            Курсы валют, погода и производственный календарь РФ загружаются из
            внешних API.
          </p>
        </section>

        {loading && <p className="loading">Загрузка данных...</p>}

        {error && <p className="error main-error">{error}</p>}

        <section className="info">
          <div className="card">
            <div className="card-icon">₽</div>
            <h2>Курс валют</h2>

            {!loading && !error && (
              <>
                <p>
                  Доллар США: <strong>{rates.USDrate} руб.</strong>
                </p>
                <p>
                  Евро: <strong>{rates.EURrate} руб.</strong>
                </p>
              </>
            )}
          </div>

          <div className="card">
            <div className="card-icon">☁</div>
            <h2>Погода</h2>

            {!loading && weatherData && (
              <>
                <p>
                  Температура:{" "}
                  <strong>{weatherData.temperature ?? "—"}°C</strong>
                </p>
                <p>
                  Ощущается как:{" "}
                  <strong>{weatherData.feltTemperature ?? "—"}°C</strong>
                </p>
                <p>
                  Ветер: <strong>{weatherData.windSpeed ?? "—"} м/с</strong>
                </p>
                <p>
                  Влажность: <strong>{weatherData.humidity ?? "—"}%</strong>
                </p>
              </>
            )}

            {!loading && weatherError && (
              <p className="small-text">{weatherError}</p>
            )}
          </div>

          <div className="card">
            <div className="card-icon">📅</div>
            <h2>Календарь РФ</h2>

            {!loading && !error && dayInfo && (
              <>
                <p>
                  Дата: <strong>{dayInfo.date}</strong>
                </p>
                <p>{dayInfo.text}</p>
              </>
            )}
          </div>
        </section>

        <section className="todo-wrapper">
          <header>
            <h2 className="list-header">Список задач: {todos.length}</h2>
          </header>

          <ToDoForm addTask={addTask} />

          <div className="todo-list">
            {todos.map((todo) => (
              <ToDo
                todo={todo}
                key={todo.id}
                toggleTask={handleToggle}
                removeTask={removeTask}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;