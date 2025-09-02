# Scriptum Learning Platform

## Overview
Scriptum Learning Platform is a comprehensive, multi-tenant, AI-powered curriculum mapping solution designed for educational institutions. It integrates with Learning Management Systems (LMS), facilitates standards mapping, and provides advanced assessment tools. The platform aims to offer a modern, intuitive, and scalable system for curriculum management, enhancing educational content delivery and alignment with academic standards, thereby improving institutional efficiency and student outcomes.

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
The platform features a robust, multi-tenant architecture with distinct frontend and backend services.

### UI/UX Decisions
The user interface prioritizes a clean, professional aesthetic. It incorporates custom branding with the Scriptum logo and elegant typography using the Zain font. Key UI elements include a centered search bar, a blue-to-purple gradient navigation bar, and a sidebar with institution-specific branding. Components are built using shadcn/ui on React, ensuring a responsive and modern user experience.

### Technical Implementations
- **Frontend**: Developed with React and TypeScript, leveraging Vite for build tooling, Tailwind CSS for styling, and shadcn/ui for UI components. TanStack Query manages data fetching, and Wouter handles client-side routing.
- **Backend**: Comprises an Express.js API layer built with TypeScript for core application logic and dedicated Python services (Flask/FastAPI) for AI and ETL operations.
- **Database**: PostgreSQL is used as the primary database, enhanced with the pgvector extension to support AI embeddings for efficient semantic search and content mapping.
- **AI Integration**: Utilizes OpenAI GPT models for advanced AI capabilities, including content categorization, agentic workflows, board review generation, and study path recommendations.
- **Multi-tenancy**: Implemented with row-level security ensuring strict tenant isolation and data segregation.
- **Key Features**: Includes multi-tenant management, automated user provisioning, LMS integrations (Canvas, Blackboard, Moodle), AI-powered standards mapping (USMLE, LCME, iNBDE, CODA), board review mock exams, and comprehensive role-based access control (RBAC). A notable feature is the comprehensive dental school curriculum template system, allowing multi-tenant cloning and customization.
- **RAG Document Stores**: Utilizes dedicated RAG (Retrieval Augmented Generation) stores for AI training, including a Standards Training Store, Course-Specific Stores, and an Internal Curriculum Store.
- **RBAC System**: Defines roles such as Super Admin, School Admin, Faculty, Administrative Support, and Students, each with specific permissions and data access levels.

## External Dependencies
- **OpenAI GPT Models**: Integrated for AI-powered content analysis, categorization, and recommendation generation.
- **PostgreSQL with pgvector**: Employed for database management and efficient storage and retrieval of AI embeddings.
- **LMS APIs**: Utilized for integration with Learning Management Systems such as Canvas, Blackboard, and Moodle, facilitating user provisioning, course roster synchronization, and data exchange.
- **Google Fonts**: Used to load custom fonts, specifically Zain, for consistent branding and typography across the platform.