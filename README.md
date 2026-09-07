# Smart Market Watchlist

A market monitoring system that goes beyond a traditional stock watchlist by identifying which stocks deserve the user's attention.

Instead of simply displaying current prices, the system maintains a user-specific checkpoint, detects meaningful changes since the previous check, validates market data freshness, assigns an attention level, and preserves historical market observations.

## Problem

Traditional watchlists primarily answer:

"What is the current price of my stocks?"

However, when monitoring multiple stocks, the more useful question is:

"What changed since I last checked, and what actually deserves my attention?"

A user should not have to manually compare every stock every time they return to the application.

Smart Market Watchlist addresses this by treating each market check as a checkpoint and prioritizing stocks according to the magnitude of their movement.

## Solution

LIVE : https://smart-market-watchlist-snowy.vercel.app/

Smart Market Watchlist provides a personalized market monitoring workflow:

- Users create and manage their own watchlist.
- The application fetches the latest market information.
- Market data is validated before being used.
- The current price is compared against the user's previous checkpoint.
- The system calculates absolute and percentage price changes.
- Changes are converted into an attention level.
- The reason behind the attention level is surfaced to the user.
- Market observations are persisted as snapshots.
- Users can return later and inspect historical price observations.

The goal is not to build another stock-price dashboard.

The goal is to reduce the amount of manual monitoring required from the user.

## ScreeShot
<img width="2940" height="1648" alt="image" src="https://github.com/user-attachments/assets/a6a2057a-bcc2-4ec0-9c01-5a01b2348916" />
Screenshot of the Dashboard of a particular user, after adding the stocks the changes are visible on each stock.


## Key Features

### Personalized Watchlist

Users can:

- Add stocks using their symbol and company name
- View their personal watchlist
- Prevent duplicate stocks
- Remove stocks from the watchlist
- Persist their watchlist across sessions

Each watchlist is associated with the authenticated user.

### Latest Market Information

Market information is fetched using Yahoo Finance.

The system surfaces information such as:

- Current price
- Previous close
- Price change
- Percentage change
- Currency
- Exchange
- Market state
- Market timestamp
- Data freshness status

For Indian stocks, symbols are normalized to NSE-compatible Yahoo Finance symbols.

Example:

`INFY` → `INFY.NS`

### Attention Prioritization

The central idea of the application is the attention model.

Instead of treating every stock equally, the system evaluates how much the stock has moved since the previous checkpoint.

#### Attention Levels
| Price Movement | Attention Level | Score |
| --- | --- | --- |
| First check | LOW | 0 |
| No movement | LOW | 0 |
| Less than 2% | LOW | 1 |
| 2% to less than 5% | MEDIUM | 2 |
| 5% or more | HIGH | 3 |

The absolute percentage movement is used so that both upward and downward movements can trigger attention.

For example:

₹1,000 → ₹1,040

results in:

+4.00%

and therefore:

MEDIUM attention

The system also provides an explanation such as:

Price increased by 4.00% since last check.

This makes the prioritization explainable rather than presenting an unexplained score.

### Checkpoint-Based Change Detection

A key product decision is that changes are measured against the user's previous checkpoint, rather than only against the previous market close.

The flow is:

Previous Checkpoint → Current Market Data → Change Detection → Attention Score

For example:

Previous checkpoint: ₹1,000

Current price: ₹1,052

Change: +₹52

Change: +5.20%

Attention: HIGH

This allows the application to answer:

"What changed since I last checked?"

rather than only:

"What changed today?"

### Market Data Validation

External market data can be delayed, unavailable, or incomplete.

The application therefore validates market data before treating it as usable.

The validation layer checks whether:

- Market data exists
- Current price is available
- The market timestamp is valid
- The data is sufficiently recent

Invalid or stale data is not treated as a normal market movement.

Instead, the system surfaces the corresponding data status and avoids generating a misleading attention score.

This prevents unreliable external data from being presented as a meaningful market signal.

### Historical Market Snapshots

Every valid market check can be persisted as a market snapshot.

Snapshots contain information such as:

- User
- Stock symbol
- Current price
- Previous close
- Market state
- Market timestamp
- Capture timestamp

Duplicate snapshots for the same user, stock, and market timestamp are avoided.

This allows users to return later and inspect historical observations instead of losing the previous state after a refresh.

### Acknowledgement Model

The system separates:

"The market changed"

from

"The user has seen/acknowledged the change."

