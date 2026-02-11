// Action type constants for the todos reducer.
// Grouped by concern: fetching, mutations, view state, and errors.
const actions = {
  // Fetch lifecycle
  fetchTodos: 'fetchTodos',
  serveCachedTodos: 'serveCachedTodos',
  loadTodos: 'loadTodos',

  // Create / update lifecycle
  addOptimisticTodo: 'addOptimisticTodo',
  addTodo: 'addTodo',
  updateTodo: 'updateTodo',
  revertTodo: 'revertTodo',
  completeTodo: 'completeTodo',
  finalizeComplete: 'finalizeComplete',

  // Request state
  startRequest: 'startRequest',
  endRequest: 'endRequest',

  // Error handling
  setLoadError: 'setLoadError',
  clearError: 'clearError',

  // View / form state
  setWorkingTodoTitle: 'setWorkingTodoTitle',
  setSortDirection: 'setSortDirection',
  setSortField: 'setSortField',
  setQueryString: 'setQueryString',
  clearQueryString: 'clearQueryString',
};

// Initial reducer state.
// Represents both domain data (todos) and UI/view concerns.
const initialState = {
  todoList: [],
  errorMessage: '',
  workingTodoTitle: '',
  isLoading: false,
  isSaving: false,
  sortField: 'createdTime',
  sortDirection: 'desc',
  queryString: '',
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case actions.serveCachedTodos:
      // Serve previously fetched todos for the current query
      // without triggering a network request.
      return {
        ...state,
        todoList: action.cachedRecords,
        isLoading: false,
      };

    case actions.fetchTodos:
      // Marks the beginning of a fetch request.
      return {
        ...state,
        isLoading: true,
      };

    case actions.loadTodos:
      // Normalize Airtable records into app-friendly todo objects.
      // Ensures `isCompleted` always exists for consistent rendering.
      return {
        ...state,
        todoList: action.records.map(record => {
          const todo = {
            id: record.id,
            createdTime: record.createdTime,
            ...record.fields,
          };
          // Normalize missing isCompleted to avoid UI issues
          todo.isCompleted = todo.isCompleted ?? false;

          return todo;
        }),
        isLoading: false,
      };

    case actions.setLoadError:
      // Capture error message and reset loading state.
      return {
        ...state,
        errorMessage: action.error.message,
        isLoading: false,
      };

    case actions.startRequest:
      // Differentiates read vs write requests to avoid flipping
      // the saving indicator during data fetches.
      if (action.requestKind === 'loading') {
        return {
          ...state,
          isLoading: true,
        };
      }

      return {
        ...state,
        isSaving: true,
      };

    case actions.addOptimisticTodo: {
      // Immediately insert a new todo into state for responsiveness.
      // This placeholder is later replaced by the persisted record.
      const clientId = action.clientId;
      const newTodo = {
        id: clientId, // temporary fake id
        clientId, // stable client-side identifier for replacement
        title: action.newTodoTitle,
        isCompleted: false,
        isStillSaving: true, // Identifies optimistic placeholder
        createdTime: new Date().toISOString(),
      };

      return {
        ...state,
        todoList: [...state.todoList, newTodo],
      };
    }

    case actions.addTodo: {
      const firstRecord = action.records?.[0];
      if (!firstRecord || !action.clientId) return state;

      // Replace only the matching optimistic placeholder with the server response.
      return {
        ...state,
        todoList: state.todoList.map(todo =>
          todo.isStillSaving && todo.clientId === action.clientId
            ? {
                id: firstRecord.id,
                clientId: undefined,
                ...firstRecord.fields,
                createdTime: firstRecord.createdTime ?? todo.createdTime,
                isCompleted: firstRecord.fields.isCompleted ?? false,
                isStillSaving: false,
              }
            : todo
        ),
        isSaving: false,
      };
    }

    case actions.endRequest:
      // Reset only the flag corresponding to the request type.
      if (action.requestKind === 'loading') {
        return {
          ...state,
          isLoading: false,
        };
      }

      return {
        ...state,
        isSaving: false,
      };

    case actions.completeTodo:
      // Optimistically toggle completion state prior to server confirmation.
      return {
        ...state,
        todoList: state.todoList.map(todo =>
          todo.id === action.optimisticTodo.id ? action.optimisticTodo : todo
        ),
      };

    case actions.revertTodo:
    case actions.updateTodo: {
      // Shared logic for:
      // - Confirming an update
      // - Reverting to previous state if persistence fails
      if (!action.editedTodo) {
        if (action.error) {
          return {
            ...state,
            errorMessage: action.error.message,
          };
        }

        return state;
      }

      const updatedTodos = state.todoList.map(todo =>
        todo.id === action.editedTodo.id ? { ...action.editedTodo } : todo
      );

      const updatedState = {
        ...state,
        todoList: updatedTodos,
      };

      // Only set error message when reverting due to failure.
      if (action.error) {
        updatedState.errorMessage = action.error.message;
      }

      return updatedState;
    }

    case actions.finalizeComplete:
      // Remove a completed todo after delayed confirmation.
      // This enables undo-like behavior in the UI.
      return {
        ...state,
        todoList: state.todoList.filter(todo => todo.id !== action.completedId),
      };

    case actions.clearError:
      // Clears any visible error message.
      return {
        ...state,
        errorMessage: '',
      };

    case actions.setWorkingTodoTitle:
      // Updates controlled input value for the todo form.
      return {
        ...state,
        workingTodoTitle: action.workingTodoTitle,
      };

    case actions.setSortDirection:
      return {
        ...state,
        sortDirection: action.sortDirection,
      };

    case actions.setSortField:
      return {
        ...state,
        sortField: action.sortField,
      };

    case actions.setQueryString:
      return {
        ...state,
        queryString: action.queryString,
      };

    case actions.clearQueryString:
      return {
        ...state,
        queryString: '',
      };

    default:
      return state;
  }
}

export { actions, initialState, reducer };
