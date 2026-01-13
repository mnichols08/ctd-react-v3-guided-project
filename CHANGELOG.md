# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased]

### Added
-

### Changed
-  -->

## [0.4.0] - 2025-01-13
- Bumps week 05 conditional rendering to minor version v0.4.0

## [0.3.0] - 2025-01-13
## Changed
- Bumps week 04 basic hooks minor version to v0.3.0

## [0.0.11] - 2026-01-12

### Added

- Migrates lesson and assignment into submodule
- Applies styles akin to rest of app for the error message button
- Creates an encodeUrl utility function and uses within createRequest to maintain consistent sorting direction and sorted by fields
- Builds a new TodosViewForm for changing the sort parameters that:
  - Has two labels, one for sort-by and another for direction.
    - Each one has associated select inputs
      - The first one with options for sorting by Title, or Time Created
      - The second for picking whether to sort ascending or descending
- Imports TodosViewForm into app and places it underneath the TodoList component
- Passes properties of sortField, setSortField, sortDirection, setSortDirection into TodosViewForm from app
- Destructures `sortDirection`, `setSortDirection`, `sortField`, and `setSortField` out of the component's props.

### Changed

- Restructures JSX for TodosViewForm to wrap form in a class of todos-view-form to prevent styles from leaking and adds a divider

## [0.0.10] - 2026-01-11

### Added

- Adds environment variable example file for Airtable fields, and attach personal credentials to it.
- Establishes a transition state by declaring errorMessage and isLoading state variables
- Adds fetchTodos helper function to read from Airtable database to establish up to the date state
- Passes isLoading into TodoList component and conditionally renders a loading message while async code is running
- Creates a conditional error message paragraph with a dismiss button at the bottom of the page
- Connects Airtable to Add New Todo functionality, complete with an isSaving state
- Builds functionality for editing todos with an optimistic UI
- Finalizes CRU(-D) Operations, adding functionality for completing tasks
- Minimizes repeated code by creating a headers variable and helper functions
- Migrates setIsSaving instances into helper function
- Creates a helper function for setting error messages with more user friendly messages
- Improves styling for edit/cancel interface
- Refactors code for each request helper to change state with failsafes
- Restyles TodoListItem so that user cannot accidently complete task by clicking on the label (which used to wrap entire list item)
- Imports useCallback to optimize createPayload in order to reduce unnecessary rerenders.
- Stabilizes headers variable by importing and utilizing useMemo
- Adds a guard clause to prevent the app from crashing if somehow an originalTodo is not found (which is theoretically impossible but a good practice)

## [0.0.7] - 2025-12-23
### Fixed

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

## [0.0.9] - 2026-01-10

### Added

- Implements handleUpdate and handleCancel helper functions to allow users to manipulate state and add, update, cancel updating, or completing todos.
- Creates a new submodule for the second assignment
- In TodoListItem component, properly forward ref to input element, using additional helper function toggleIsEditing, and introducing useEffect to change the focus based on the inputRef
- Within TodoListItem component, passes in an elementId and label into TextInputWithLabel to improve semantics

### Removed

- Removes redundant id when setting the updated todos inside of TodoListItem component
- Removes wrapper functions from onClick handlers within TodoListItem component

### Changed

- Converts update button from a normal button to a submit button while removing the onClick handler within TodoListItem
- Improves semantics of TextInputWithLabel by changing the argument name of label to labelText
- Removes redundant id when setting the updated todos inside of TodoListItem component
- Removes wrapper functions from onClick handlers within TodoListItem component

### Changed
- Converts update button from a normal button to a submit button while removing the onClick handler within TodoListItem
- Improves semantics of TextInputWithLabel by changing the argument name of label to labelText

## [0.2.0] - 2025-01-13

### Changed
- Updates week 03 props and state to a minor patch 0.2.0

## [0.1.0] - 2025-01-13

### Changed
- Updates week 02 code to a minor patch 0.1.0

## [0.0.8] - 2025-12-23

### Added

- Adds ternary statement that will render a paragraph calling the user to add a todo in order to get started using the app
- Todos can be marked as completed
- Prevents empty todos from being added by conditionally disabling the add todo button based on length of workingTodoTitle

### Changed

- Form is converted from a basic form to a controlled component

## [0.0.7] - 2025-12-23

### Fixed

- Uses crypto API to generate unique ID rather than creating a timestamp, which could cause duplicate IDs if used in rapid succession.
- Fixes casing typo while linking Stylesheets within TodoList and TodoForm components
- Passes in a value of null into useRef instead of an empty string

## [0.0.6] - 2025-12-18

### Added

- Utilizes new hooks useRef, useState to manage state and allow users to create new Todos

## [0.0.5] - 2025-12-09

### Added

- Adds a TodoListItem component and stylesheet that renders a list item, take in properties passed into it.

### Changed

- Migrates stylesheet for li into new stylesheet for TodoListItem
- Updates TodoList component to import new TodoListItem component and renders it, passing in the properties of the todos

## [0.0.4] - 2025-11-22

### Fixed

- Fixes a typo in TodoList.jsx file to update inconsistent casing in import.
- Corrects merge conflict within submodule within `main` branch.

## [0.0.3] - 2025-11-15

### Added

- Adds disclaimer to Index.css to indicate that the styles are created with AI assistance
- Adds a reset.css file to ensure consistent styles across browsers
- Adds a stylesheet for TodoForm component
- Creates a TodoForm component by following the steps provided in the assignment

### Changed

- Updates index.css to import App.css
- Updates TodoList component for better accessibility
- Updates title and adds a meta description to index.html
- Adds a className to h1 of 'todos-title', that centers the title on screen
- Imports TodoList stylesheet into component

### Fixed

- Fixes a typo in TodoList component that was using class instead of className
- Removes older styles associated with a rebase which brought them back

## [0.0.2] - 2025-11-15

### Added
- Applies some basic styling to App
- Migrate logic from app to a separate TodoList component
- Provide a simple stylesheet for TodoList component
- TodoList component created within a directory structure of `/components/TodoList`
- Import statement into app and applies an instance within the main app.jsx

### Changed

- Migrates the todos array and render logic into the new TodoList component

## [0.0.1] - 2025-11-07

Project cleanup and further initialization

### Added

- Creates an array of todos to act as placeholder data
- Maps over the introduced todos and renders them on screen
- Installs and configures extra eslint plugins
- Initialized CHANGELOG file to keep track of changes in an organized manner

### Changed

- Updates the README with an initial document to briefly describe the project and how to install and develop or deploy the application

### Removed

- Cleans up initial Vite components and styles

### Fixed

- Fixes a typo that was introduced while writing the initial README

## [0.0.0] - 2025-11-07

Initial project scaffolding with Vite

### Added

- Initialize React Application with Vite
- Installs and configures prettier

## How to Use This Changelog

### Version Format

- Use [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH
  - **MAJOR**: Incompatible API changes
  - **MINOR**: Add functionality in a backward compatible manner
  - **PATCH**: Backward compatible bug fixes

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security updates

### Example Entry

```markdown
## [1.1.0] - 2025-11-07

Brief version description

### Added

- Task filtering by status (all, active, completed)
- Local storage persistence for tasks

### Fixed

- Bug where completed tasks could be edited
- Styling issue on mobile devices
```

<!-- [Unreleased]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.1...HEAD -->

[0.0.4]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.0...v0.0.1
[0.0.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/releases/tag/v0.0.0