This allows the application to maintain a meaningful checkpoint for future comparisons.

The user can acknowledge the current set of changes and continue monitoring from that state.

## Architecture

The application follows a simple full-stack architecture.

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │                     │
                    │  Dashboard          │
                    │  Watchlist          │
                    │  Price History      │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Node.js + Express │
                    │                     │
                    │ Controllers         │
                    │ Services            │
                    │ Authentication      │
                    │ Validation          │
                    └───────┬─────┬───────┘
                            │     │
                 ┌──────────┘     └─────────────┐
                 ▼                              ▼
        ┌─────────────────┐             ┌─────────────────┐
        │    MongoDB      │             │  Yahoo Finance  │
        │                 │             │                 │
        │ Watchlist       │             │ Market Quotes   │
        │ Snapshots       │             │ Market State    │
        │ User State      │             │ Timestamps      │
        └─────────────────┘             └─────────────────┘
```

## Backend Structure

The backend separates responsibilities between controllers, models, and services.

```text
backend/
├── controllers/
│   ├── watchlistController.js
│   └── snapshotController.js
│
├── models/
│   ├── Watchlist.js
│   ├── MarketSnapshot.js
│   └── User.js
│
├── services/
│   ├── marketDataService.js
│   ├── attentionService.js
│   └── validationService.js
│
├── routes/
│   ├── watchlistRoutes.js
│   └── snapshotRoutes.js
│
├── middleware/
│   └── authentication middleware
│
└── server.js
```

The exact folder names may vary depending on the final repository structure.

## Core Backend Components

### Market Data Service

`marketDataService.js`

Responsible for:

- Normalizing stock symbols
- Fetching market quotes
- Extracting relevant market information
- Returning a consistent market data object
- Handling external API failures
### Attention Service

`attentionService.js`

Responsible for converting price movement into an explainable attention result.

It returns:

- Attention level
- Attention score
- Reasons

This keeps business logic separate from HTTP controllers.

### Watchlist Controller

`watchlistController.js`

Responsible for:

- Adding stocks
- Fetching a user's watchlist
- Preventing duplicate stocks
- Removing stocks

All watchlist operations are scoped to the authenticated user.

### Snapshot Controller

`snapshotController.js`

Responsible for:

- Checking the watchlist
- Fetching current market data
- Validating the data
- Comparing it against the previous checkpoint
- Creating market snapshots
- Calculating attention
- Returning changes to the frontend
- Acknowledging changes

### Data Persistence

MongoDB is used to persist application state.

### Watchlist State

A watchlist entry maintains information such as:

- User
- Symbol
- Company name
- Last checked price
- Last checked state
- Creation timestamp

This allows the system to preserve the user's monitoring state across sessions.

### Market Snapshots

Historical observations are stored separately so that current state and historical data are not mixed together.

This allows the dashboard to display a price history for each stock.

## Handling Edge Cases

The system explicitly considers several failure scenarios.

### First Check

There is no previous checkpoint.

The system does not invent a price change.

Instead:

- Attention = LOW

- Score = 0

- Reason = First market check

### No Price Movement

If the current price is unchanged:

- Attention = LOW

- Score = 0

This prevents unchanged stocks from unnecessarily demanding attention.

### Stale Market Data

If the market timestamp indicates that the data is stale, the system marks the data accordingly instead of calculating a potentially misleading movement.

### Missing Market Price

If the external provider does not return a valid current price, the market observation is treated as invalid.

### Duplicate Snapshots

The system checks for an existing snapshot using the same:

`User + Stock + Market Timestamp`

before creating a new snapshot.

This prevents repeated checks from unnecessarily creating identical historical observations.

### External Provider Failure

Market data retrieval is isolated inside the market data service.

If the external provider fails, the error is handled by the backend instead of exposing provider-specific failures directly to the frontend.

## Authentication & User Isolation

The application uses authenticated user sessions to ensure that watchlist operations are user-specific.

Watchlist queries are scoped using the authenticated user's ID.

This means one user cannot access another user's watchlist through normal application operations.

## Frontend

The frontend is built with React.

The dashboard provides:

- Add Stock form
- Personalized watchlist
- Current market information
- Attention level
- Attention score
- Attention reasons
- Data freshness status
- Check for Changes
- Acknowledge Changes
- Remove Stock
- Price History

The UI is designed around information hierarchy rather than showing every available market field with equal importance.

## Technology Stack

### Frontend
- React.js
- React Router
- CSS
- JavaScript
### Backend
- Node.js
- Express.js
- REST APIs
- JWT-based authentication
### Database
- MongoDB
- Mongoose
### Market Data
- Yahoo Finance
### Development Tools
- Git
- GitHub
- VS Code
- Postman
## API Overview

### Authentication

Authentication endpoints handle user registration and login.

### Watchlist

`POST /watchlist`

Adds a stock to the authenticated user's watchlist.

`GET /watchlist`

Returns the authenticated user's watchlist.

`DELETE /watchlist/:symbol`

Removes a stock from the authenticated user's watchlist.

### Market Monitoring

`GET /snapshot/check`

Checks the user's watchlist against the latest available market data.

The response contains:

- Current prices
- Previous checkpoint prices
- Price changes
- Percentage changes
- Attention levels
- Attention scores
- Reasons
- Data status
- Market state
- Market timestamps
### Price History

`GET /snapshot/history/:symbol`

Returns historical market observations for a stock.

### Acknowledge Changes

`POST /snapshot/acknowledge`

Acknowledges the currently detected changes and establishes the next monitoring checkpoint.

## Running Locally

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB or a MongoDB Atlas database
- Git
### Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```
### Backend Setup
```bash
cd backend
npm install
```

