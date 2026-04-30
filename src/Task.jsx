function ToDo({ todo, toggleTask, removeTask }) {
  return (
    <div style={{ margin: "10px" }}>
      <span
        onClick={() => toggleTask(todo.id)}
        style={{
          textDecoration: todo.complete ? "line-through" : "none",
          cursor: "pointer",
        }}
      >
        {todo.task}
      </span>

      <button onClick={() => removeTask(todo.id)}>❌</button>
    </div>
  );
}

export default ToDo;