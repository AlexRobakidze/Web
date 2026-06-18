import React, { useEffect, useState } from "react";
import "./App.css";
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from "axios";

const TASKS_STORAGE_KEY = "tasks-list-project-web";

function App() {
  const [rates, setRates] = useState({});
  const [dayInfo, setDayInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function fetchApiData() {
      try {
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
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных из API.");
      } finally {
        setLoading(false);
      }
    }

    fetchApiData();
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
      <div className="info">
        <div className="card">
          <h2>Курс валют</h2>
          {loading && <p>Загрузка...</p>}
          {!loading && error && <p className="error">{error}</p>}
          {!loading && !error && (
            <>
              <p>Доллар США: {rates.USDrate} руб.</p>
              <p>Евро: {rates.EURrate} руб.</p>
            </>
          )}
        </div>

        <div className="card">
          <h2>Производственный календарь РФ</h2>
          {loading && <p>Загрузка...</p>}
          {!loading && error && <p className="error">{error}</p>}
          {!loading && !error && dayInfo && (
            <>
              <p>Дата: {dayInfo.date}</p>
              <p>{dayInfo.text}</p>
            </>
          )}
        </div>
      </div>

      <div className="todo-wrapper">
        <header>
          <h1 className="list-header">Список задач: {todos.length}</h1>
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
      </div>
    </div>
  );
}

export default App;