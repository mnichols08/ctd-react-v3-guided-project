import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const [todoList, setTodoList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [queryString, setQueryString] = useState('');
  const [sortField, setSortField] = useState('createdTime');
  const [sortDirection, setSortDirection] = useState('desc');

  // Unique cache key that represents the current query state.
  // Any change to sorting or search will invalidate the result.
  const queryKey = useMemo(() => {
    return `${sortField}:${sortDirection}:${queryString}`;
  }, [sortField, sortDirection, queryString]);

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
      }
    },
    [encodeUrl]
  );

  const fetchTodos = async () => {
    if (todoCacheRef.current[queryKey]) {
      // Serve cached results immediately when available
      // to avoid unnecessary network requests
      setTodoList(todoCacheRef.current[queryKey]);
      return;
    }
    // Preserve current state so we can roll back on failure
    const previousTodos = todoList;
    try {
      const { records } = await createRequest('GET');
      // Normalize Airtable records into app-friendly todo objects
      // and ensure `isCompleted` always exists
      const todos = records.map(record => {
        const todo = {
          id: record.id,
          ...record.fields,
        };
        if (!todo.isCompleted) {
          // Normalize missing or falsy isCompleted values from Airtable
          todo.isCompleted = false;
        }
        return todo;
      });
      setTodoList(todos);
      todoCacheRef.current[queryKey] = todos;
    } catch (err) {
      setErrorMessage(getErrorMessage('fetch', err));
      console.error(err);
      setTodoList(previousTodos);
    }
  };

  const addTodo = async newTodoTitle => {
    // Preserve current state so we can roll back on failure
    const previousTodos = todoList;
    const payload = createPayload(null, { title: newTodoTitle });

    // Optimistically add the todo immediately for responsiveness.
    // A temporary client-generated ID is replaced after persistence.
    const optimisticTodos = [
      ...previousTodos,
      {
        id:
          typeof crypto !== 'undefined' &&
          typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        title: newTodoTitle,
        isCompleted: false,
        isStillSaving: true,
      },
    ];
    setTodoList(optimisticTodos);
    try {
      const { records } = await createRequest('POST', payload);
      const firstRecord = records?.[0];
      const fields = firstRecord?.fields ?? {};

      const savedTodo = {
        id: firstRecord.id,
        title: fields.title ?? newTodoTitle ?? '',
        isCompleted: fields.isCompleted ?? false,
        createdTime: fields.createdTime ?? new Date().toISOString(),
      };

      const updatedTodos = [...previousTodos, savedTodo];
      setTodoList(updatedTodos);
    } catch (err) {
      setErrorMessage(getErrorMessage('add', err));
      console.error(err);
      setTodoList(previousTodos);
    }
  };

  const completeTodo = async completedId => {
    // Preserve current state so we can roll back on failure
    const previousTodos = todoList;
    const originalTodo = todoList.find(todo => todo.id === completedId);
    if (!originalTodo) {
      console.warn(`Todo with id ${completedId} not found`);
      return;
    }
    // Optimistically toggle completion state before persisting
    const optimisticTodos = previousTodos.map(todo =>
      todo.id === completedId
        ? { ...todo, isCompleted: !todo.isCompleted }
        : todo
    );

    setTodoList(optimisticTodos);
    const payload = createPayload(completedId, {
      title: originalTodo.title,
      isCompleted: !originalTodo.isCompleted,
    });
    try {
      await createRequest('PATCH', payload);
      // Delay removal to allow the completed state to be visible briefly.
      // If the todo is uncompleted during this window, it will not be removed.
      await new Promise(resolve => setTimeout(resolve, 3500));

      setTodoList(previousTodos => {
        const todo = previousTodos.find(t => t.id === completedId);
        if (!todo || !todo.isCompleted) {
          // Re-check completion state to avoid removing a todo
          // that was reverted before the delay elapsed
          return previousTodos;
        }
        return previousTodos.filter(t => t.id !== completedId);
      });
    } catch (err) {
      setErrorMessage(getErrorMessage('complete', err));
      console.error(err);
      setTodoList(previousTodos);
    }
  };
  const updateTodo = async editedTodo => {
    // Preserve current state so we can roll back on failure
    const previousTodos = todoList;
    // Optimistically update todo before saving
    const optimisticTodos = previousTodos.map(todo =>
      todo.id === editedTodo.id ? editedTodo : todo
    );
    setTodoList(optimisticTodos);

    const payload = createPayload(editedTodo.id, {
      title: editedTodo.title,
      isCompleted: !editedTodo.isCompleted,
    });

    try {
      await createRequest('PATCH', payload);
    } catch (err) {
      setErrorMessage(getErrorMessage('update', err));
      console.error(err);

      setTodoList(previousTodos);
    }
  };

  useEffect(() => {
    fetchTodos();
    // disabling this warning here because following the linters
    // advice results in an endless loop 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRequest, queryKey]);

  return {
    // data
    todoList,
    errorMessage,
    isLoading,
    isSaving,

    // actions
    addTodo,
    updateTodo,
    completeTodo,
    setErrorMessage,

    // view state
    queryString,
    setQueryString,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    setWorkingTodoTitle,
    workingTodoTitle
  };
};

export default useTodos;
