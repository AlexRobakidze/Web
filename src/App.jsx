import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";

const TASKS_STORAGE_KEY = "tasks-list-project-web";
const weatherApiKey = "1c0dd0662b4c093cf1bad01f6ee1dca9";

function App() {
  // Инициализируем из localStorage сразу, чтобы ESLint (react-hooks/set-state-in-effect)
  // не ругался на setState внутри useEffect.
  const [todos, setTodos] = useState(() => {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!savedTasks) return [];
    try {
      const parsedTasks = JSON.parse(savedTasks);
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
      console.error("Ошибка чтения задач из localStorage");
      return [];
    }
  });
  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    async function fetchData() {
      try {
        const currencyResponse = await axios.get(
          "https://www.cbr-xml-daily.ru/daily_json.js"
        );

        const USDrate = currencyResponse.data.Valute.USD.Value
          .toFixed(2)
          .replace(".", ",");

        const EURrate = currencyResponse.data.Valute.EUR.Value
          .toFixed(2)
          .replace(".", ",");

        setRates({ USDrate, EURrate });

        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`
          );

          setWeatherData(weatherResponse.data);
        });
      } catch {
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addTask = (userInput) => {
    const text = userInput.trim();

    if (!text) return;

    const newTask = {
      id: crypto.randomUUID(),
      task: text,
      complete: false,
    };

    setTodos([...todos, newTask]);
  };

  const removeTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleToggle = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, complete: !todo.complete } : todo
      )
    );
  };

  return (
    <div className="app">
      <section className="info">
        {loading && <p>Загрузка...</p>}

        {!loading && error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="card">
              <p>Доллар США: {rates.USDrate} руб.</p>
              <p>Евро: {rates.EURrate} руб.</p>
            </div>

            {weatherData && (
              <div className="card">
                <p>Погода сегодня</p>
                <p>
                  🌡️ {(weatherData.main.temp - 273.15).toFixed(1)}°C
                </p>
                <p>💨 {weatherData.wind.speed} м/с</p>
                <p>☁️ {weatherData.clouds.all}%</p>
              </div>
            )}
          </>
        )}
      </section>

      <main className="todo-wrapper">
        <h1>Список задач: {todos.length}</h1>

        <ToDoForm addTask={addTask} />

        <div className="todo-list">
          {todos.map((todo) => (
            <ToDo
              key={todo.id}
              todo={todo}
              toggleTask={handleToggle}
              removeTask={removeTask}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;