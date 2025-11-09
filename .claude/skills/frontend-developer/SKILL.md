---
name: frontend-developer
description: Expert frontend development skill specializing in React 19+, Next.js 15+, and modern web technologies. This skill should be used when building user interfaces, implementing responsive layouts, handling client-side state management, optimizing performance, ensuring accessibility, or working with modern frontend architectures. Use PROACTIVELY for any UI component creation or frontend development tasks.
---

# Frontend Development Expert

## Overview

This skill provides comprehensive expertise in modern frontend development, mastering React 19, Next.js 15, and cutting-edge web application architecture. It enables the creation of performant, accessible, and scalable user interfaces with both client-side and server-side rendering patterns.

## Core Capabilities

### 1. Modern React Expertise
Master React 19 features and advanced patterns:
- React Server Components (RSC) and streaming with Suspense
- Advanced hooks: useActionState, useOptimistic, useTransition, useDeferredValue
- Concurrent rendering and performance optimization
- Component architecture with React.memo, useMemo, useCallback
- Custom hooks and error boundaries
- React DevTools profiling and optimization

### 2. Next.js & Full-Stack Integration
Expert-level Next.js 15 development:
- App Router with Server and Client Components
- Server Actions for seamless data mutations
- Advanced routing: parallel routes, intercepting routes, route handlers
- Incremental Static Regeneration (ISR) and dynamic rendering
- Edge runtime and middleware configuration
- Image optimization and Core Web Vitals
- API routes and serverless function patterns

### 3. Modern Frontend Architecture
Build scalable application architectures:
- Component-driven development with atomic design
- Micro-frontends and module federation
- Design system integration and component libraries
- Build optimization with Webpack 5, Turbopack, Vite
- Progressive Web App (PWA) implementation
- Service workers and offline-first patterns

### 4. State Management & Data Fetching
Implement robust state solutions:
- Modern state management: Zustand, Jotai, Valtio
- React Query/TanStack Query for server state
- SWR for data fetching and caching
- Context API optimization and provider patterns
- Redux Toolkit for complex state scenarios
- Real-time data with WebSockets and Server-Sent Events

### 5. Styling & Design Systems
Create beautiful, maintainable UI:
- Tailwind CSS with advanced configuration and plugins
- CSS-in-JS: emotion, styled-components, vanilla-extract
- CSS Modules and PostCSS optimization
- Design tokens and theming systems
- Responsive design with container queries
- Animation libraries: Framer Motion, React Spring
- Dark mode and theme switching patterns

### 6. Performance & Optimization
Ensure optimal user experience:
- Core Web Vitals optimization (LCP, FID, CLS)
- Advanced code splitting and dynamic imports
- Image optimization and lazy loading strategies
- Font optimization and variable fonts
- Memory leak prevention and monitoring
- Bundle analysis and tree shaking
- Service worker caching strategies

### 7. Accessibility & Inclusive Design
Build accessible applications:
- WCAG 2.1/2.2 AA compliance implementation
- ARIA patterns and semantic HTML
- Keyboard navigation and focus management
- Screen reader optimization
- Color contrast and visual accessibility
- Accessible form patterns and validation

### 8. Testing & Quality Assurance
Ensure code quality and reliability:
- React Testing Library for component testing
- Jest configuration and advanced testing patterns
- End-to-end testing with Playwright and Cypress
- Visual regression testing with Storybook
- Performance testing and lighthouse CI
- Accessibility testing with axe-core
- Type safety with TypeScript 5.x

### 9. Developer Experience & Tooling
Optimize development workflows:
- Modern development workflows with hot reload
- ESLint and Prettier configuration
- Husky and lint-staged for git hooks
- Storybook for component documentation
- GitHub Actions and CI/CD pipelines
- Monorepo management with Nx, Turbo, or Lerna

### 10. Third-Party Integrations
Integrate external services:
- Authentication: NextAuth.js, Auth0, Clerk
- Payment processing: Stripe, PayPal
- Analytics: Google Analytics 4, Mixpanel
- CMS: Contentful, Sanity, Strapi
- Database: Prisma, Drizzle
- Email services and notification systems

## Workflow Approach

When implementing frontend features, follow this systematic approach:

1. **Analyze Requirements** - Understand user needs, performance requirements, accessibility constraints
2. **Choose Architecture** - Select appropriate patterns (RSC vs Client Components, state management approach)
3. **Implement Components** - Build with TypeScript, proper props typing, and accessibility
4. **Add Styling** - Use Tailwind CSS with responsive design and theme support
5. **Optimize Performance** - Implement code splitting, lazy loading, and Core Web Vitals optimization
6. **Test Thoroughly** - Unit tests, integration tests, accessibility testing
7. **Document Usage** - Storybook stories, component documentation, usage examples

## Best Practices

- **Performance First**: Always consider Core Web Vitals and user experience
- **Accessibility by Default**: Build WCAG-compliant components from the start
- **Type Safety**: Use TypeScript for all components and interfaces
- **Mobile-First**: Implement responsive design with mobile-first approach
- **SEO Optimization**: Proper meta tags, semantic HTML, and SSR/SSG considerations
- **Error Boundaries**: Implement comprehensive error handling and loading states
- **Progressive Enhancement**: Ensure functionality works without JavaScript

## Example Interactions

This skill should be used for requests like:
- "Build a React component with Server Actions for form handling"
- "Create an accessible data table with sorting and filtering"
- "Optimize this Next.js page for better Core Web Vitals scores"
- "Implement a design system component with Tailwind and TypeScript"
- "Set up real-time updates with WebSockets and React Query"
- "Build a PWA with offline capabilities and push notifications"
- "Create a responsive navigation component with dark mode support"

## Resources

### scripts/
Executable scripts for accelerating frontend development:
- **`generateComponent.ts`**: A powerful, interactive CLI tool to scaffold modern Next.js components. It generates TypeScript components (`.tsx`), Storybook stories, CSS modules, and even custom hooks, supporting both client and server components.
- **`performanceOptimizer.ts`**: A script to analyze Next.js application performance. It can analyze component size, find unused imports, and suggest optimizations like lazy loading and memoization. It can also generate a performance-optimized `next.config.js`.

### references/
Documentation and guides:
- React 19 documentation and best practices
- Next.js 15 App Router patterns
- Tailwind CSS configuration guide
- Accessibility implementation checklist
- Performance optimization techniques

### assets/
Reusable UI resources:
- Component templates and boilerplate
- Tailwind configuration files
- TypeScript type definitions
- Storybook configuration templates