# Anthropometric Measurements - An Intuitive Visualization (Frontend)

A modern, responsive SPA based on Hannah Bast's excellent [Anthropometric Measurements - An Intuitive Visualization](https://anthro.cs.uni-freiburg.de).

This is intended to be used with the Anthropometric Measurements backend.

## Setting Up

- Ensure `node` is installed - `nvm` is recommended for version control
  - If `nvm` is installed - `nvm use lts/iron` (may need to `nvm install lts/iron` first)
- Set `VITE_HOST_URL` to the location of the backend (`http://localhost:9000` by default)
- `npm run dev` to run in development mode

## Building

- `npm run build` will bundle the source into files that can be statically hosted
  - Currently, we are not using type-aware linting - `npm run typecheck` can be helpful if you are running into build issues
- Once built, the files will be located in the `/dist` directory