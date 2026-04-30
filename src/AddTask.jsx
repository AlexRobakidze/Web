import { useState } from "react";

function ToDoForm({ addTask }) {
  const [input, setInput] = useState("");

  const submit = (e) => {
    e.preventDefault();
    addTask(input);
    setInput("");
  };

  return (
    <form onSubmit={submit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Введите задачу"
      />
      <button>Добавить</button>
    </form>
  );
}

export default ToDoForm;