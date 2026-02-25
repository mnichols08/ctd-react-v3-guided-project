# Simple React Todo App

A basic todo list application built with React and Vite.

## Features

To be determined

## Technologies Used

- React
- Vite

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Make sure you have Node.js and npm installed.

- Node.js ^20.19.0 or >=22.12.0

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/mnichols08/ctd-react-v3-guided-project.git
   cd ctd-react-v3-guided-project
```

2. Install dependencies:

```bash
   npm install
```

### Running the Development Server

Start the development server with:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173` (or another port if 5173 is already in use).

#### Use the local JSON fixture (offline / no Airtable creds)

If you want to run the app without Airtable credentials or while offline, start Vite with the fixture data source flag:

```bash
npm run dev:fixture
```

This sets `VITE_DATA_SOURCE=fixture`, and the todos hook will serve read/write requests from the bundled `src/test/fixtures/todos.records.json` instead of Airtable. All UI behavior (sorting, filtering, optimistic updates) stays the same.

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run dev:fixture` - Starts the dev server using the local JSON fixture instead of Airtable
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm test` - Runs the test suite with mocked Airtable responses
- `npm run test:watch` - Watches and reruns the mocked test suite on change
- `npm run test:airtable` - Opt-in live check against your Airtable base
- `npm run test:all:airtable` - Run full suite plus the live Airtable check

### Running Airtable integration tests

Live Airtable tests are skipped by default. To run them, supply your Airtable credentials and set the flag that opts into network calls:

```bash
VITE_BASE_ID=your_base_id \
VITE_TABLE_NAME=Todos \
VITE_PAT=your_pat \
npm run test:airtable
```

On PowerShell, use:

```powershell
$env:VITE_BASE_ID="your_base_id"; $env:VITE_TABLE_NAME="Todos"; $env:VITE_PAT="your_pat"; npm run test:airtable
```

The live test performs a read-only fetch to confirm Airtable connectivity. All other tests continue to run against mocked data.

To run the full suite including the live check in one go, use:

```bash
VITE_BASE_ID=your_base_id \
VITE_TABLE_NAME=Todos \
VITE_PAT=your_pat \
npm run test:all:airtable
```

This keeps the standard mocked tests and simply unskips the live Airtable test when the flag and creds are present.
