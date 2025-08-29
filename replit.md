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
- Custom branding with Scriptum logo and elegant typography (Zain font)
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
  - Implemented custom Zain font (28px, normal weight) for "Scriptum Learning" branding
  - Repositioned search bar to center of top navigation
  - Updated favicon with Scriptum branding
  - Applied blue-to-purple gradient to top bar
  - Optimized spacing and layout for professional appearance
- **Phase 1 Implementation Complete (2025-08-28)**:
  - Built complete multi-tenant architecture with tenant management APIs
  - Implemented user invitation system with email acceptance workflow
  - Created admin dashboards for tenant and user management
  - Added role-based sidebar navigation with proper access controls
  - Established tenant onboarding workflow for new institutions
  - All authentication and authorization systems operational
- **Standards and Curriculum Mapping (2025-08-29)**:
  - Updated all educational standards to current August 2025 versions
  - Replaced obsolete NBDE with current INBDE standard for dental schools
  - Implemented complete INBDE curriculum mapping system with FK×CC matrix
  - Added 10 Foundation Knowledge areas and 56 Clinical Content areas from official INBDE guide
  - Created interactive matrix visualization with percentage-based content alignment
  - Built comprehensive curriculum mapping infrastructure with statistics tracking

## Project Architecture
### Frontend Layer
- React + TypeScript with Vite
- shadcn/ui component library with custom branding
- TanStack Query for data fetching
- Wouter for routing
- Multi-tenant dashboard system
- **UI Components**:
  - Custom TopBar with Scriptum logo and Zain font branding
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
  - Professional typography with Zain font
  - Modern gradient navigation design
  - Centered search functionality
  - Responsive layout optimization
- **Phase 1 Complete (2025-08-28)**:
  - Multi-tenant foundation with JWT authentication
  - Complete tenant management system with onboarding workflow
  - User invitation system with email-based acceptance
  - Role-based access control and navigation
  - Admin dashboards for tenant and user management
  - All API endpoints operational with proper validation
- Ready for Phase 2: Standards Mapping & Content Management

## Technical Implementation Details

### Asset Management
- **Logo Integration**: Scriptum logo integrated via @assets alias in Vite config
- **Font Loading**: Google Fonts integration with Zain (200-900 weights)
- **Favicon**: Custom Scriptum favicon.ico implemented

### Component Architecture
- **TopBar Component**: 
  - Logo positioning with reduced spacing (1.75px)
  - Custom font styling (Zain, 28px, normal weight)
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
- **Typography Hierarchy**: Zain for branding, Inter for body text
- **Color Scheme**: Blue-purple gradient with white text contrast

## Comprehensive Development Plan

### Phase 1: Foundation & Core Platform (Weeks 1-4)
**Goal**: Establish secure multi-tenant foundation with basic functionality

#### Week 1-2: Authentication & Multi-Tenancy
- Enhanced user authentication system with JWT tokens
- Multi-tenant database architecture with row-level security
- Role-based access control (Super Admin, School Admin, Faculty, Admin Support, Students)
- Tenant onboarding workflow and domain management
- User invitation and provisioning system

#### Week 3-4: Core Dashboard & Navigation
- Dynamic dashboard with tenant-specific data
- Navigation system with role-based menu visibility
- User management interface for school administrators
- Basic tenant settings and configuration
- Responsive UI components and layouts

**Deliverables**: Secure multi-tenant platform with user management

### Phase 2: Standards Mapping & Content Management (Weeks 5-8)
**Goal**: Implement core curriculum mapping functionality

#### Week 5-6: Standards Framework
- Standards database schema (USMLE, LCME, iNBDE, CODA, etc.)
- Standards import/export functionality
- Hierarchical standards organization and categorization
- Standards search and filtering capabilities
- Bulk standards management tools

#### Week 7-8: Content Mapping Interface
- Drag-and-drop course content mapping interface
- Visual curriculum mapping with interactive components
- Content alignment with multiple standards simultaneously
- Mapping validation and quality assurance tools
- Progress tracking and completion status

**Deliverables**: Functional standards mapping system with intuitive interface

### Phase 3: AI Integration & Smart Categorization (Weeks 9-12)
**Goal**: Implement AI-powered content analysis and recommendations

