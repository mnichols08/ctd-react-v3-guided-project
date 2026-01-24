import { useMemo } from 'react';

import TodoListItem from '../../features/TodoListItem/TodoListItem.component';
import styles from './TodoList.module.css';

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
  workingTodoTitle,
}) {
  const sortedAndFilteredTodoList = useMemo(() => {
    return sortTodos(
      todoList.filter(todo => !todo.isCompleted),
      sortField,
      sortDirection
    );
  }, [todoList, sortField, sortDirection, workingTodoTitle]);

  return (
    <ul className={styles["todo-list"]}>
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
