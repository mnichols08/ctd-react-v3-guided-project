import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';

import { useTodosContext } from './context/TodosContext';

import TodosPage from './pages/TodosPage/TodosPage.component';
import AboutPage from './pages/AboutPage/AboutPage.component';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.component';
import Header from './shared/Header/Header.component';
import Footer from './shared/Footer/Footer.component';
import ErrorMessage from './features/ErrorMessage/ErrorMessage.component';

// App composes the main features of the todos experience.
// It owns no business logic and delegates state management
// to TodosContext and feature-level components.
function App() {
  // Leverages useLocation from react-router
  const location = useLocation();
  const { pathname } = location;
  const title = 'Todo App';
  // Read only the global error state needed at this level.
  // Other state is consumed closer to where it’s used.
  const {
    todosState: { errorMessage },
  } = useTodosContext();

  // Keep the document title aligned with the current page
  useEffect(() => {
    const titleByPath = {
      '/': title,
      '/about': `About - ${title}`,
    };

    document.title = titleByPath[pathname] ?? `Not Found - ${title}`;
  }, [pathname]);
  return (
    <>
      {/* Static application header */}
      <Header title={title} />
      <main>
        <Routes>
          <Route path="/" element={<TodosPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {/* Global error surfaced consistently across the app */}
      {errorMessage && <ErrorMessage />}
      {/* Static application footer */}
      <Footer />
    </>
  );
}

export default App;
