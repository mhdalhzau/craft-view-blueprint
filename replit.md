# Overview

DIMSUM WARUNG is a restaurant management system that provides authentication and user management capabilities for restaurant staff. The system supports different user roles including admin and employee access, with a web-based interface for managing restaurant operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Database**: Uses Neon serverless PostgreSQL with connection pooling for scalable data storage
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: OpenID Connect integration for secure user authentication
- **Performance**: Memoization implemented for caching frequently accessed data

## Data Layer
- **Database Connection**: Neon serverless PostgreSQL with WebSocket support for real-time capabilities
- **Schema Management**: Shared schema definitions between client and server using Drizzle ORM
- **Connection Pooling**: Implements connection pooling for efficient database resource management

## Authentication System
- **Multi-role Support**: Supports admin and employee user roles with different access levels
- **OpenID Connect**: Uses industry-standard OIDC protocol for secure authentication
- **Role-based Access**: Admin users (admin@dimsum.com) have elevated privileges compared to regular employees

## Performance Optimization
- **Caching Strategy**: Memoization library used for caching expensive operations and database queries
- **Type Safety**: TypeScript implementation with proper type definitions for memoization functions

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with automatic scaling
- **WebSocket Support**: Real-time database connections using WebSocket protocol

## Authentication Services
- **OpenID Connect Provider**: External OIDC service for user authentication and authorization

## Development Tools
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries
- **Memoizee**: Function memoization library for performance optimization
- **WebSocket Library**: WebSocket implementation for real-time database connections