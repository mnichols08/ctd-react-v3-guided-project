import { useCallback, useState, useEffect } from 'react';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';
import TodosViewForm from './features/TodosViewForm/TodosViewForm.component';

const BASE_URL = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
const AUTH_TOKEN = `Bearer ${import.meta.env.VITE_PAT}`;

const DEFAULT_HEADERS = {
  Authorization: AUTH_TOKEN,
  'Content-Type': 'application/json',
};

const encodeUrl = ({ sortField, sortDirection }) => {
  const url = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
  let sortQuery = `sort[0][field]=${sortField}&sort[0][direction]=${sortDirection}`;
  return encodeURI(`${url}?${sortQuery}`);
};

const createPayload = (id, fields) => ({
  records: [
    {
      ...(id && { id }),
      fields,
    },
  ],
});

const getErrorMessage = (action, error) => {
  if (error.code === 'NETWORK_ERROR')
    return 'Unable to connect to database. Please check your internet connection.';
  if (error.status >= 500) return 'Server error. Please try again later.';

  const messages = {
    add: "We couldn't save your todo. Please try again.",
    update: "We couldn't update that todo. We've restored it to how it was.",
    complete: "Couldn't mark that as complete. Please try again.",
    fetch: "We're having trouble loading your todos. Please refresh the page.",
  };

  return messages[action] || 'Something went wrong. Please try again.';
};

function App() {
  const [todoList, setTodoList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortField, setSortField] = useState('createdTime');
  const [sortDirection, setSortDirection] = useState('desc');

  const createRequest = useCallback(
    async (method, payload = null) => {
      const setResponseStatus = method === 'GET' ? setIsLoading : setIsSaving;
      try {
        setResponseStatus(true);
        const url =
          method === 'GET' ? encodeUrl({ sortField, sortDirection }) : BASE_URL;

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
        if (err.name === 'TypeError') err.code = 'NETWORK_ERROR';
        throw err;
      } finally {
        setResponseStatus(false);
      }
    },
    [sortField, sortDirection]
  );

  const fetchTodos = async () => {
    const previousTodos = todoList;
    try {
      const { records } = await createRequest('GET');
      const todos = records.map(record => {
        const todo = {
          id: record.id,
          ...record.fields,
        };
        if (!todo.isCompleted) {
          todo.isCompleted = false;
        }
        return todo;
      });
      setTodoList(todos);
    } catch (err) {
      setErrorMessage(getErrorMessage('fetch', err));
      console.error(getErrorMessage('fetch', err));
      setTodoList(previousTodos);
    }
  };

  const addTodo = async newTodoTitle => {
    const previousTodos = todoList;
    const payload = createPayload(null, { title: newTodoTitle });

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
    const previousTodos = todoList;
    const originalTodo = todoList.find(todo => todo.id === completedId);
    if (!originalTodo) {
      console.warn(`Todo with id ${completedId} not found`);
      return;
    }
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
    } catch (err) {
      setErrorMessage(getErrorMessage('complete', err));
      console.error(getErrorMessage('complete', err));
      setTodoList(previousTodos);
    }
  };
  const updateTodo = async editedTodo => {
    const previousTodos = todoList;
    const optimisticTodos = previousTodos.map(todo =>
      todo.id === editedTodo.id ? editedTodo : todo
    );

    setTodoList(optimisticTodos);

    const payload = createPayload(editedTodo.id, {
      title: editedTodo.title,
      isCompleted: editedTodo.isCompleted,
    });

    try {
      await createRequest('PATCH', payload);
    } catch (err) {
      setErrorMessage(getErrorMessage('update', err));
      console.error(getErrorMessage('update', err));

      setTodoList(previousTodos);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [createRequest]);
  return (
    <div>
      <h1 className="todos-title">My Todos</h1>
      <TodoForm onAddTodo={addTodo} isSaving={isSaving} />
      <TodoList
        onCompleteTodo={completeTodo}
        todoList={todoList}
        onUpdateTodo={updateTodo}
        isLoading={isLoading}
      />
      <hr />
      <TodosViewForm
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />
      {errorMessage && (
        <div className="error-message">
          <hr />
          <p>{errorMessage}</p>
          <input
            type="button"
            onClick={() => setErrorMessage('')}
            value="Dismiss"
          ></input>
        </div>
      )}
    </div>
  );
}

export default App;
