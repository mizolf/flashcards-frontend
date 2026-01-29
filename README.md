# deckr.

A modern flashcard application for effective learning through spaced repetition.

## Features

- **Browse Public Decks** - Explore and study flashcard decks shared by other users
- **Create Your Own Decks** - Build custom flashcard decks with public or private visibility
- **Practice Mode** - Test your knowledge with interactive flashcard sessions
- **Quick Learn** - Rapid learning mode for efficient study sessions
- **Difficulty Tracking** - Cards are rated by difficulty to optimize your learning
- **Pagination & Filtering** - Easily navigate through large collections of decks
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Angular 18** - Modern web framework
- **PrimeNG 18** - Rich UI component library
- **Tailwind CSS 3** - Utility-first CSS framework
- **TypeScript 5.5** - Type-safe JavaScript
- **RxJS** - Reactive programming

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- Angular CLI (optional, for additional commands)

```bash
npm install -g @angular/cli
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flashcards-frontend
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

## Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm start`     | Start development server |
| `npm run build` | Build for production     |
| `npm run watch` | Build with watch mode    |
| `npm test`      | Run unit tests           |

## Backend API

This frontend application requires a backend API server to function. Make sure to clone and run the backend first:

**Backend Repository:** [backend-java-springboot](https://github.com/mizolf/web-backend-springboot)

Follow the backend README instructions to start the server before running this frontend application.

## License

This project is private.
