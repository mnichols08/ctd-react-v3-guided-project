import './ToDoListItem.styles.css';

function TodoListItem({ todo }) {
  return (
    <>
      <li key={todo.id}>{todo.title}</li>
    </>
  );
}

export default TodoListItem;
