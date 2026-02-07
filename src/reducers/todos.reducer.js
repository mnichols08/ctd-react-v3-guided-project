const actions = {
  fetchTodos: 'fetchTodos',
  serveCachedTodos: 'serveCachedTodos',
  loadTodos: 'loadTodos',
  addOptimisticTodo: 'addOptimisticTodo',
  addTodo: 'addTodo',
  updateTodo: 'updateTodo',
  revertTodo: 'revertTodo',
  completeTodo: 'completeTodo',
  startRequest: 'startRequest',
  endRequest: 'endRequest',
  setLoadError: 'setLoadError',
  finalizeComplete: 'finalizeComplete',
  clearError: 'clearError',
};

const initialState = {
  todoList: [],
  errorMessage: '',
  workingTodoTitle: '',
  isLoading: false,
  isSaving: false,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case actions.serveCachedTodos:
      // Set state with previously cached todos for the current query, if available
      return {
        ...state,
        todoList: action.cachedRecords,
      };
    case actions.fetchTodos:
      return {
        ...state,
        isLoading: true,
      };
    case actions.loadTodos:
      return {
        ...state,
        todoList: [
          // Normalize Airtable records into app-friendly todo objects
          // and ensure `isCompleted` always exists
          ...action.records.map(record => {
            const todo = {
              id: record.id,
              createdTime: record.createdTime,
              ...record.fields,
            };
            if (!todo.isCompleted) {
              // Normalize missing or falsy isCompleted values from Airtable
              todo.isCompleted = false;
            }
            return todo;
          }),
        ],
        isLoading: false,
      };
    case actions.setLoadError:
      return {
        ...state,
        errorMessage: action.error.message,
        isLoading: false,
      };

    case actions.startRequest:
      return {
        ...state,
        isSaving: true,
      };
    case actions.addOptimisticTodo: {
      // Optimistically add the todo immediately for responsiveness.
      // A temporary client-generated ID is replaced after persistence.
      // A current timestamp is also added for sorting todos optimistically
      const newTodo = {
        id: crypto.randomUUID(),
        title: action.newTodoTitle,
        isCompleted: false,
        isStillSaving: true, // Flag to identify this temporary todo for replacement
        createdTime: new Date().toISOString(),
      };
      return {
        ...state,
        todoList: [...state.todoList, newTodo],
      };
    }

    case actions.addTodo: {
      const firstRecord = action.records?.[0];
      if (!firstRecord) return state;
      // Replace the optimistic todo (identified by isStillSaving flag) 
      // with the real record returned from the server
      return {
        ...state,
        todoList: state.todoList.map(todo =>
          todo.isStillSaving
            ? {
                id: firstRecord.id,
                ...firstRecord.fields,
                isCompleted: firstRecord.fields.isCompleted ?? false,
              }
            : todo
        ),
        isSaving: false,
      };
    }
    case actions.endRequest:
      return {
        ...state,
        isLoading: false,
        isSaving: false,
      };

    case actions.completeTodo:
      // Optimistically update the todo to completed state before server confirmation
      return {
        ...state,
        todoList: state.todoList.map(todo =>
          todo.id === action.optimisticTodo.id ? action.optimisticTodo : todo
        ),
      };

    case actions.revertTodo:
    case actions.updateTodo: {
      // Handle both update confirmation and revert-on-error scenarios
      // revertTodo uses the same logic to restore previous state if update fails
      const updatedTodos = state.todoList.map(todo => {
        if (todo.id === action.editedTodo.id) {
          return { ...action.editedTodo };
        }
        return todo;
      });

      const updatedState = {
        ...state,
        todoList: [...updatedTodos],
      };
      
      // Optionally set error message if this is a failed update
      if (action.error) {
        updatedState.errorMessage = action.error.message;
      }

      return {
        ...updatedState,
      };
    }
    case actions.finalizeComplete:
      // Remove the todo from list after successful completion 
      // (called after server confirms the delete/complete operation)
      return {
        ...state,
        todoList: state.todoList.filter(todo => todo.id !== action.completedId),
      };
    case actions.clearError:
      return {
        ...state,
        errorMessage: '',
      };
    default:
      return state;
  }
}

export { actions, initialState, reducer };