Create the backend environment configuration required by the application.

Example:

```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
```

Start the backend:

```bash
npm start
```
### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will then be available through the local Vite development server.

## Design Decisions

### Why checkpoint-based monitoring?

A traditional watchlist often requires users to repeatedly scan all their stocks.

This application instead asks:

What changed since the user last checked?

This makes the system more useful for monitoring rather than simply displaying information.

### Why percentage-based thresholds?

Absolute price changes are not directly comparable across stocks.

For example:

₹10 movement on a ₹100 stock = 10%

while:

₹10 movement on a ₹2,000 stock = 0.5%

Using percentage movement provides a more meaningful basis for attention prioritization.

### Why explain the attention score?

A score without an explanation can feel arbitrary.

The system therefore returns reasons alongside the attention level.

This makes the prioritization:

- Explainable
- Auditable
- Easier to understand
- Easier to extend
### Why not continuously poll the market?

Continuous polling would add unnecessary complexity for the core problem.

The system instead uses user-triggered checkpoints.

This keeps the architecture simple while directly supporting the requirement:

Return later and see what has changed.

It also avoids overwhelming users with insignificant market movements.

### Why keep the architecture simple?

The goal is not to build a complete trading platform.

The application focuses on one core problem:

Helping users identify which watchlist stocks deserve attention.

The architecture therefore uses a conventional React + Node.js + MongoDB stack with clearly separated services and controllers instead of introducing unnecessary infrastructure.

## Scalability Considerations

The current architecture is intentionally simple, but several decisions support future growth.

### User-Scoped Queries

Watchlist and snapshot operations are scoped to the authenticated user.

### Snapshot Indexing

Market snapshots can be indexed around:

`user + symbol + capturedAt`

to efficiently retrieve historical observations and prevent duplicate entries.

### Service Separation

Market data retrieval and attention calculation are isolated into services.

This makes it possible to later replace or extend:

- Market data providers
- Attention rules
- Validation logic

without rewriting the entire application.

### Future Scaling

For significantly larger watchlists and user populations, the market-data checking workflow could be moved to background jobs with caching and controlled provider requests.

The current implementation deliberately avoids this complexity until the scale requires it.

## Future Improvements

Potential extensions include:

- Volume-based attention signals
- Volatility-aware thresholds
- Multiple market-data providers
- Background market monitoring
- Configurable user thresholds
- Intraday charts
- More advanced anomaly detection
- Market-wide event detection
- Caching to reduce repeated external API requests

These are intentionally outside the current core scope.

## What Makes This Different?

Most basic watchlists answer:

"What are my stocks worth?"

Smart Market Watchlist answers:

"What changed since I last checked, and which change deserves my attention?"

The key design principle is:

Market Data → Validation → Checkpoint Comparison → Attention Prioritization → Explanation → Historical Persistence

This transforms a passive watchlist into an attention-oriented monitoring system.

## Project Goals

The application was designed around the following principles:

- Useful over obvious
- Explainable over opaque
- Reliable over feature-heavy
- Persistent over session-dependent
- Simple over unnecessarily complex

The objective is not to predict the market.

The objective is to help users notice meaningful changes faster.

## License

This project was developed as a hackathon submission.
