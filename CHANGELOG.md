# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased]

### Added
-

### Changed
-  -->

## [0.0.4] - 2025-12-09
### Added
- Adds a TodoListItem component and stylesheet that renders a list item, take in properties passed into it.

### Changed
- Migrates stylesheet for li into new stylesheet for TodoListItem

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
[0.0.3]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/mnichols08/ctd-react-v3-guided-project/compare/v0.0.0...v0.0.1
[0.0.0]: https://github.com/mnichols08/ctd-react-v3-guided-project/releases/tag/v0.0.0
