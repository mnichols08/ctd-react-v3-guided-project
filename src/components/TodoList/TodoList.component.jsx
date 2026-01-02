import './ToDoList.styles.css';
import TodoListItem from '../TodoListItem/TodoListItem.component';

function TodoList() {
  const todos = [
    { id: 1, title: 'review resources' },
    { id: 2, title: 'take notes' },
    { id: 3, title: 'code out app' },
  ];
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoListItem key={todo.id} todo={todo}/>
      ))}
    </ul>
  );
}

export default TodoList;
