import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";

const TASKS_STORAGE_KEY = "tasks-list-project-web";
const weatherApiKey = "1c0dd0662b4c093cf1bad01f6ee1dca9";
const DOG_API_URL = "https://dog.ceo/api/breeds/image/random";

function App() {
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

  const [dogImage, setDogImage] = useState("");
  const [dogLoading, setDogLoading] = useState(false);
  const [dogError, setDogError] = useState("");

  const fetchDogImage = useCallback(async () => {
    try {
      setDogLoading(true);
      setDogError("");

      const dogResponse = await axios.get(DOG_API_URL);

      if (dogResponse.data.status !== "success" || !dogResponse.data.message) {
        throw new Error("Dog API вернул неправильный ответ");
      }

      setDogImage(dogResponse.data.message);
    } catch {
      setDogError("Не удалось загрузить картинку собаки");
    } finally {
      setDogLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    async function fetchData() {
      try {
        const currencyResponse = await axios.get(
          "https://www.cbr-xml-daily.ru/daily_json.js"
        );

        const USDrate = currencyResponse.data.Valute.USD.Value.toFixed(2).replace(
          ".",
          ","
        );

        const EURrate = currencyResponse.data.Valute.EUR.Value.toFixed(2).replace(
          ".",
          ","
        );

        setRates({ USDrate, EURrate });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;

              const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`
              );

              setWeatherData(weatherResponse.data);
            } catch {
              setError("Ошибка загрузки погоды");
            }
          },
          () => {
            setError("Разрешите доступ к геолокации для показа погоды");
          }
        );
      } catch {
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    fetchDogImage();
  }, [fetchDogImage]);

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
              <h2>Курс валют</h2>
              <p>Доллар США: {rates.USDrate} руб.</p>
              <p>Евро: {rates.EURrate} руб.</p>
            </div>

            {weatherData && (
              <div className="card">
                <h2>Погода сегодня</h2>
                <p>🌡️ {(weatherData.main.temp - 273.15).toFixed(1)}°C</p>
                <p>💨 {weatherData.wind.speed} м/с</p>
                <p>☁️ {weatherData.clouds.all}%</p>
              </div>
            )}
          </>
        )}

        <div className="card dog-card">
          <h2>Случайная собака</h2>

          {dogLoading && !dogImage && <p>Загрузка собаки...</p>}

          {dogImage && (
            <img className="dog-image" src={dogImage} alt="Случайная собака" />
          )}

          {dogError && <p className="error">{dogError}</p>}

          <button type="button" onClick={fetchDogImage} disabled={dogLoading}>
            {dogLoading ? "Загрузка..." : "Другая собака"}
          </button>
        </div>
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
