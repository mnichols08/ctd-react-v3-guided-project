# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- ***

### Changed

- ***

### Fixed

- ***

---

## [0.7.3] - 2026-01-14

### Added

- ***

### Changed

- ***

### Fixed

- Uses useMemo instead of useState + useEffect to avoid unnecessary state updates and re-renders.

## [0.7.2] - 2026-01-14

### Added

- In `App`, creates the state value (and update function) for `queryString` with an empty string for an initial value.
- In `App` passes `queryString` and `setQueryString` into both TodosViewForm and the TodoList component
- In TodosViewForm:
  - Destructures queryString and setQueryString
  - Creates a new div for search controls and adds jsx to render a functional search input that can be cleared
  - Adds functionality to filter out the rendered todos to help the user avoid making multiple of the same todo
  - Adds logic to clear the working title if a user begins to search to avoid the filter on that input from mitigating results

### Changed

- Updates encodeUrl to take in the queryString state and defines its output as part of the return statement
- Removes condtional logic to always display the search and sort inputs
- Optimistcally updates the UI before querying the server for new Todos, which does not work as hoped for

### Fixed

- Applies better styling to match the rest of the UI within TodosViewForm

---

## [0.7.1] - 2026-01-14

### Added

- Within TodosViewForm component:
  - Adds value of `sortField` to sort-by `<select>` and `sortDirection` to the direction `<select>`
  - Adds onChange event handlers to each `<select>` and passes in anonymous functions to use `setSortField` and `setSortDirection`, passing in the events target name
  - Defines a function `preventRefresh` which prevents the page from refreshing if the user accidentally hits enter while working with this form, passes into the `onSubmit` property
- Creates a new setResponseStatus that flips between loading and saving states
- Adds a sortTodos helper function to optimistically sort UI before server returns the response and calls it before calling fetchTodos in the Apps useEffect
- Adds optimistic todo on add so that the user does't have to wait on the server to see the new todo added to list
- Applies logic in TodoList to maintain the same sort order that the user has set even while adding new todos

### Changed

- Restructure and normalizes changelog for clarity and reuse
- Refactors App.jsx to move app-wide variables to very top.
- Within App.jsx moves fetchTodos outside of useEffect
- Reverts console errors to displaying the actual error for better debugging
- Migrates sortTodos from App.jsx into TodoList component
- Refactors sortAndFilterTodoList to handle both sorting and filtering in the same line
- Migrates horizontal rule from App.jsx into TodosViewForm
- Conditionally renders TodosViewForm on both the top and bottom of the list based on the number of incomplete tasks on the list

### Fixed

- Fixes bug where sorting was not working by adding a new variable, `url` that checks whether the method is 'GET' before employing `encodeURL` so that PATCH/POST requests do not pass in these parameters.
- Further addresses above bug by passing in `e.target.value` instead of `e.target.name`, which resulted in the sorting feature not working.
- Adds logic within TodoListItem and a property of 'isStillSaving' set to true on each optimistic Todo that prevents a bug caused when users attempt to complete or edit (and save) an "optimistic" todo

---

## [0.7.0] - 2026-01-13

### Added

- Sorting and filtering functionality for todos (Week 08).

### Changed

- Promoted sorting and filtering features to a minor release.

---

## [0.6.0] - 2026-01-13

### Added

- Airtable integration for persistent todo storage (Week 07).

### Changed

- Promoted Airtable integration work to a minor release.

---

## [0.5.0] - 2025-01-13

### Added

- Reusable UI components to support shared behavior and styling (Week 06).

### Changed

- Promoted reusable component work to a minor release.

---

## [0.4.0] - 2025-01-13

### Added

- Conditional rendering patterns throughout the app (Week 05).

### Changed

- Promoted conditional rendering work to a minor release.

---

## [0.3.0] - 2025-01-13

### Changed

- Introduced basic React hooks patterns and promoted Week 04 work to a minor release.

---

## [0.2.0] - 2025-01-13

### Changed

- Updated props and state usage patterns from Week 03 coursework.

---

## [0.1.0] - 2025-01-13

### Changed

- Updated foundational application code from Week 02 coursework.

---

## [0.0.11] - 2026-01-12

### Added

- Migrated lesson and assignment content into a Git submodule.
- Added a TodosViewForm component for changing sort parameters.
  - Includes labeled select inputs for:
    - Sorting by Title or Time Created.
    - Selecting ascending or descending sort direction.
- Added an encodeUrl utility to ensure consistent Airtable sorting parameters.
- Integrated TodosViewForm into the main App below the TodoList component.
- Passed sortField, setSortField, sortDirection, and setSortDirection from App into TodosViewForm.

### Changed

