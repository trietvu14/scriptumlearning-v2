# Scriptum Learning Platform

## Project Overview
A comprehensive multi-tenant AI-powered curriculum mapping platform for educational institutions with LMS integrations, standards mapping, and assessment tools. Features a modern, elegant interface with custom branding and intuitive navigation.

## Architecture Summary
- **Frontend**: React with TypeScript, Vite, Tailwind CSS + shadcn/ui
- **Backend**: Express.js with TypeScript (API layer) + Python services (AI/ETL)
- **Database**: PostgreSQL with pgvector extension
- **AI Integration**: OpenAI GPT models with agentic AI workflows
- **Multi-tenancy**: Row-level security with tenant isolation
- **UI/UX**: Custom branding with Scriptum logo and elegant typography

## User Preferences
- Clean, professional interface suitable for educational institutions
- Custom branding with Scriptum logo and elegant typography (Tangerine font)
- Centered search functionality with intuitive navigation
- Blue-to-purple gradient styling for modern appearance
- Comprehensive documentation and error handling
- Scalable architecture for multiple educational domains

## Recent Changes
- Initial project setup and architecture design (2025-08-28)
- Enhanced RBAC with automated user provisioning from LMS data (2025-08-28)
- Added RAG document stores for AI training and course-specific assistance (2025-08-28)
- **UI Enhancements (2025-08-28)**:
  - Added Scriptum logo to top navigation bar
  - Implemented custom Tangerine font (28px, bold) for "Scriptum Learning" branding
  - Repositioned search bar to center of top navigation
  - Updated favicon with Scriptum branding
  - Applied blue-to-purple gradient to top bar
  - Optimized spacing and layout for professional appearance

## Project Architecture
### Frontend Layer
- React + TypeScript with Vite
- shadcn/ui component library with custom branding
- TanStack Query for data fetching
- Wouter for routing
- Multi-tenant dashboard system
- **UI Components**:
  - Custom TopBar with Scriptum logo and Tangerine font branding
  - Centered search functionality with custom placeholder styling
  - Blue-to-purple gradient navigation header
  - Sidebar with school/institution branding and graduation cap icons
  - Responsive layout with professional styling

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
- **UI/UX Implementation Complete**:
  - Custom branding with Scriptum logo integration
  - Professional typography with Tangerine font
  - Modern gradient navigation design
  - Centered search functionality
  - Responsive layout optimization
- Phased development plan outlined
- Ready for implementation phase 1

## Technical Implementation Details

### Asset Management
- **Logo Integration**: Scriptum logo integrated via @assets alias in Vite config
- **Font Loading**: Google Fonts integration with Tangerine (400, 700 weights)
- **Favicon**: Custom Scriptum favicon.ico implemented

### Component Architecture
- **TopBar Component**: 
  - Logo positioning with reduced spacing (1.75px)
  - Custom font styling (Tangerine, 28px, bold)
  - Centered search with custom placeholder color (#eeeeee)
  - Blue-to-purple gradient background (from-blue-600 to-purple-500)
  - Responsive flex layout
- **Sidebar Component**: 
  - School/institution name with graduation cap icon
  - Maintained tenant-specific branding
  - Professional navigation structure

### Styling Implementation
- **Custom CSS Classes**: 
  - `.search-placeholder` for custom placeholder text color
  - Gradient implementation via Tailwind utilities
- **Typography Hierarchy**: Tangerine for branding, Inter for body text
- **Color Scheme**: Blue-purple gradient with white text contrast

## Development Plan - Next Steps
1. **Phase 1**: Core functionality implementation
   - User authentication and multi-tenant setup
   - Basic dashboard functionality
   - Standards mapping interface
2. **Phase 2**: AI integration and content mapping
3. **Phase 3**: LMS integrations and advanced features
4. **Phase 4**: Board review and assessment tools