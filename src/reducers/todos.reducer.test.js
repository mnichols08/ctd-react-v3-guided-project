import { describe, it, expect } from 'vitest';

import { actions, initialState, reducer } from './todos.reducer';

const reduce = (state, action) => reducer(state, action);

const baseState = {
  ...initialState,
  todoList: [
    { id: '1', title: 'A', isCompleted: false, createdTime: '2025-01-01' },
    { id: '2', title: 'B', isCompleted: true, createdTime: '2025-01-02' },
  ],
};

describe('todos.reducer', () => {
  it('marks loading true on fetch and false on load', () => {
    const loading = reduce(initialState, { type: actions.fetchTodos });
    expect(loading.isLoading).toBe(true);

    const loaded = reduce(loading, {
      type: actions.loadTodos,
      records: [{ id: 'x', title: 'Loaded', isCompleted: false }],
    });
    expect(loaded.isLoading).toBe(false);
    expect(loaded.todoList).toEqual([
      { id: 'x', title: 'Loaded', isCompleted: false },
    ]);
  });

  it('serves cached todos and clears loading', () => {
    const state = { ...initialState, isLoading: true };
    const served = reduce(state, {
      type: actions.serveCachedTodos,
      cachedRecords: [{ id: 'cached', title: 'Cached', isCompleted: false }],
    });
    expect(served.isLoading).toBe(false);
    expect(served.todoList[0].id).toBe('cached');
  });

  it('stores load errors and clears loading', () => {
    const error = new Error('boom');
    const state = { ...initialState, isLoading: true };
    const errored = reduce(state, { type: actions.setLoadError, error });
    expect(errored.isLoading).toBe(false);
    expect(errored.errorMessage).toBe('boom');
  });

  it('adds an optimistic todo and replaces it on addTodo', () => {
    const optimistic = reduce(initialState, {
      type: actions.addOptimisticTodo,
      newTodoTitle: 'New',
      clientId: 'tmp1',
    });

    expect(optimistic.todoList).toHaveLength(1);
    expect(optimistic.todoList[0]).toMatchObject({
      id: 'tmp1',
      clientId: 'tmp1',
      title: 'New',
      isStillSaving: true,
      isCompleted: false,
    });

    const persisted = reduce(optimistic, {
      type: actions.addTodo,
      clientId: 'tmp1',
      records: [
        {
          id: 'server1',
          createdTime: '2025-02-02',
          fields: { title: 'New', isCompleted: false },
        },
      ],
    });

    expect(persisted.todoList).toHaveLength(1);
    expect(persisted.todoList[0]).toMatchObject({
      id: 'server1',
      title: 'New',
      isStillSaving: false,
      isCompleted: false,
      createdTime: '2025-02-02',
    });
    expect(persisted.isSaving).toBe(false);
  });

  it('removes an optimistic todo on failure', () => {
    const optimistic = reduce(initialState, {
      type: actions.addOptimisticTodo,
      newTodoTitle: 'Temp',
      clientId: 'tmp1',
    });

    const removed = reduce(optimistic, {
      type: actions.removeOptimisticTodo,
      clientId: 'tmp1',
    });

    expect(removed.todoList).toHaveLength(0);
  });

  it('toggles completion optimistically and finalizes removal', () => {
    const toggled = reduce(baseState, {
      type: actions.completeTodo,
      optimisticTodo: { ...baseState.todoList[0], isCompleted: true },
    });
    expect(toggled.todoList[0].isCompleted).toBe(true);

    const finalized = reduce(toggled, {
      type: actions.finalizeComplete,
      completedId: '1',
    });
    expect(finalized.todoList.find(t => t.id === '1')).toBeUndefined();
  });

  it('reverts updates and surfaces error messages', () => {
    const updated = reduce(baseState, {
      type: actions.updateTodo,
      editedTodo: { ...baseState.todoList[0], title: 'Edited' },
    });
    expect(updated.todoList[0].title).toBe('Edited');

    const reverted = reduce(updated, {
      type: actions.revertTodo,
      editedTodo: baseState.todoList[0],
      error: new Error('fail'),
    });
    expect(reverted.todoList[0].title).toBe('A');
    expect(reverted.errorMessage).toBe('fail');
  });

  it('tracks request flags separately for loading vs saving', () => {
    const loading = reduce(initialState, {
      type: actions.startRequest,
      requestKind: 'loading',
    });
    expect(loading.isLoading).toBe(true);
    expect(loading.isSaving).toBe(false);

    const saving = reduce(initialState, {
      type: actions.startRequest,
      requestKind: 'saving',
    });
    expect(saving.isSaving).toBe(true);

    const ended = reduce(saving, {
      type: actions.endRequest,
      requestKind: 'saving',
    });
    expect(ended.isSaving).toBe(false);
  });

  it('updates view state fields', () => {
    const withWorking = reduce(initialState, {
      type: actions.setWorkingTodoTitle,
      workingTodoTitle: 'Typing',
    });
    expect(withWorking.workingTodoTitle).toBe('Typing');

    const sorted = reduce(withWorking, {
      type: actions.setSortField,
      sortField: 'title',
    });
    expect(sorted.sortField).toBe('title');

    const dir = reduce(sorted, {
      type: actions.setSortDirection,
      sortDirection: 'asc',
    });
    expect(dir.sortDirection).toBe('asc');

    const queried = reduce(dir, {
      type: actions.setQueryString,
      queryString: 'cat',
    });
    expect(queried.queryString).toBe('cat');

    const cleared = reduce(queried, { type: actions.clearQueryString });
    expect(cleared.queryString).toBe('');
  });

  it('clears errors when requested', () => {
    const errored = { ...initialState, errorMessage: 'boom' };
    const cleared = reduce(errored, { type: actions.clearError });
    expect(cleared.errorMessage).toBe('');
  });
});
