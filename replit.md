# Scriptum Learning Platform

## Overview
Scriptum is a comprehensive, multi-tenant AI-powered curriculum mapping platform designed for educational institutions. Its primary purpose is to integrate with Learning Management Systems (LMS), map educational standards, and provide advanced assessment tools. The platform aims to offer a modern, elegant interface with custom branding, streamlined navigation, and agentic AI workflows. It supports a wide range of educational domains with a scalable architecture, enabling institutions to manage, customize, and analyze their curricula efficiently while leveraging AI for content categorization and personalized learning paths.

## User Preferences
- Clean, professional interface suitable for educational institutions
- Custom branding with Scriptum logo and elegant typography (Zain font)
- Centered search functionality with intuitive navigation
- Blue-to-purple gradient styling for modern appearance
- Comprehensive documentation and error handling
- Scalable architecture for multiple educational domains
- Generic curriculum template descriptions for broader institutional appeal
- School admin capability to delete institution-specific curriculum standards

## System Architecture
The platform is built with a modern technology stack to ensure scalability, performance, and a rich user experience.

-   **Frontend**: Developed using React with TypeScript, Vite for fast development, and styled with Tailwind CSS augmented by shadcn/ui for component libraries. The UI/UX emphasizes custom branding with the Scriptum logo, Zain typography, a blue-to-purple gradient in the navigation, and a centered search bar. It features a multi-tenant dashboard system and a responsive layout.
-   **Backend**: Comprises an Express.js API layer written in TypeScript for core application logic and dedicated Python services for AI and ETL (Extract, Transform, Load) operations.
-   **Database**: PostgreSQL is used as the primary database, enhanced with the pgvector extension to support AI embeddings for efficient vector similarity searches. The database design supports a multi-tenant architecture with robust tenant isolation and a comprehensive schema for educational content mapping.
-   **AI Integration**: Utilizes OpenAI GPT models for advanced AI capabilities, including content categorization, agentic AI workflows, board review generation, and study path recommendations. RAG (Retrieval Augmented Generation) document stores are implemented for AI training and course-specific assistance.
-   **Key Features**: Includes multi-tenant management with automated user provisioning, LMS integrations (Canvas, Blackboard, Moodle), mapping to various educational standards (USMLE, LCME, iNBDE, CODA), AI-powered content categorization, board review mock exams, role-based access control (RBAC), and comprehensive dashboard visualizations. A notable feature is the comprehensive dental school curriculum template system, allowing multi-tenant cloning and customization.
-   **RBAC System**: Features a hierarchical role-based access control system including Super Admin, School Admin, Faculty, Administrative Support, and Students, each with specific permissions and data access levels.

## External Dependencies
-   **OpenAI GPT Models**: Integrated for AI-powered content analysis, categorization, and recommendation generation.
-   **PostgreSQL with pgvector**: Used for database management, specifically for storing and querying AI embeddings efficiently.
-   **LMS APIs**: Connectors for Canvas, Blackboard, and Moodle enable user provisioning, course roster synchronization, and data exchange.
-   **Google Fonts**: Utilized to import custom fonts, notably "Zain", to maintain consistent branding and typography across the platform.