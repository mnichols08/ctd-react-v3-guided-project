import { useCallback, useMemo, useState, useEffect } from 'react';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';

const createPayload = (id, fields) => ({
  records: [
    {
      ...(id && { id }),
      fields,
    },
  ],
});

const getErrorMessage = (action, error) => {
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'Unable to connect to database. Please check your internet connection.';
  }

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
  const url = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
  const token = `Bearer ${import.meta.env.VITE_PAT}`;
  const headers = useMemo(
    () => ({
      Authorization: token,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const createRequest = useCallback(
    async (method, payload = null) => {
      try {
        setIsSaving(true);
        const options = {
          method,
          headers: method === 'GET' ? { Authorization: token } : headers,
          ...(payload && { body: JSON.stringify(payload) }),
        };

        const resp = await fetch(url, options);
        if (!resp.ok)
          throw new Error(`Request failed with status ${resp.status}`);
        return resp.json();
      } finally {
        setIsSaving(false);
      }
    },
    [url, headers, token]
  );

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
      },
    ];
    setTodoList(optimisticTodos);
    try {
      const { records } = await createRequest('POST', payload);
      const fields = records?.[0]?.fields ?? {};

      const savedTodo = {
        id: records[0].id,
        title: fields.title ?? newTodoTitle ?? '',
        isCompleted: fields.isCompleted ?? false,
      };

      const updatedTodos = [...previousTodos, savedTodo];

      setTodoList(updatedTodos);
    } catch (err) {
      setErrorMessage(getErrorMessage('add', err));
      console.error(errorMessage);
      setTodoList(previousTodos);
    }
  };

  const completeTodo = async completedId => {
    const previousTodos = todoList;
    const originalTodo = todoList.find(todo => todo.id === completedId);

    const optimisticTodos = [
      ...previousTodos,
      {
        id: completedId,
        title: originalTodo.title,
        isCompleted: !originalTodo.isCompleted,
      },
    ];
    setTodoList(optimisticTodos);

    const payload = createPayload(completedId, {
      title: originalTodo.title,
      isCompleted: !originalTodo.isCompleted,
    });
    try {
      await createRequest('PATCH', payload);
      const updatedTodoList = todoList.map(todo => {
        if (todo.id === completedId) return { ...todo, isCompleted: true };
        return todo;
      });
      setTodoList(updatedTodoList);
    } catch (err) {
      setErrorMessage(getErrorMessage('complete', err));
      console.error(errorMessage);
      setTodoList(previousTodos);
    }
  };
  const updateTodo = async editedTodo => {
    const previousTodos = todoList;

    setTodoList(prev =>
      prev.map(todo => (todo.id === editedTodo.id ? editedTodo : todo))
    );

    const payload = createPayload(editedTodo.id, {
      title: editedTodo.title,
      isCompleted: editedTodo.isCompleted,
    });

    try {
      const { records } = await createRequest('PATCH', payload);

      const airtableFields = records?.[0]?.fields ?? {};

      const updatedTodo = {
        id: records[0].id,
        title: airtableFields.title ?? editedTodo.title,
        isCompleted: airtableFields.isCompleted ?? editedTodo.isCompleted,
      };
      setTodoList(prev =>
        prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    } catch (err) {
      setErrorMessage(getErrorMessage('edit', err));
      console.error(errorMessage);

      setTodoList(previousTodos);
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
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
        setTodoList([...todos]);
      } catch (err) {
        setErrorMessage(getErrorMessage('fetch', err));
        console.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);
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
      {errorMessage && (
        <div>
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
