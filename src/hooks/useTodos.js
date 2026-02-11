import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  startTransition,
} from 'react';

import {
  actions as todoActions,
  initialState as initialTodosState,
  reducer as todosReducer,
} from '../reducers/todos.reducer';

// Static assets are surfaced from this hook so the UI layer
// doesn’t need to know where they live.
import logo from '../assets/logo.png';
import errorImg from '../assets/error.png';

// Airtable configuration derived from env vars.
// Kept outside the hook so they remain stable across renders.
const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_PAT}`;

// Default headers for write requests.
// GET requests intentionally omit Content-Type.
const DEFAULT_HEADERS = {
  Authorization: AUTH_TOKEN,
  'Content-Type': 'application/json',
};

// Normalizes Airtable write payloads into the expected shape.
// `id` is optional and only included for PATCH requests.
const createPayload = (id, fields) => ({
  records: [
    {
      ...(id && { id }),
      fields,
    },
  ],
});

// Maps low-level network / HTTP errors to user-facing messages
// that reflect the action being attempted.
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
  // Centralized state management via reducer to keep async
  // flows predictable and easy to reason about.
  const [todosState, dispatch] = useReducer(todosReducer, initialTodosState);

  const {
    errorMessage,
    sortField,
    sortDirection,
    queryString,
    workingTodoTitle,
    isLoading,
    isSaving,
  } = todosState;

  // Thin action wrappers to avoid leaking dispatch logic
  // into consuming components.
  const setSortField = useCallback(field => {
    dispatch({ type: todoActions.setSortField, sortField: field });
  }, []);

  const setSortDirection = useCallback(direction => {
    dispatch({ type: todoActions.setSortDirection, sortDirection: direction });
  }, []);

  const setQueryString = useCallback(queryString => {
    dispatch({ type: todoActions.setQueryString, queryString });
  }, []);

  const setWorkingTodoTitle = useCallback(title => {
    dispatch({
      type: todoActions.setWorkingTodoTitle,
      workingTodoTitle: title,
    });
  }, []);

  // Stores timeout IDs for delayed completion removal.
  // useRef ensures timers persist across renders without
  // triggering re-renders.
  const completionTimersRef = useRef({});

  // Tracks the latest todo list so async callbacks can check
  // current state before applying delayed removals.
  const latestTodosRef = useRef([]);

  // Represents the current query configuration.
  // Any change invalidates cached results.
  const queryKey = `${sortField}:${sortDirection}:${queryString}`;

  // In-memory cache for fetched todos keyed by queryKey.
  // Avoids redundant network requests when toggling views.
  const todoCacheRef = useRef({});

  // Constructs the Airtable GET URL with sorting and filtering.
  // - Defaults to incomplete todos
  // - Adds SEARCH() when a query string is present

  // This logic intentionally lives here (not in the UI)
  // so view components remain declarative.
  const encodeUrl = useCallback(() => {
    const sortQuery = `sort[0][field]=${encodeURIComponent(
      sortField
    )}&sort[0][direction]=${encodeURIComponent(sortDirection)}`;
    let formula = '{isCompleted}=FALSE()';
    if (queryString) {
      // Use JSON.stringify to safely quote and escape the search term
      // inside the Airtable formula string.
      const safeQuery = JSON.stringify(queryString);
      formula = `AND({isCompleted}=FALSE(), SEARCH(${safeQuery},{title}))`;
    }
    const searchQuery = `filterByFormula=${encodeURIComponent(formula)}`;
    return `${BASE_URL}?${sortQuery}&${searchQuery}`;
  }, [sortField, sortDirection, queryString]);

  // Centralized request helper that:
  // - Differentiates loading vs saving states
  // - Applies appropriate headers per request type
  // - Normalizes fetch and HTTP errors
  const createRequest = useCallback(
    async (method, payload = null) => {
      const requestKind = method === 'GET' ? 'loading' : 'saving';

      dispatch({ type: todoActions.startRequest, requestKind });

      try {
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
        // fetch throws TypeError for network failures (offline, DNS, etc.)
        if (err.name === 'TypeError') err.code = 'NETWORK_ERROR';
        throw err;
      } finally {
        dispatch({ type: todoActions.endRequest, requestKind });
      }
    },
    [encodeUrl]
  );

  // Fetches todos for the current query state.
  // Serves from cache when available to avoid refetching.
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

      // Normalize Airtable records into app-friendly shape
      const normalizedTodos = records.map(record => ({
        id: record.id,
        createdTime: record.createdTime,
        ...record.fields,
        isCompleted: record.fields.isCompleted ?? false,
      }));

      // Use the normalized todos for both state and cache to avoid redoing this work elsewhere.
      dispatch({ type: todoActions.loadTodos, records: normalizedTodos });
      todoCacheRef.current[queryKey] = normalizedTodos;
    } catch (err) {
      err.message = getErrorMessage('fetch', err);
      dispatch({ type: todoActions.setLoadError, error: err });
    }
  };

  // Optimistically adds a new todo before persisting to the API.
  const addTodo = async newTodoTitle => {
    todoCacheRef.current = {};

    const clientId = `${Date.now()}_${newTodoTitle}_${Math.floor(Math.random() * 15000)}`;

    const payload = createPayload(null, { title: newTodoTitle });

    dispatch({ type: todoActions.addOptimisticTodo, newTodoTitle, clientId });

    try {
      const { records } = await createRequest('POST', payload);
      dispatch({ type: todoActions.addTodo, records, clientId });
    } catch (err) {
      err.message = getErrorMessage('add', err);
      // Avoid clearing an in-flight fetch loading state when a save fails.
      if (!todosState.isLoading) {
        dispatch({ type: todoActions.setLoadError, error: err });
      }
    }
  };

  // Toggles completion state with delayed removal.
  // Allows users to undo accidental clicks.
  const completeTodo = async completedId => {
    todoCacheRef.current = {};

    const originalTodo = todosState.todoList.find(t => t.id === completedId);
    if (!originalTodo) return;

    const optimisticTodo = {
      ...originalTodo,
      isCompleted: !originalTodo.isCompleted,
    };

    dispatch({ type: todoActions.completeTodo, optimisticTodo });

    // Cancel any pending completion timers
    if (completionTimersRef.current[completedId]) {
      clearTimeout(completionTimersRef.current[completedId]);
      delete completionTimersRef.current[completedId];
    }

    try {
      await createRequest(
        'PATCH',
        createPayload(completedId, {
          title: originalTodo.title,
          isCompleted: !originalTodo.isCompleted,
        })
      );

      // Only schedule delayed removal when marking complete and
      // after persistence succeeds to avoid losing todos on failure.
      if (!originalTodo.isCompleted) {
        completionTimersRef.current[completedId] = setTimeout(() => {
          const todoStillCompleted = latestTodosRef.current.some(
            todo => todo.id === completedId && todo.isCompleted
          );

          if (!todoStillCompleted) {
            delete completionTimersRef.current[completedId];
            return;
          }

          startTransition(() => {
            dispatch({
              type: todoActions.finalizeComplete,
              completedId,
            });
            delete completionTimersRef.current[completedId];
          });
        }, 3500);
      }
    } catch (err) {
      clearTimeout(completionTimersRef.current[completedId]);
      delete completionTimersRef.current[completedId];
      err.message = getErrorMessage('complete', err);
      dispatch({
        type: todoActions.revertTodo,
        editedTodo: originalTodo,
        error: err,
      });
    }
  };

  // Optimistically updates a todo title with rollback on failure.
  const updateTodo = async editedTodo => {
    todoCacheRef.current = {};

    const originalTodo = todosState.todoList.find(t => t.id === editedTodo.id);

    if (!originalTodo) {
      const error = new Error(
        'That todo is no longer available. Please refresh.'
      );
      // Avoid incorrectly clearing an active loading state by only
      // using the load-specific error action when no load is in progress.
      if (!isLoading) {
        dispatch({
          type: todoActions.setLoadError,
          error,
        });
      }
      // Returns early if original todo is missing
      return;
    }

    dispatch({ type: todoActions.updateTodo, editedTodo });

    const payload = createPayload(editedTodo.id, {
      title: editedTodo.title,
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

  // Clears the current query string from state.
  const clearQueryString = useCallback(() => {
    dispatch({ type: todoActions.clearQueryString });
  }, []);

  // Clears the current error message from state.
  const clearError = useCallback(() => {
    dispatch({ type: todoActions.clearError });
  }, []);

  useEffect(() => {
    latestTodosRef.current = todosState.todoList;
  }, [todosState.todoList]);

  useEffect(() => {
    fetchTodos();

    // Following the exhaustive-deps rule here causes
    // an infinite request loop due to reducer-driven updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRequest, queryKey]);

  // Exposes all state and actions required by the UI layer.
  // The App and feature components consume this hook
  // without needing to know about Airtable or async logic.
  return {
    // assets
    logo,
    errorImg,

    // state
    todosState,
    errorMessage,
    isLoading,
    isSaving,

    // actions
    addTodo,
    updateTodo,
    completeTodo,
    clearError,
    clearQueryString,

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
