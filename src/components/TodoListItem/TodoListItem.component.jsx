import './ToDoListItem.styles.css';

function TodoListItem({ todo }) {
  return <li>{todo.title}</li>;
}

export default TodoListItem;
