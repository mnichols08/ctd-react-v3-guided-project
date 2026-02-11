# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

<!--

## [Unreleased]

### Added

- ***

### Changed

- ***

### Fixed

- ***

-->

## [0.11.0] - 2026-02-13

### Added

- Add Footer component and place in app layout
- Imports react-router and wraps App component with it
- Add TodosPage and move all Todo components into it
- In Header, add styled nav with Home/About links
- Sets heading based upon browser route
- Add /about and catch-all NotFound routes
- Adds NotFound route and page
- Implements client side pagination

### Changed

- Moves Header into shared components directory

### Fixed

- Fixes accessibility issues where screen reader users were unable to read and understand how to use the app

---

## [0.10.10] - 2026-02-10

### Fixed

- Remove optimistic todos from state when POST request fails (e.g., network offline) to prevent phantom todos that persist until page refresh

---

## [0.10.9] - 2026-02-10

### Fixed

- Moved todo normalization logic from reducer to `useTodos` hook to avoid duplicate processing and ensure both state and cache use the same normalized data

---

## [0.10.8] - 2026-02-10

### Changed

- Wraps html comment in changelog after `---` line and the final bullet
- Within useTodos hook, inside of fetchTodos: uses the normalized todos for both state and cache to avoid redoing this work elsewhere

### Fixed

- Removes `[aria-hidden='true']` from reset.css stylesheet that was hiding the error image on normal screens
- Reset isLoading when cached to prevent stuck UI

---

## [0.10.7] - 2026-02-10

### Added

- Error icon now includes descriptive alt text (`errorMessage` or 'Error icon' fallback) instead of empty string, improving screen reader experience

### Fixed

- Fix typo in entry within 0.6.1 `recafcor` to `refactor`
- In TodoListItem component, fix duplicate startEditing call on Space key

---

## [0.10.6] - 2026-02-10

### Fixed

- Fixes typo in changelog v.0.10.5
- In useTodos hook:
  - In updateTodo, avoid invalid updates and PATCH requests by returning early if original todo is missing
  - In addTodo, prevent clearing an in-flight fetch loading state when a save fails
- In todos reducer, normalize null/undefined isCompleted for consistency
- In TodoListItem component, sync workingTitle with todo.title when idle
- Corrects various formatting inconsistencies across changelog

---

## [0.10.5] - 2026-02-10

### Fixed

- Avoids unintended coercion by using a nullish check on isCompleted within loadTodos action
- In TodoListItem component, extends onKeyDown to handle Space (and preventing default to avoid page scrolling)
- Avoid incorrectly clearing an active loading state by only using the load-specific error action when no load is in progress

---

## [0.10.4] - 2026-02-10

### Added

- In useTodos hook:
  - After finalizing a todo as complete, remove completed todo from completion timers
  - Remove completed todo from completion timers on error

### Changed

- In TodoListItem component:
  - Renames toggleIsEditing to startEditing to improve clarity
  - Makes span accessible by screen readers by setting its role to button and adding an event listener or enter to start editing

### Removed

- Remove unnecessary error handling for missing original todo in update process

### Fixed

- Schedules finalizeComplete only after the PATCH succeeds so a failure can’t permanently drop the item
- Fix background properties in body for consistent styling

---

## [0.10.3] - 2026-02-09

### Changed

- Updated TodoListItem component so entering edit mode on a completed todo immediately marks it incomplete and clears the pending removal timer; canceling the edit restores the completed state and re-arms completion.
- Tracked the todo’s completion state at edit start to safely revert only when appropriate.

### Fixed

- Prevents a single response from overwriting multiple placeholders by tracking the optimistic todo via a unique clientId
- Added createdTime to cached todos so cached results match reducer shape and sorting by createdTime works.
- In updateTodo, implements a guard if the original todo is not found to skip the revert to avoid reducer errors.
- Differentiates read vs write requests to avoid flipping the saving indicator during data fetches.
- Prevents reducer errors by guarding against missing originalTodo during updateTodo reverts, avoiding invalid editedTodo dispatches when UI state is stale or items are removed.
- Prevent invalid Airtable formulas by safely escaping quotes and special characters in queryString when interpolating into SEARCH(). Now only query parameter values are encoded instead of the entire URL.

---

## [0.10.2] - 2026-02-08

### Added

- Correctly clears the query string if the workingTodoTitle changes

### Changed

- Adds a temporary fake id to newly created optimistic todo