#### Week 9-10: AI Foundation & RAG System
- OpenAI GPT integration with secure API handling
- Vector database setup with pgvector for embeddings
- RAG document stores for different content types
- AI training data management interface
- Content embedding and similarity search

#### Week 11-12: Intelligent Content Analysis
- Automated content categorization using AI
- Smart standards suggestion based on content analysis
- Bulk content processing and AI-assisted mapping
- Quality scoring and confidence metrics
- AI-powered content recommendations and gap analysis

**Deliverables**: AI-enhanced platform with automated content categorization

### Phase 4: LMS Integration & Data Synchronization (Weeks 13-16)
**Goal**: Seamless integration with external learning management systems

#### Week 13-14: LMS Connectors
- Canvas API integration with OAuth authentication
- Blackboard Learn integration and data sync
- Moodle API connector and user provisioning
- Generic LTI (Learning Tools Interoperability) support
- Real-time and scheduled data synchronization

#### Week 15-16: Advanced Integration Features
- Automated user role mapping from LMS to platform
- Course roster and enrollment synchronization
- Grade passback and assessment integration
- Single sign-on (SSO) implementation
- Integration health monitoring and error handling

**Deliverables**: Fully integrated platform with major LMS systems

### Phase 5: Assessment & Board Review System (Weeks 17-20)
**Goal**: Comprehensive assessment tools and board exam preparation

#### Week 17-18: Assessment Engine
- Question bank management with taxonomy tagging
- Adaptive testing algorithm implementation
- Performance analytics and learning path recommendations
- Mock exam generation based on standards coverage
- Detailed performance reporting and analytics

#### Week 19-20: Board Review Features
- USMLE Step 1/2 focused question sets
- Personalized study plans based on weak areas
- Progress tracking and milestone achievements
- Peer comparison and ranking systems
- Mobile-responsive exam interface

**Deliverables**: Complete assessment and board review system

### Phase 6: Advanced Analytics & Reporting (Weeks 21-24)
**Goal**: Comprehensive analytics and institutional reporting

#### Week 21-22: Analytics Dashboard
- Real-time curriculum coverage analytics
- Student performance trend analysis
- Faculty activity and engagement metrics
- Standards compliance reporting
- Custom report builder with export capabilities

#### Week 23-24: Advanced Features
- Predictive analytics for student success
- Curriculum gap analysis and recommendations
- Comparative institutional benchmarking
- Automated compliance reporting for accreditation
- API for third-party integrations

**Deliverables**: Advanced analytics platform with comprehensive reporting

### Phase 7: Mobile App & Advanced UI (Weeks 25-28)
**Goal**: Mobile application and enhanced user experience

#### Week 25-26: Mobile Development
- React Native mobile application
- Offline capability for assessments
- Push notifications for assignments and deadlines
- Mobile-optimized curriculum mapping interface
- Synchronization with web platform

#### Week 27-28: UI/UX Enhancements
- Advanced data visualization components
- Interactive curriculum mapping tools
- Enhanced search and filtering capabilities
- Accessibility compliance (WCAG 2.1)
- Performance optimization and caching

**Deliverables**: Mobile app and enhanced web interface

### Phase 8: Enterprise Features & Scaling (Weeks 29-32)
**Goal**: Enterprise-grade features and scalability

#### Week 29-30: Enterprise Security
- Advanced audit logging and compliance
- Data encryption at rest and in transit
- FERPA and HIPAA compliance features
- Advanced user permission granularity
- Security monitoring and threat detection

#### Week 31-32: Scalability & Performance
- Database optimization and query performance
- CDN integration for static assets
- Auto-scaling infrastructure setup
- Load testing and performance benchmarking
- Disaster recovery and backup systems

**Deliverables**: Enterprise-ready platform with full security and scalability

## Success Metrics & KPIs
- **User Adoption**: 90%+ active user rate within institutions
- **Performance**: <2s page load times, 99.9% uptime
- **Accuracy**: 85%+ AI categorization accuracy rate
- **Integration**: Support for 3+ major LMS platforms
- **Compliance**: Full FERPA/HIPAA compliance certification
- **Scalability**: Support for 100+ concurrent institutions