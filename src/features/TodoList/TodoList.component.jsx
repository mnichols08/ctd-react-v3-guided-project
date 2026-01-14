import { useEffect, useState } from 'react';

import './TodoList.styles.css';
import TodoListItem from '../../features/TodoListItem/TodoListItem.component';

const sortTodos = (todos, field, direction) => {
  const sorted = [...todos].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

function TodoList({
  todoList,
  onCompleteTodo,
  onUpdateTodo,
  isLoading,
  sortField,
  sortDirection,
  queryString,
}) {
  const [sortedAndFilteredTodoList, setSortedAndFilteredTodoList] = useState(
    []
  );

  const sortAndFilterTodoList = () =>
    sortTodos(
      todoList
        .filter(todo => !todo.isCompleted)
        .filter(todo => todo.title.includes(queryString)),
      sortField,
      sortDirection
    );

  useEffect(() => {
    setSortedAndFilteredTodoList(sortAndFilterTodoList());
  }, [sortField, sortDirection, queryString, todoList]);
  return (
    <ul className="todo-list">
      {sortedAndFilteredTodoList.length < 1 ? (
        !isLoading ? (
          <p>Add todo above to get started</p>
        ) : (
          <p>Todo list loading...</p>
        )
      ) : (
        sortedAndFilteredTodoList.map(todo => (
          <TodoListItem
            key={todo.id}
            todo={todo}
            onCompleteTodo={onCompleteTodo}
            onUpdateTodo={onUpdateTodo}
          />
        ))
      )}
    </ul>
  );
}

export default TodoList;