### Fixed

- Fixes todo creation by removing `crypto.randomUUID`
- Refactors entire app to utilize TodosContext correctly

---

## [0.10.1] - 2026-02-07

### Added

- Implements TodosContext to wrap the App with useTodos Hook logic.

### Changed

- Compresses images for better performance
- Refactor App component to use TodosContext for state management
- Refactor useTodos and todos.reducer to manage all state properties and actions
- Improves comments within hook and context files

### Fixed

- Fixes updateTodo so that an edited todo remains incomplete
- Remove aria-hidden attribute from error image in ErrorMessage component
- Enhance checkbox styling for consistent appearance and alignment

---

## [0.10.0] - 2026-02-05

### Added

- Introduces a todos reducer with actions and initial state to centralize todo state management

### Changed

- Refactors `useTodos` to rely on `useReducer` for state updates and improved error handling
- Destructures `todoList` from `todosState` to align with the reducer-driven shape

### Fixed

- Restores sorting by passing `sortField` and `sortDirection` props through to `TodoList`

---

## [0.9.3] - 2026-02-05

### Added

- Adds empty `alt` tag and `aria-hidden` set to true within ErrorMessage component

### Changed

- Cleans up CSS modules, removing unnecessary globals
- Restructures TodoListItem component to render a `li` at the root instead of a `form`

### Removed

- Removes TodosViewForm.styles.css
- In TodoListItem component, removes `span.checkboxIcon` from within `label.checkboxButton`
- Removes unused imports from App.jsx

---

## [0.9.2] - 2026-02-01

### Added

- Applies inline comments to components and obscure CSS
- Adds useTodos hook for consolidating functions within App

### Changed

- Adds more width to line on "checked box" image
- Renames `FlexContainer` to a more semantic `ErrorContent`
- Refactors `App.jsx` to leverage new useTodos hook

---

## [0.9.1] - 2026-01-26

### Added

- Adds `--host` to `dev` script, allowing network access while in development mode
- Adds CSS to module TodoListItem that styles the checkbox with custom imagry
- Within global app.css, utilizes the `#root` selector to set `user-select` to none
- Allows user to uncheck by adding a 3500ms delay before removing the task from state

---

## [0.9.0] - 2026-01-24

### Added

- Assigns font-families for headings
- Declares `styled-components` and `babel-plugin-styled-components` as a dependency
- Within TextInputWithLabel, converts label and input into styled components
- Within TodoForm and TodosViewForm, converts form into a styled component
- Adds background-attachement: fixed to root of App
- Wraps App in `StyledAppWrapper`, centering with CSS grid
- Adds favicons for different screens and webmanifest
- Adds a StyledLogo inside of h1 at top of App component
- Adds a Header component that accepts properties for setting the logo and displayed text
- Creates an ErrorMessage component with both CSS module and styled components
- Adds a very subtle background image to application

### Changed

- Changes body backgound to a linear gradient
- For App, TodoList, and TodoListItem, utilizes CSS modules to import styles
- Moves CSS into TodoListItem CSS module from TodoList stylesheet.
- Refactors Header component to move image outside of h1 tag
- Inside of TodoList module, refactor individual todos to be tighter together
- Restores App.module.css to App.css and imports into index.css

### Removed

- Removes imported stylesheet files from TodoForm and TodosViewForm
- Cleans up CSS within TodoList.module.css

---

## [0.8.3] - 2026-01-31

### Fixed

- Restores input functionality by providing a function called clearQueryString

## [0.8.2] - 2026-01-27

### Removed

- Removes redundant isStillSaving fields on newly created todos
- Removes functions clearWorkingTodoTitle and clearQueryString
- Removes sorting functionality at the create todo input

---

## [0.8.1] - 2026-01-23

### Added

- Adds a cached todoList to limit API even more

### Fixed

- Fixes debounce feature within TodosViewForm
- Sets isStillSaving to false after successful fetch

---

## [0.8.0] - 2026-01-21

### Added

- Add useState to TodosViewForm for localQueryString to have a state, then refactors search input and clear button
- Implements a debouncer inside of TodosViewForm that throttles the amount of API calls while using the search filter
- Adds filtering out completed todo logic directly into encodeUrl

### Changed

- Wraps encodeUrl in a useCallback hook and places inside the App component

### Fixed

- Fixes User Experience by clearing the queryString when creating a new Todo

---

## [0.7.3] - 2026-01-14

