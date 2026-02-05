import { useMemo } from 'react';

import TodoListItem from '../../features/TodoListItem/TodoListItem.component';
import styles from './TodoList.module.css';

// Sorts an array of todos by a specified field and direction
// - todos = Array of todo objects to sort
// - field = The field name to sort by (e.g., 'title', 'createdTime')
// - direction = Sort direction: 'asc' for ascending, 'desc' for descending
// - Returns A new sorted array of todos
 
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

// TodoList component that displays a sorted list of todo items
// - todoList = Array of todo objects to display
// - onCompleteTodo = Callback to handle marking a todo as complete
// - onUpdateTodo = Callback to handle updating a todo
// - isLoading = Flag indicating if the todo list is currently loading
// - sortField = Field name to sort todos by
// - sortDirection = Direction to sort: 'asc' or 'desc'

function TodoList({
  todoList,
  onCompleteTodo,
  onUpdateTodo,
  isLoading,
  sortField,
  sortDirection,
}) {
  // Memoize the sorted list to avoid re-sorting on every render
  // Only recalculates when todoList, sortField, or sortDirection changes
  const sortedAndFilteredTodoList = useMemo(() => {
    return sortTodos(
      todoList,
      sortField,
      sortDirection
    );
  }, [todoList, sortField, sortDirection]);

  return (
    <ul className={styles["todo-list"]}>
      {sortedAndFilteredTodoList.length < 1 ? (
        // Show appropriate message when list is empty
        !isLoading ? (
          <p>Add todo above to get started</p>
        ) : (
          <p>Todo list loading...</p>
        )
      ) : (
        // Render each todo item
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