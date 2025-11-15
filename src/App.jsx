import TodoList from './components/TodoList/TodoList.component';
import TodoForm from './components/TodoForm/TodoForm.component';

function App() {
  return (
    <div>
      <h1 className="todos-title">My Todos</h1>
      <TodoForm />
      <TodoList />
    </div>
  );
}

export default App;