### Fixed

- Uses useMemo instead of useState + useEffect to avoid unnecessary state updates and re-renders.
- Fixes typo `new Date().getISOString()` to `new Date().toISOString()`
- Utilizes `BASE_URL` instead of redeclaring it
- Adds id of `search-control` to input for searching todos
- Resets the queryString as well as the workingTodoTitle when clear button is pressed within TodosViewForm

---

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

## [0.6.2] - 2026-01-19

### Changed

- Removes the createdTime from optimistic todo created from addTodo
- Removes unnecessary check on whether or not the first record returns in id or not. In theory it will always be provided so the message is redundant.

---

## [0.6.1] - 2026-01-19

### Fixed

- Fixes bug where an added todo could not be completed. A previous refactor was retracting the logic to set state after adding a new todo, which resulted in local state not having the correct ID within the 'optimistic' todos.
- Applies styles akin to rest of app for the error message button

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

- Updates week 03 props and state to a minor patch 0.2.0
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

- Implements handleUpdate and handleCancel helper functions to allow users to manipulate state and add, update, cancel updating, or completing todos.
- Creates a new submodule for the second assignment
- In TodoListItem component, properly forward ref to input element, using additional helper function toggleIsEditing, and introducing useEffect to change the focus based on the inputRef
- Within TodoListItem component, passes in an elementId and label into TextInputWithLabel to improve semantics
- Initial implementation of TodosViewForm for sorting and direction control.
- Integration of sortField and sortDirection state into the App component.

### Removed

- Removes redundant id when setting the updated todos inside of TodoListItem component
- Removes wrapper functions from onClick handlers within TodoListItem component

### Changed

- Refined TodosViewForm layout and styling to align with the rest of the application.
- Converts update button from a normal button to a submit button while removing the onClick handler within TodoListItem
- Improves semantics of TextInputWithLabel by changing the argument name of label to labelText
- Refined TodosViewForm layout and styling to align with the rest of the application.

---

## [0.0.8] - 2025-12-23

### Added

- Adds ternary statement that will render a paragraph calling the user to add a todo in order to get started using the app
- Todos can be marked as completed
- Prevents empty todos from being added by conditionally disabling the add todo button based on length of workingTodoTitle
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
- Uses crypto API to generate unique ID rather than creating a timestamp, which could cause duplicate IDs if used in rapid succession.
- Fixes casing typo while linking Stylesheets within TodoList and TodoForm components
- Passes in a value of null into useRef instead of an empty string
- In App.jsx, corrects `errMessage` typo as `errorMessage`, displaying the correct message within fetchTodos, addTodos and completeTodo functions
- Corrects CSS to reflect submit button after changing jsx for semantics within TodoListItem component
- Setting errorMessage to undefined is inconsistent with its initial state of empty string. Using empty string '' for consistency.
- Empty template literal is unnecessary. Changes ternary to an AND evaluation
- Corrects the application to be have a truly "optimistic" UI by prematurely updating the state before communicating with the server.
- Remove unnecessary spread operator in fetchTodos
- Corrects how errors are being logged
- Improves performance by declaring url, headers, and token at the top level
- Prevents potential null reference error by declaring a firstRecord variable and throwing an error if not found
- Removes stray '75' string from TodoListItem component
- Corrects a typo for updateTodo error message
- Prevent potential stale closure issues by adding createRequest to the dependency array of the useEffect that calls fetchTodos.

### Changed

- In App.jsx, moves utility functions createPayload and getErrorMessage outside of App component in order to improve performance
- Improves error handling by handling catch blocks within createRequest
- Removes logic to set state pessimisticly and refrains from doing so in each request fuction

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

- Applies some basic styling to App
- Migrate logic from app to a separate TodoList component
- Provide a simple stylesheet for TodoList component
- TodoList component created within a directory structure of `/components/TodoList`
- Import statement into app and applies an instance within the main app.jsx

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

[0.11.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.9...v0.11.0
[0.10.10]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.9...v0.10.10
[0.10.9]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.8...v0.10.9
[0.10.8]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.7...v0.10.8
[0.10.7]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.4...v0.10.5
[0.10.4]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.9.0...v0.9.2
[0.9.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.8.1...v0.9.0
[0.8.3]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.8.2...v0.8.3
[0.8.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.7.3...v0.8.0
[0.7.3]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.6.0...v0.7.0
[0.6.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.6.0...v0.6.1
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
