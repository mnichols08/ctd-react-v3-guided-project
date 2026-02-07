import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  startTransition,
} from 'react';

import {
  actions as todoActions,
  initialState as initialTodosState,
  reducer as todosReducer,
} from '../reducers/todos.reducer';

const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_PAT}`;

const DEFAULT_HEADERS = {
  Authorization: AUTH_TOKEN,
  'Content-Type': 'application/json',
};

// Helper function that normalizes Airtable write payloads.
// `id` is optional and only included for update requests.
const createPayload = (id, fields) => ({
  records: [
    {
      ...(id && { id }),
      fields,
    },
  ],
});

// Helper function that translates network errors into
// user friendly messages based on the attempted action.

const getErrorMessage = (action, error) => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Unable to connect to database. Please check your internet connection.';
  }
  if (error.status >= 500) {
    return 'Server error. Please try again later.';
  }

  const messages = {
    add: "We couldn't save your todo. Please try again.",
    update: "We couldn't update that todo. We've restored it to how it was.",
    complete: "Couldn't mark that as complete. Please try again.",
    fetch: "We're having trouble loading your todos. Please refresh the page.",
  };

  return messages[action] || 'Something went wrong. Please try again.';
};
const useTodos = function () {
  const [todosState, dispatch] = useReducer(todosReducer, initialTodosState);
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [queryString, setQueryString] = useState('');
  const [sortField, setSortField] = useState('createdTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const completionTimersRef = useRef({});

  // Unique cache key that represents the current query state.
  // Any change to sorting or search will invalidate the result.
  const queryKey = `${sortField}:${sortDirection}:${queryString}`;

  // In-memory cache for fetched todos, keyed by queryKey.
  // useRef prevents re-renders when the cache is updated.
  const todoCacheRef = useRef({});

  // Builds the Airtable GET URL with sorting and filtering.
  // Defaults to incomplete todos only, and adds a SEARCH()
  // formula when a query string is present.
  // This differs from the assignment but allows us to remove
  // the filter from TodoList, enabling us to check off todos
  // without disappearing immediately.
  const encodeUrl = useCallback(() => {
    let searchQuery = '&filterByFormula={isCompleted}=FALSE()';
    const sortQuery = `sort[0][field]=${sortField}&sort[0][direction]=${sortDirection}`;
    if (queryString) {
      searchQuery = `&filterByFormula=AND({isCompleted}=FALSE(), SEARCH("${queryString}",{title}))`;
    }
    return encodeURI(`${BASE_URL}?${sortQuery}${searchQuery}`);
  }, [sortField, sortDirection, queryString]);

  // Centralized request helper function that:
  // - Handles GET vs mutation loading states
  // - Applies correct headers per request type
  // - Normalizes network and HTTP errors
  const createRequest = useCallback(
    async (method, payload = null) => {
      const setResponseStatus = method === 'GET' ? setIsLoading : setIsSaving;
      dispatch({ type: todoActions.startRequest });
      try {
        setResponseStatus(true);
        const url = method === 'GET' ? encodeUrl() : BASE_URL;

        const options = {
          method,
          headers:
            method === 'GET' ? { Authorization: AUTH_TOKEN } : DEFAULT_HEADERS,
          ...(payload && { body: JSON.stringify(payload) }),
        };

        const resp = await fetch(url, options);

        if (!resp.ok) {
          const error = new Error('HTTP_ERROR');
          error.status = resp.status;
          throw error;
        }

        return resp.json();
      } catch (err) {
        // fetch throws TypeError on network failures (offline, DNS, etc.)
        if (err.name === 'TypeError') err.code = 'NETWORK_ERROR';
        throw err;
      } finally {
        setResponseStatus(false);
        dispatch({ type: todoActions.endRequest });
      }
    },
    [encodeUrl]
  );

  const fetchTodos = async () => {
    if (todoCacheRef.current[queryKey]) {
      dispatch({
        type: todoActions.serveCachedTodos,
        cachedRecords: todoCacheRef.current[queryKey],
      });
      return;
    }
    dispatch({ type: todoActions.fetchTodos });
    try {
      const { records } = await createRequest('GET');
      // Updates todo list cache refererence
      const normalizedTodos = records.map(record => ({
        id: record.id,
        ...record.fields,
        isCompleted: record.fields.isCompleted ?? false,
      }));

      dispatch({ type: todoActions.loadTodos, records });
      todoCacheRef.current[queryKey] = normalizedTodos;
    } catch (err) {
      err.message = getErrorMessage('fetch', err);
      dispatch({ type: todoActions.setLoadError, error: err });
    }
  };

  const addTodo = async newTodoTitle => {
    todoCacheRef.current = {};
    const payload = createPayload(null, { title: newTodoTitle });
    dispatch({ type: todoActions.addOptimisticTodo, newTodoTitle });
    try {
      const { records } = await createRequest('POST', payload);
      dispatch({ type: todoActions.addTodo, records, newTodoTitle });
    } catch (err) {
      err.message = getErrorMessage('add', err);
      dispatch({ type: todoActions.setLoadError, error: err });
    }
  };

  const completeTodo = async completedId => {
    todoCacheRef.current = {};
    const originalTodo = todosState.todoList.find(t => t.id === completedId);
    if (!originalTodo) return;

    const optimisticTodo = {
      ...originalTodo,
      isCompleted: !originalTodo.isCompleted,
    };

    dispatch({ type: todoActions.completeTodo, optimisticTodo });

    // Cancel any existing completion timer
    if (completionTimersRef.current[completedId]) {
      clearTimeout(completionTimersRef.current[completedId]);
      delete completionTimersRef.current[completedId];
    }

    // Only schedule removal if checking ON
    if (!originalTodo.isCompleted) {
      completionTimersRef.current[completedId] = setTimeout(() => {
        startTransition(() => {
          dispatch({ type: todoActions.finalizeComplete, completedId });
        });
      }, 3500);
    }

    try {
      await createRequest(
        'PATCH',
        createPayload(completedId, {
          title: originalTodo.title,
          isCompleted: !originalTodo.isCompleted,
        })
      );
    } catch (err) {
      clearTimeout(completionTimersRef.current[completedId]);
      err.message = getErrorMessage('complete', err);
      dispatch({
        type: todoActions.revertTodo,
        editedTodo: originalTodo,
        error: err,
      });
    }
  };

  const updateTodo = async editedTodo => {
    todoCacheRef.current = {};
    const originalTodo = todosState.todoList.find(t => t.id === editedTodo.id);
    dispatch({ type: todoActions.updateTodo, editedTodo });
    const payload = createPayload(editedTodo.id, {
      title: editedTodo.title,
      isCompleted: !editedTodo.isCompleted,
    });

    try {
      await createRequest('PATCH', payload);
    } catch (err) {
      err.message = getErrorMessage('update', err);
      dispatch({
        type: todoActions.revertTodo,
        editedTodo: originalTodo,
        error: err,
      });
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: todoActions.clearError });
  }, []);

  useEffect(() => {
    fetchTodos();
    // disabling this warning here because following the linters
    // advice results in an endless loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRequest, queryKey]);

  // Returns all state and actions from this hook for use in the App component.
  // This includes:
  // - The current list of todos and loading/saving states
  // - Action functions for adding, updating, and completing todos
  // - State and setters for search query and sorting options
  // - State and setters for the working todo title (for input control)
  // - A setter for error messages to display in the UI
  return {
    // data
    todosState,
    errorMessage: todosState.errorMessage,
    isLoading,
    isSaving,

    // actions
    addTodo,
    updateTodo,
    completeTodo,
    clearError,

    // view state
    queryString,
    setQueryString,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    setWorkingTodoTitle,
    workingTodoTitle,
  };
};

export default useTodos;