- Restructured TodosViewForm JSX by wrapping the form in a `todos-view-form` class to prevent style leakage.
- Added a visual divider beneath the TodosViewForm.

---

## [0.0.10] - 2026-01-11

### Added

- Environment variable example file for Airtable configuration.
- Loading and saving states (isLoading, isSaving) to manage async behavior.
- fetchTodos helper to retrieve todos from Airtable on load.
- Conditional loading message while async requests are in progress.
- Dismissible error message UI at the bottom of the page.
- Full Airtable-backed CRUD operations (Create, Read, Update, Complete).
- Optimistic UI updates for editing and completing todos.
- Shared headers variable and request helper functions to reduce duplication.
- Helper for mapping technical errors to user-friendly messages.

### Changed

- Centralized request helpers to manage state updates and failures consistently.
- Improved styling for the edit/cancel interface.
- Refactored TodoListItem to prevent accidental completion via label clicks.
- Memoized createPayload with useCallback to reduce unnecessary rerenders.
- Stabilized headers using useMemo.
- Moved createPayload and getErrorMessage utilities outside the App component.
- Improved error handling by adding catch blocks within createRequest.
- Removed pessimistic state-setting logic in favor of optimistic updates.

### Fixed

- Corrected errMessage typo to errorMessage across the App component.
- Fixed CSS issues introduced during JSX semantic updates.
- Ensured errorMessage state is consistently initialized as an empty string.
- Simplified conditional rendering by removing unnecessary template literals.
- Corrected optimistic update order so UI updates precede server requests.
- Removed unnecessary spread operator usage in fetchTodos.
- Improved error logging behavior.
- Prevented potential null reference errors by validating Airtable responses.
- Removed stray debug string from TodoListItem.
- Fixed typo in updateTodo error message.
- Added missing dependencies to useEffect to prevent stale closures.

---

## [0.0.9] - 2026-01-10

### Added

- Initial implementation of TodosViewForm for sorting and direction control.
- Integration of sortField and sortDirection state into the App component.

### Changed

- Refined TodosViewForm layout and styling to align with the rest of the application.

---

## [0.0.8] - 2025-12-23

### Added

- Empty-state messaging prompting users to add their first todo.
- Ability to mark todos as completed.
- Prevention of empty todos by disabling submission when input is blank.

### Changed

- Converted the TodoForm from an uncontrolled form to a fully controlled component.

---

## [0.0.7] - 2025-12-23

### Fixed

- Replaced timestamp-based IDs with crypto-generated IDs to avoid collisions.
- Corrected stylesheet import casing issues.
- Initialized useRef with null instead of an empty string.

---

## [0.0.6] - 2025-12-18

### Added

- Introduced useState and useRef hooks to support creating new todos.

---

## [0.0.5] - 2025-12-09

### Added

- TodoListItem component and associated stylesheet for rendering individual todos.

### Changed

- Migrated list item styles into the TodoListItem stylesheet.
- Updated TodoList to render TodoListItem components.

---

## [0.0.4] - 2025-11-22

### Fixed

- Corrected import casing typo in TodoList.jsx.
- Resolved a merge conflict involving the Git submodule on the main branch.

---

## [0.0.3] - 2025-11-15

### Added

- CSS disclaimer noting AI-assisted styling.
- reset.css file for consistent cross-browser styling.
- TodoForm component and stylesheet.

### Changed

- Updated index.css to import App.css.
- Improved TodoList accessibility.
- Updated document title and meta description.
- Centered application title via a dedicated class.

### Fixed

- Replaced invalid `class` attributes with `className` in React components.
- Removed outdated styles reintroduced during a rebase.

---

## [0.0.2] - 2025-11-15

### Added

- TodoList component within a dedicated `/components/TodoList` directory.

### Changed

- Migrated todo rendering logic into the TodoList component.

---

## [0.0.1] - 2025-11-07

### Added

- Placeholder todo data and rendering logic.
- ESLint plugins and configuration.
- Initial CHANGELOG file.

### Changed

- Added initial project README with development and deployment instructions.

### Removed

- Default Vite boilerplate components and styles.

### Fixed

- Typo in the initial README.

---

## [0.0.0] - 2025-11-07

### Added

- Initial React application scaffolded with Vite.
- Prettier configuration.

---

## How to Use This Changelog

### Version Format

- MAJOR.MINOR.PATCH
  - **MAJOR**: Incompatible API changes
  - **MINOR**: Backward-compatible feature additions
  - **PATCH**: Backward-compatible bug fixes

### Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features scheduled for removal
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related updates

<!-- [Unreleased]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.1...HEAD -->

[0.7.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.11...v0.1.0
[0.0.11]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.0...v0.0.1
[0.0.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/releases/tag/v0.0.0
