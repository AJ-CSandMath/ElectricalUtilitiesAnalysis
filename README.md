# Electrical Utilities App

A modern electrical utilities dashboard. This is a first draft, only visualizing some data for US electrical companies.

## Tech Stack (give or take)

### Frontend
- React.js 
- Axios 
- D3.js (for map visualization)
- (Standard) CSS
- jest-dom (testing library)

### Backend
- Deno 
- Oak (Deno web framework)
- SQLite3
  - _Note: the data itself comes from the two csv files in the data folder, from the [NREL](https://www.nrel.gov/research/data-tools.html)._

### Development Tools
- VS Code, with the Deno extension
- Git

### Environment Variables Required
- PORT
- FRONTEND_PORT
- ENV
- JWT_SECRET
  - Not needed yet.
