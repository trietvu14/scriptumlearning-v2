# Scriptum Learning Platform

## Project Overview
A comprehensive multi-tenant AI-powered curriculum mapping platform for educational institutions with LMS integrations, standards mapping, and assessment tools.

## Architecture Summary
- **Frontend**: React with TypeScript, Vite, Tailwind CSS + shadcn/ui
- **Backend**: Express.js with TypeScript (API layer) + Python services (AI/ETL)
- **Database**: PostgreSQL with pgvector extension
- **AI Integration**: OpenAI GPT models with agentic AI workflows
- **Multi-tenancy**: Row-level security with tenant isolation

## User Preferences
- Clean, professional interface suitable for educational institutions
- Comprehensive documentation and error handling
- Scalable architecture for multiple educational domains

## Recent Changes
- Initial project setup and architecture design (2025-08-28)
- Enhanced RBAC with automated user provisioning from LMS data (2025-08-28)
- Added RAG document stores for AI training and course-specific assistance (2025-08-28)

## Project Architecture
### Frontend Layer
- React + TypeScript with Vite
- shadcn/ui component library
- TanStack Query for data fetching
- Wouter for routing
- Multi-tenant dashboard system

### Backend Services
- **API Layer**: Express.js + TypeScript (main application server)
- **AI Services**: Python Flask/FastAPI services for:
  - Content categorization and mapping
  - Agentic AI workflows
  - Board review generation
  - Study path recommendations
- **ETL Services**: Python services for LMS integrations

### Database Design
- PostgreSQL with pgvector for AI embeddings
- Multi-tenant architecture with tenant isolation
- Comprehensive schema for educational content mapping

### Key Features
1. Multi-tenant school/college management with automated user provisioning
2. LMS integrations (Canvas, Blackboard, Moodle) with user sync
3. Standards mapping (USMLE, LCME, iNBDE, CODA, etc.)
4. AI-powered content categorization with RAG training
5. Board review mock exams with personalized study paths
6. Role-based access control and data isolation
7. Document-based AI training stores for enhanced categorization
8. Course-specific AI assistants for students
9. Dashboard visualization and reporting with export capabilities

### Enhanced RBAC System
- **Super Admin**: Platform-wide management
- **School Admin**: User provisioning, integration management, AI training oversight
- **Faculty**: Course-specific data access, document upload for AI training
- **Administrative Support**: Limited administrative functions
- **Students**: Board review access, personal performance data only

### RAG Document Stores
- **Standards Training Store**: Admin-uploaded documents for standards categorization
- **Course-Specific Stores**: Faculty-uploaded materials for student AI assistance
- **Internal Curriculum Store**: Institution-specific standards and guidelines

## Development Status
- Enhanced architecture design complete
- Phased development plan outlined
- Ready for implementation phase 1