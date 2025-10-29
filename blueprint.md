# Project Blueprint

## Overview

This document outlines the architecture, features, and development plan for the "Concert" application. It serves as a single source of truth for all development activities, ensuring consistency and alignment with the project's goals.

## Implemented Features

*   **Firebase Integration:**
    *   The project is connected to a Firebase project with the ID `concert-e249e`.
    *   Firestore is configured as the primary database.
    *   Firebase configuration is stored in `src/services/firebase.js`.
*   **Routing and Navigation:**
    *   `react-router-dom` is used for client-side routing.
    *   A persistent `Navbar` component allows users to navigate between the "Shows" and "Budget" pages.
*   **Project Structure:**
    *   The project follows a modular structure with dedicated directories for pages (`src/pages`), components (`src/components`), and services (`src/services`).
*   **Shows Page:**
    *   Located at `src/pages/Shows.jsx`.
    *   Displays a grid of upcoming shows, dynamically fetched from the `shows` collection in Firestore.
    *   Includes a loading state while data is being fetched and a message for when no shows are available.
*   **Budget Page:**
    *   Located at `src/pages/Budget.jsx`.
    *   Displays a table of budget categories, dynamically fetched from the `budgetCategories` collection in Firestore.
    *   Includes a loading state while data is being fetched.
*   **Database Seeding:**
    *   A script at `scripts/seed.js` is available to populate the `budgetCategories` collection in Firestore with initial data.

## Development Summary

The application has been refactored to support multiple pages using `react-router-dom`. The main `App.jsx` now acts as a router, and the "Shows" and "Budget" functionalities have been moved to their own page components within the `src/pages` directory. Both pages now fetch their data dynamically from Firestore, and the local data for budget categories has been removed in favor of a database-driven approach, complete with a seeding script. A navigation bar has been added to provide a clear and consistent way for users to move between different sections of the application.
