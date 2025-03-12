# GitHub Project Viewer

A web application that visualizes GitHub repository relationships and dependencies through an interactive graph interface.

## Technical Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![D3.js](https://img.shields.io/badge/d3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)
![HeroUI](https://img.shields.io/badge/HeroUI-4F46E5?style=for-the-badge&logo=heroicons&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
### Backend
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
### API
![GitHub](https://img.shields.io/badge/GitHub_API-181717?style=for-the-badge&logo=github&logoColor=white)

![Landing Page](assets/landing.png)

## Overview

GitHub Project Viewer allows you to explore and visualize GitHub repositories. The application creates interactive network graphs showing relationships between repositories, making it easier to understand project dependencies and connections.
This tool can be particularly useful for quickly showcasing structured Git projects, exploring new libraries, presenting projects. It provides an intuitive visual approach to understanding complex repository relationships and repos dependencies.

![Graph Visualization](assets/graph.png)

![Tree Visualization](assets/tree.png)

## Features

- Interactive network graph visualization of GitHub repositories
- Repository relationship exploration
- Clean and intuitive user interface
- Real-time data fetching from GitHub API

## Limitations
> [!IMPORTANT]  
> GitHub API rate limiting may affect the number of requests possible (50/hours).

> [!IMPORTANT]  
> Large repositories with many dependencies might take longer to load.

> [!NOTE]
> Currently limited to public repositories.

> [!WARNING]  
> Big projects like `facebook/react` may take a lot of time to load and laggy explore depending your zoom.

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Build & run:
```bash
npm run build
npm run start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
