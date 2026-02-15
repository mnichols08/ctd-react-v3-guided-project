import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import styled from 'styled-components';

import { useTodosContext } from '../../context/TodosContext';

import TodoListItem from '../../features/TodoListItem/TodoListItem.component';

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

// Styled wrapper for the entire list + pagination UI.
const StyledTodos = styled.section`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      list-style: none;
      padding: 0.25rem 0.5rem;
      margin-bottom: 0.2rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text);

      /* highlight item when focused or hovered for accessibility feedback */
      &:hover,
      &:focus-within {
        border-color: var(--accent);
      }

      /* title hover effect */
      span {
        transition: transform 0.1s;
        cursor: text;
        &:hover {
          transform: scale(1.1);
        }
      }

      /* highlight edit mode row */
      form:has(input[type='text']) {
        background: var(--bg-subtle);
      }
    }

    /* inline edit text input */
    input[type='text'] {
      flex: 1;
      padding: 0.5rem 0.6rem;
      border-radius: 4px;
      border: 1px solid var(--border);
      font-size: 1rem;
    }
  }

  /* shared button styles */
  input[type='submit'],
  input[type='button'],
  button {
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
  }

  /* primary hover */
  input[type='submit']:hover,
  button:hover:not(:disabled) {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  /* destructive hover */
  input[value='Cancel']:hover {
    background: var(--danger, #d33);
    border-color: var(--danger, #d33);
  }

  /* pagination layout */
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      margin: 0 1em;
    }

    /* disabled nav buttons appear inactive */
    button:disabled {
      color: var(--inactive-link);
    }
  }
`;

// TodoList component that displays a sorted list of todo items
function TodoList() {
  const navigate = useNavigate();
  // Pull global state from context
  // - todoList = Array of todo objects to display
  // - onCompleteTodo = Callback to handle marking a todo as complete
  // - onUpdateTodo = Callback to handle updating a todo
  // - isLoading = Flag indicating if the todo list is currently loading
  // - sortField = Field name to sort todos by
  // - sortDirection = Direction to sort: 'asc' or 'desc'
  const {
    todosState: { todoList },
    isLoading,
    sortField,
    sortDirection,
  } = useTodosContext();
  // Memoize the sorted list to avoid re-sorting on every render
  // Only recalculates when todoList, sortField, or sortDirection changes
  const sortedAndFilteredTodoList = useMemo(() => {
    return sortTodos(todoList, sortField, sortDirection);
  }, [todoList, sortField, sortDirection]);
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = 15;
  // Fallback to page one if param missing
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  // Index of the first item in the current pagination
  const indexOfFirstTodo = (currentPage - 1) * itemsPerPage;

  // Uses previous values to slice out the appropriate subset to pass to `Page`
  const currentTodos = sortedAndFilteredTodoList.slice(
    indexOfFirstTodo,
    indexOfFirstTodo + itemsPerPage
  );

  // Total pages calculated from filtered list length
  const totalPages = Math.ceil(sortedAndFilteredTodoList.length / itemsPerPage);

  // Navigate backward but never below page 1
  const handlePreviousPage = () => {
    setSearchParams({ page: Math.max(currentPage - 1, 1) });
  };

  // Navigate forward but never past last page
  const handleNextPage = () => {
    setSearchParams({ page: Math.min(currentPage + 1, totalPages) });
  };

  // Prevents user from manually navigating to a page that doesn't exist
  useEffect(() => {
    if (totalPages > 0) {
      if (isNaN(currentPage) || currentPage < 1 || currentPage > totalPages) {
        navigate('/');
      }
    }
  }, [currentPage, totalPages, navigate]);
  return (
    <StyledTodos>
      {sortedAndFilteredTodoList.length < 1 ? (
        // Show appropriate message when list is empty
        !isLoading ? (
          <p>Add todo above to get started</p>
        ) : (
          <p>Todo list loading...</p>
        )
      ) : (
        <>
          <ul>
            {/* Render each todo item  */}
            {currentTodos.map(todo => (
              <TodoListItem key={todo.id} todo={todo} />
            ))}
          </ul>
          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </StyledTodos>
  );
}

export default TodoList;
