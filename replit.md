# Scriptum Learning Platform

## Overview
Scriptum is a comprehensive multi-tenant AI-powered curriculum mapping platform designed for educational institutions. Its primary purpose is to streamline curriculum management, integrate with Learning Management Systems (LMS), map educational standards, and provide advanced assessment tools. The platform aims to offer a modern, intuitive, and highly scalable solution for various educational domains, enhancing curriculum consistency and student outcomes.

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
The platform is built with a modern, scalable architecture comprising:
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, and shadcn/ui for a responsive and branded user interface. It features custom branding with the Scriptum logo, Zain font, and a blue-to-purple gradient for the navigation header.
- **Backend**: Express.js with TypeScript serves as the main API layer, complemented by Python services for AI and ETL operations.
- **Database**: PostgreSQL with the pgvector extension is used for robust data storage and AI embeddings, supporting a multi-tenant architecture with row-level security.
- **AI Integration**: Leverages OpenAI GPT models for agentic AI workflows, content categorization, board review generation, and study path recommendations. RAG (Retrieval Augmented Generation) document stores are utilized for AI training and course-specific assistance.
- **Multi-tenancy**: Designed with a multi-tenant architecture, including tenant management APIs, user invitation systems, and admin dashboards. Role-Based Access Control (RBAC) ensures data isolation and appropriate access levels for Super Admins, School Admins, Faculty, Administrative Support, and Students.
- **Hierarchical Curriculum Structure**: Enhanced database schema with parentId and level columns supporting unlimited nesting depth (Subject → Topic → Subtopic → Sub-subtopic, etc.) with recursive rendering and visual hierarchy displays.
- **Key Features**:
    - Multi-tenant school/college management with automated user provisioning.
    - Integrations with major LMS platforms (Canvas, Blackboard, Moodle) for user and data synchronization.
    - Standards mapping for various educational frameworks (USMLE, LCME, iNBDE, CODA).
    - AI-powered content categorization and smart standards suggestions.
    - Comprehensive dental school curriculum template system with 22+ subjects, 80+ topics, and 200+ subtopics from official dental school curriculum documents.
    - Interactive curriculum mapping with matrix visualization and hierarchical structure display.
    - Board review mock exams with personalized study paths.
    - Dashboard visualizations, reporting, and analytics.

## External Dependencies
- **OpenAI**: For GPT models and AI-driven functionalities.
- **PostgreSQL with pgvector extension**: For database management and vector embeddings.
- **Learning Management Systems (LMS) APIs**: Canvas, Blackboard, Moodle for integrations and data synchronization.
- **Google Fonts**: For typography, specifically the Zain font.