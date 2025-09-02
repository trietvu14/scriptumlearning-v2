# Scriptum Learning Platform

## Overview
Scriptum is a multi-tenant AI-powered curriculum mapping platform designed for educational institutions. Its primary purpose is to streamline curriculum management, integrate with Learning Management Systems (LMS), map educational standards, and provide advanced assessment tools. The platform aims to offer a modern, intuitive, and scalable solution for academic institutions to manage and enhance their educational programs, leveraging AI for content categorization and personalized learning paths.

## User Preferences
- Clean, professional interface suitable for educational institutions
- Custom branding with Scriptum logo and elegant typography (Zain font)
- Centered search functionality with intuitive navigation
- Blue-to-purple gradient styling for modern appearance
- Comprehensive documentation and error handling
- Scalable architecture for multiple educational domains

## System Architecture
The platform features a modern web application architecture:
- **Frontend**: Built with React and TypeScript, utilizing Vite for fast development, Tailwind CSS for styling, and shadcn/ui for UI components. It includes a multi-tenant dashboard system with custom UI components like a `TopBar` with Scriptum branding and a `Sidebar` with institution-specific branding.
- **Backend**: Comprises an Express.js API layer written in TypeScript for core application logic and Python-based services (Flask/FastAPI) dedicated to AI functionalities (content categorization, agentic workflows, board review generation, study path recommendations) and ETL processes for LMS integrations.
- **Database**: PostgreSQL is used as the primary database, enhanced with the `pgvector` extension for AI embeddings, supporting a multi-tenant architecture with robust tenant isolation and a comprehensive schema for educational content mapping.
- **AI Integration**: Leverages OpenAI GPT models for advanced AI capabilities, including content categorization, standards mapping, and personalized learning.
- **Multi-tenancy**: Designed with row-level security ensuring strict tenant isolation. Super admins are tenant-agnostic with platform-wide access across all institutions.
- **UI/UX Decisions**: Emphasizes a clean, professional aesthetic with custom branding, including a specific logo integration, Zain font for typography, a blue-to-purple gradient for navigation elements, and a centered search bar.

Key features include:
- Multi-tenant school/college management with automated user provisioning.
- Integrations with major LMS platforms (Canvas, Blackboard, Moodle).
- Comprehensive standards mapping (e.g., USMLE, LCME, iNBDE, CODA).
- AI-powered content categorization with Retrieval-Augmented Generation (RAG) training.
- Role-based access control (Super Admin, School Admin, Faculty, Administrative Support, Students) with automated user provisioning from LMS data. Super admins have cross-tenant management capabilities.
- Dashboard visualizations and reporting with export capabilities.
- Robust assessment tools and board review mock exams with personalized study paths.

## External Dependencies
- **OpenAI GPT Models**: Used for AI-powered content categorization, intelligent content analysis, and generating recommendations.
- **PostgreSQL with pgvector**: For database management and efficient storage/retrieval of AI embeddings.
- **LMS APIs**: Integration with Canvas, Blackboard, and Moodle via their respective APIs for user provisioning, course roster synchronization, and data exchange.
- **Google Fonts**: For loading custom fonts, specifically Zain, to maintain consistent branding and typography.