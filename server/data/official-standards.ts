// Official standards for different educational areas
// This file contains the predefined standards frameworks for each educational domain

export const officialStandardsData = {
  medical_school: [
    {
      name: "USMLE Step 1",
      description: "United States Medical Licensing Examination Step 1 content outline",
      frameworkType: "board_exam",
      version: "2025",
      subjects: [
        {
          name: "Anatomy",
          code: "ANAT",
          description: "Human anatomy and structural organization",
          topics: [
            {
              name: "Cardiovascular System",
              code: "ANAT-CVS",
              learningObjectives: [
                "Describe cardiac anatomy and physiology",
                "Explain blood circulation pathways",
                "Identify major blood vessels"
              ],
              subtopics: [
                {
                  name: "Heart Structure",
                  code: "ANAT-CVS-HS",
                  competencyLevel: "intermediate",
                  learningObjectives: ["Identify cardiac chambers", "Describe heart valves"],
                  assessmentCriteria: ["Can label anatomical structures", "Explains functional relationships"]
                }
              ]
            }
          ]
        },
        {
          name: "Physiology",
          code: "PHYS",
          description: "Human physiological processes and systems",
          topics: [
            {
              name: "Cardiovascular Physiology",
              code: "PHYS-CVS",
              learningObjectives: [
                "Explain cardiac cycle",
                "Describe blood pressure regulation",
                "Analyze ECG patterns"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "LCME Standards",
      description: "Liaison Committee on Medical Education accreditation standards",
      frameworkType: "accreditation",
      version: "2025-26",
      subjects: [
        {
          name: "Educational Program",
          code: "EP",
          description: "Standards for medical education program structure",
          topics: [
            {
              name: "Curriculum Management",
              code: "EP-CM",
              learningObjectives: [
                "Establish curriculum oversight committee",
                "Implement regular curriculum review",
                "Ensure competency-based progression"
              ]
            }
          ]
        }
      ]
    }
  ],
  
  dental_school: [
    {
      name: "INBDE",
      description: "Integrated National Board Dental Examinations - comprehensive dental competency assessment",
      frameworkType: "board_exam", 
      version: "2025",
      subjects: [
        {
          name: "Foundation Knowledge Areas",
          code: "FK",
          description: "Essential foundational knowledge for dental practice (FK 1-10)",
          topics: [
            {
              name: "Molecular, biochemical, cellular, and systems-level development, structure, and function",
              code: "FK-1",
              learningObjectives: [
                "Understanding molecular and cellular biology",
                "Systems-level biological processes",
                "Developmental biology concepts"
              ]
            },
            {
              name: "Physics and chemistry to explain normal biology and pathobiology",
              code: "FK-2", 
              learningObjectives: [
                "Application of physics principles to biological systems",
                "Chemical processes in health and disease",
                "Pathobiological mechanisms"
              ]
            },
            {
              name: "Pharmacology",
              code: "FK-8",
              learningObjectives: [
                "Drug mechanisms and interactions",
                "Pharmacokinetics and pharmacodynamics",
                "Clinical pharmacology applications"
              ]
            },
            {
              name: "Behavioral sciences, ethics, and jurisprudence",
              code: "FK-9",
              learningObjectives: [
                "Patient behavior and psychology",
                "Professional ethics in dentistry",
                "Legal aspects of dental practice"
              ]
            }
          ]
        },
        {
          name: "Clinical Content Areas",
          code: "CC",
          description: "Clinical competencies for dental practice (CC 1-56)",
          topics: [
            {
              name: "Diagnosis and Treatment Planning",
              code: "CC-1-15",
              learningObjectives: [
                "Interpret patient information and medical data",
                "Perform comprehensive examinations",
                "Formulate treatment plans",
                "Patient communication and education"
              ]
            },
            {
              name: "Oral Health Management", 
              code: "CC-16-38",
              learningObjectives: [
                "Prevent and manage dental emergencies",
                "Diagnose and treat oral diseases",
                "Perform restorative procedures",
                "Manage pharmacological agents"
              ]
            },
            {
              name: "Practice and Profession",
              code: "CC-39-56", 
              learningObjectives: [
                "Evaluate healthcare trends",
                "Practice risk management",
                "Maintain professional standards",
                "Quality assurance and improvement"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "CODA Standards",
      description: "Commission on Dental Accreditation predoctoral accreditation standards",
      frameworkType: "accreditation",
      version: "2025",
      subjects: [
        {
          name: "STANDARD 2 - EDUCATIONAL PROGRAM",
          code: "CODA-2",
          description: "Educational program requirements for predoctoral dental education",
          topics: [
            {
              name: "Instruction",
              code: "CODA-2-INST",
              learningObjectives: [
                "Provide written information about course goals, requirements, content, evaluation methods, and grading criteria in advance",
                "Perform individual evaluations for students who do not meet published didactic, behavioral, and/or clinical criteria",
                "Implement institutional due process policies for student evaluation decisions"
              ]
            },
            {
              name: "Critical Thinking",
              code: "CODA-2-CT",
              learningObjectives: [
                "Demonstrate competency in critical thinking and problem-solving for comprehensive patient care",
                "Apply critical thinking to scientific inquiry and research methodology",
                "Use teaching methods that support critical thinking development",
                "Engage in analysis, comparison, and evaluation of alternative approaches",
                "Provide rationale for plans of action and predict outcomes",
                "Perform decision-making through prospective simulations",
                "Conduct retrospective critiques identifying errors and exemplary performance"
              ]
            },
            {
              name: "Biomedical Sciences",
              code: "CODA-2-BMS",
              learningObjectives: [
                "Ensure in-depth understanding of basic biological principles and fundamental body system structures and functions",
                "Emphasize oro-facial complex as important anatomical area in complex biological interrelationship with entire body",
                "Provide in-depth information on abnormal biological conditions",
                "Support understanding of etiology, epidemiology, differential diagnosis, pathogenesis, prevention, treatment and prognosis of oral disorders",
                "Apply biomedical science knowledge in patient care delivery",
                "Apply advances in modern biology to clinical practice and integrate new medical knowledge relevant to oral health care"
              ]
            },
            {
              name: "Behavioral Sciences",
              code: "CODA-2-BS",
              learningObjectives: [
                "Apply fundamental principles of behavioral sciences for patient-centered approaches to oral health",
                "Manage diverse patient populations with interpersonal and communication skills",
                "Function successfully in multicultural work environments",
                "Address factors and practices associated with health disparities among subpopulations",
                "Facilitate dental education in environments supportive of diversity and inclusion"
              ]
            },
            {
              name: "Clinical Sciences",
              code: "CODA-2-CS",
              learningObjectives: [
                "Access, critically appraise, apply, and communicate scientific and lay literature for evidence-based patient care",
                "Understand basic principles of clinical and translational research",
                "Provide oral health care within scope of general dentistry to patients in all life stages",
                "Perform patient assessment, diagnosis, comprehensive treatment planning, prognosis, and informed consent",
                "Screen and assess risk for head and neck cancer",
                "Recognize treatment complexity and identify when referral is indicated",
                "Implement health promotion and disease prevention including caries management",
                "Administer local anesthesia and manage pain and anxiety control",
                "Restore teeth and manage dental laboratory procedures",
                "Replace teeth including fixed, removable and implant prosthodontic therapies",
                "Provide periodontal therapy and pulpal therapy",
                "Manage oral mucosal, temporomandibular, and osseous disorders",
                "Perform hard and soft tissue surgery and manage dental emergencies",
                "Manage malocclusion and space management",
                "Evaluate treatment outcomes, recall strategies, and prognosis",
                "Assess and manage treatment of patients with special needs",
                "Engage in service learning and community-based learning experiences"
              ]
            }
          ]
        },
        {
          name: "STANDARD 5 - PATIENT CARE SERVICES",
          code: "CODA-5",
          description: "Patient care service requirements and quality improvement standards",
          topics: [
            {
              name: "Patient-Centered Care Policies",
              code: "CODA-5-PCC",
              learningObjectives: [
                "Establish and distribute written policy addressing meaning and commitment to patient-centered care",
                "Ensure considerate, respectful and confidential treatment of patients",
                "Provide continuity and completion of treatment",
                "Give patients access to complete and current information about their condition",
                "Provide advance knowledge of treatment costs and informed consent",
                "Explain recommended treatment, alternatives, risks, and expected outcomes"
              ]
            },
            {
              name: "Evidence-Based Patient Care",
              code: "CODA-5-EBC",
              learningObjectives: [
                "Provide evidence-based patient care integrating best research evidence and patient values",
                "Use evidence to evaluate new technology and products",
                "Guide diagnosis and treatment decisions with current evidence"
              ]
            },
            {
              name: "Quality Improvement System",
              code: "CODA-5-QI",
              learningObjectives: [
                "Conduct formal continuous quality improvement for patient care program",
                "Establish patient-centered standards of care focused on comprehensive care with measurable criteria",
                "Review and analyze compliance with defined standards of care",
                "Review representative sample of patients and records to assess appropriateness and quality of care",
                "Determine causes of treatment deficiencies and implement corrective measures",
                "Create and maintain databases for monitoring and improving patient care"
              ]
            },
            {
              name: "Patient Safety and Emergency Management",
              code: "CODA-5-PSE",
              learningObjectives: [
                "Ensure quantitative criteria for advancement do not compromise comprehensive patient care",
                "Provide active patients access to professional services for dental emergencies at all times",
                "Maintain continuous basic life support certification for all patient care personnel",
                "Manage common medical emergencies effectively",
                "Ensure safe use of ionizing radiation with appropriate policies and procedures",
                "Establish and enforce adequate preclinical/clinical/laboratory asepsis and infection control",
                "Maintain strict confidentiality of patient health information"
              ]
            }
          ]
        },
        {
          name: "STANDARD 6 - RESEARCH PROGRAM",
          code: "CODA-6",
          description: "Research program requirements and scholarly activity standards",
          topics: [
            {
              name: "Research Mission and Infrastructure",
              code: "CODA-6-RMI",
              learningObjectives: [
                "Integrate research as component of dental school purpose, mission, goals and objectives",
                "Develop and sustain research program on continuing basis",
                "Establish research areas with ongoing funded support",
                "Demonstrate commitment to research in mission statement, strategic plan, and financial support",
                "Conduct regular ongoing research programmatic review",
                "Secure extramural grant and foundation support for research program",
                "Demonstrate global impact of research program"
              ]
            },
            {
              name: "Faculty Research and Scholarly Activity",
              code: "CODA-6-FRSA",
              learningObjectives: [
                "Engage dental school faculty in research and scholarly activity appropriate to school mission",
                "Establish focused, significant, and sustained programs to recruit and retain research faculty",
                "Employ adequate number of full-time faculty with dedicated research time",
                "Secure extramural funding for faculty research",
                "Produce peer-reviewed scholarly publications based on original research",
                "Present research at scientific meetings and symposia",
                "Document research faculty recruitment efforts and productivity"
              ]
            },
            {
              name: "Student Research Participation",
              code: "CODA-6-SRP",
              learningObjectives: [
                "Provide opportunities and encourage student participation in faculty-mentored research",
                "Expose students to biomedical, translational, educational, epidemiologic and clinical research",
                "Align student research activities with institutional research mission and goals",
                "Introduce students to principles of research methodology",
                "Provide elective research opportunities beyond basic introduction",
                "Support formal presentation of student research at school or university events",
                "Encourage scholarly publications with student authors",
                "Facilitate student presentation at scientific meetings"
              ]
            }
          ]
        }
      ]
    }
  ],

  nursing_school: [
    {
      name: "NCLEX-RN",
      description: "National Council Licensure Examination for Registered Nurses",
      frameworkType: "board_exam",
      version: "2025",
      subjects: [
        {
          name: "Safe and Effective Care Environment",
          code: "SECE",
          description: "Management of care and safety/infection control",
          topics: [
            {
              name: "Management of Care",
              code: "SECE-MOC",
              learningObjectives: [
                "Provide and direct nursing care",
                "Collaborate with healthcare team",
                "Manage client care assignments"
              ]
            }
          ]
        },
        {
          name: "Health Promotion and Maintenance",
          code: "HPM",
          description: "Health promotion and disease prevention",
          topics: [
            {
              name: "Health Screening",
              code: "HPM-HS",
              learningObjectives: [
                "Perform health assessments",
                "Identify risk factors",
                "Promote healthy behaviors"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "CCNE Standards",
      description: "Commission on Collegiate Nursing Education Accreditation Standards",
      frameworkType: "accreditation",
      version: "2025",
      subjects: [
        {
          name: "Program Quality: Mission and Administrative Capacity",
          code: "CCNE-I",
          description: "Standard I: Program quality and administrative infrastructure",
          topics: [
            {
              name: "Mission and Administrative Capacity",
              code: "CCNE-I-A",
              learningObjectives: [
                "Establish clear program mission aligned with institutional goals",
                "Demonstrate administrative capacity for program management",
                "Ensure adequate governance structure"
              ]
            },
            {
              name: "Faculty and Staff Resources",
              code: "CCNE-I-B",
              learningObjectives: [
                "Maintain qualified faculty with appropriate credentials",
                "Provide adequate faculty-student ratios",
                "Support faculty development and scholarship"
              ]
            },
            {
              name: "Student Support Services",
              code: "CCNE-I-C",
              learningObjectives: [
                "Implement fair admission policies",
                "Provide comprehensive student support services",
                "Maintain academic progression policies"
              ]
            },
            {
              name: "Curriculum Design and Implementation",
              code: "CCNE-I-D",
              learningObjectives: [
                "Design evidence-based curriculum",
                "Integrate theoretical and clinical learning",
                "Ensure curriculum reflects current practice"
              ]
            }
          ]
        },
        {
          name: "Program Effectiveness",
          code: "CCNE-II",
          description: "Standard II: Program effectiveness and continuous improvement",
          topics: [
            {
              name: "Student Learning Outcomes",
              code: "CCNE-II-A",
              learningObjectives: [
                "Demonstrate student achievement of program outcomes",
                "Assess clinical competency development",
                "Evaluate critical thinking skills"
              ]
            },
            {
              name: "Faculty Development and Scholarship",
              code: "CCNE-II-B",
              learningObjectives: [
                "Support faculty scholarly activities",
                "Promote evidence-based teaching practices",
                "Encourage professional development"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "ACEN Standards", 
      description: "Accreditation Commission for Education in Nursing Standards",
      frameworkType: "accreditation",
      version: "2025",
      subjects: [
        {
          name: "Mission and Administrative Capacity",
          code: "ACEN-1",
          description: "Standard 1: Mission and administrative infrastructure",
          topics: [
            {
              name: "Mission Statement and Goals",
              code: "ACEN-1-1",
              learningObjectives: [
                "Develop clear mission statement",
                "Establish measurable program goals",
                "Align with institutional mission"
              ]
            },
            {
              name: "Governance and Administration",
              code: "ACEN-1-2",
              learningObjectives: [
                "Establish effective governance structure",
                "Ensure administrative support",
                "Maintain financial stability"
              ]
            }
          ]
        },
        {
          name: "Faculty and Staff",
          code: "ACEN-2",
          description: "Standard 2: Faculty qualifications and development",
          topics: [
            {
              name: "Faculty Qualifications",
              code: "ACEN-2-1",
              learningObjectives: [
                "Hire appropriately credentialed faculty",
                "Maintain adequate faculty numbers",
                "Ensure clinical expertise"
              ]
            },
            {
              name: "Faculty Policies and Development",
              code: "ACEN-2-2",
              learningObjectives: [
                "Implement faculty evaluation policies",
                "Support professional development",
                "Promote scholarly activities"
              ]
            }
          ]
        }
      ]
    }
  ],

  physical_therapy_school: [
    {
      name: "NPTE",
      description: "National Physical Therapy Examination", 
      frameworkType: "board_exam",
      version: "2025",
      subjects: [
        {
          name: "Physical Therapy Data Collection",
          code: "PTDC",
          description: "Patient examination and evaluation",
          topics: [
            {
              name: "Patient History",
              code: "PTDC-PH",
              learningObjectives: [
                "Obtain comprehensive patient history",
                "Review medical records",
                "Identify precautions and contraindications"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "CAPTE Standards",
      description: "Commission on Accreditation in Physical Therapy Education Standards",
      frameworkType: "accreditation", 
      version: "2025",
      subjects: [
        {
          name: "Institutional Setting",
          code: "CAPTE-1",
          description: "Standard 1: Institutional characteristics and relationships",
          topics: [
            {
              name: "Institutional Accreditation",
              code: "CAPTE-1A",
              learningObjectives: [
                "Maintain institutional accreditation",
                "Demonstrate institutional support",
                "Ensure resource availability"
              ]
            },
            {
              name: "Program Integration",
              code: "CAPTE-1B",
              learningObjectives: [
                "Integrate program within institution",
                "Establish clear reporting relationships",
                "Maintain academic standards"
              ]
            }
          ]
        },
        {
          name: "Program Mission, Goals, and Objectives",
          code: "CAPTE-2",
          description: "Standard 2: Program planning and assessment",
          topics: [
            {
              name: "Mission and Goals",
              code: "CAPTE-2A",
              learningObjectives: [
                "Develop comprehensive program mission",
                "Establish measurable goals",
                "Align with profession standards"
              ]
            },
            {
              name: "Assessment and Evaluation",
              code: "CAPTE-2B",
              learningObjectives: [
                "Implement systematic assessment",
                "Use data for program improvement",
                "Demonstrate effectiveness"
              ]
            }
          ]
        },
        {
          name: "Curriculum",
          code: "CAPTE-7",
          description: "Standard 7: Curriculum design and implementation",
          topics: [
            {
              name: "Curriculum Design",
              code: "CAPTE-7A",
              learningObjectives: [
                "Design evidence-based curriculum",
                "Integrate foundational and clinical sciences",
                "Ensure professional skill development"
              ]
            },
            {
              name: "Clinical Education",
              code: "CAPTE-7B",
              learningObjectives: [
                "Provide comprehensive clinical experiences",
                "Ensure clinical competency assessment",
                "Maintain clinical site standards"
              ]
            }
          ]
        }
      ]
    }
  ],

  pharmacy_school: [
    {
      name: "NAPLEX",
      description: "North American Pharmacist Licensure Examination",
      frameworkType: "board_exam",
      version: "2025",
      subjects: [
        {
          name: "Pharmacotherapy",
          code: "PHARM",
          description: "Drug therapy and therapeutic outcomes",
          topics: [
            {
              name: "Cardiovascular Disorders",
              code: "PHARM-CVD",
              learningObjectives: [
                "Select appropriate drug therapy",
                "Monitor therapeutic outcomes",
                "Identify drug interactions"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "ACPE Standards",
      description: "Accreditation Council for Pharmacy Education Standards",
      frameworkType: "accreditation",
      version: "2025",
      subjects: [
        {
          name: "Educational Outcomes",
          code: "ACPE-1",
          description: "Standard 1: Foundational knowledge and skills",
          topics: [
            {
              name: "Foundational Knowledge",
              code: "ACPE-1-1",
              learningObjectives: [
                "Apply pharmaceutical sciences knowledge",
                "Understand drug action and interaction",
                "Demonstrate clinical reasoning"
              ]
            },
            {
              name: "Patient Care Skills",
              code: "ACPE-1-2",
              learningObjectives: [
                "Provide patient-centered care",
                "Manage drug therapy",
                "Counsel patients effectively"
              ]
            }
          ]
        },
        {
          name: "Educational Program Structure",
          code: "ACPE-8",
          description: "Standard 8: Organization and structure of didactic curriculum",
          topics: [
            {
              name: "Curriculum Design",
              code: "ACPE-8-1",
              learningObjectives: [
                "Design integrated curriculum",
                "Ensure progressive learning",
                "Include interprofessional education"
              ]
            },
            {
              name: "Assessment Methods",
              code: "ACPE-8-2",
              learningObjectives: [
                "Implement comprehensive assessment",
                "Use multiple assessment methods",
                "Provide timely feedback"
              ]
            }
          ]
        },
        {
          name: "Faculty and Staff",
          code: "ACPE-25",
          description: "Standard 25: Faculty qualifications and development",
          topics: [
            {
              name: "Faculty Qualifications",
              code: "ACPE-25-1",
              learningObjectives: [
                "Maintain qualified faculty",
                "Ensure appropriate credentials",
                "Support scholarly activities"
              ]
            },
            {
              name: "Faculty Development",
              code: "ACPE-25-2",
              learningObjectives: [
                "Provide faculty development opportunities",
                "Support teaching excellence",
                "Encourage research and service"
              ]
            }
          ]
        }
      ]
    }
  ],

  law_school: [
    {
      name: "Bar Exam MBE",
      description: "Multistate Bar Examination subjects",
      frameworkType: "board_exam",
      version: "2024",
      subjects: [
        {
          name: "Constitutional Law",
          code: "CONST",
          description: "Federal constitutional law principles",
          topics: [
            {
              name: "Individual Rights",
              code: "CONST-IR",
              learningObjectives: [
                "Analyze constitutional protections",
                "Apply bill of rights provisions",
                "Evaluate equal protection claims"
              ]
            }
          ]
        },
        {
          name: "Contracts",
          code: "CONT",
          description: "Contract formation and enforcement",
          topics: [
            {
              name: "Contract Formation",
              code: "CONT-CF",
              learningObjectives: [
                "Identify contract elements",
                "Analyze offer and acceptance",
                "Determine consideration requirements"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "ABA Standards",
      description: "American Bar Association Standards and Rules of Procedure for Approval of Law Schools",
      frameworkType: "accreditation",
      version: "2024",
      subjects: [
        {
          name: "Program of Legal Education",
          code: "ABA-301",
          description: "Standard 301: Objectives of program of legal education",
          topics: [
            {
              name: "Educational Objectives",
              code: "ABA-301-1",
              learningObjectives: [
                "Prepare students for admission to the bar",
                "Provide education in theory, doctrine and practice",
                "Prepare students for effective participation in legal profession"
              ]
            },
            {
              name: "Professional Skills",
              code: "ABA-301-2", 
              learningObjectives: [
                "Develop competency in professional skills",
                "Include practical training experiences",
                "Integrate experiential learning opportunities"
              ]
            }
          ]
        },
        {
          name: "Curriculum Requirements",
          code: "ABA-302",
          description: "Standard 302: Curriculum and program requirements",
          topics: [
            {
              name: "Required Coursework",
              code: "ABA-302-1",
              learningObjectives: [
                "Include constitutional law instruction",
                "Provide legal research and writing training",
                "Ensure professional responsibility education"
              ]
            },
            {
              name: "Clinical and Experiential Learning",
              code: "ABA-302-2",
              learningObjectives: [
                "Provide experiential learning opportunities",
                "Include simulation-based learning",
                "Offer law clinic participation"
              ]
            }
          ]
        },
        {
          name: "Faculty Qualifications",
          code: "ABA-401",
          description: "Standard 401: Faculty qualifications and responsibilities",
          topics: [
            {
              name: "Faculty Credentials",
              code: "ABA-401-1",
              learningObjectives: [
                "Maintain qualified full-time faculty",
                "Ensure appropriate academic credentials",
                "Demonstrate professional competence"
              ]
            },
            {
              name: "Faculty Development",
              code: "ABA-401-2",
              learningObjectives: [
                "Support faculty scholarship and research",
                "Provide professional development opportunities",
                "Encourage service to profession and community"
              ]
            }
          ]
        },
        {
          name: "Admissions and Student Services",
          code: "ABA-501",
          description: "Standard 501: Admissions policies and procedures",
          topics: [
            {
              name: "Admission Standards",
              code: "ABA-501-1",
              learningObjectives: [
                "Establish fair admission policies",
                "Evaluate academic qualifications",
                "Consider potential for legal study"
              ]
            },
            {
              name: "Student Support",
              code: "ABA-501-2",
              learningObjectives: [
                "Provide academic support services",
                "Offer career counseling and placement",
                "Maintain student diversity initiatives"
              ]
            }
          ]
        }
      ]
    }
  ]
};

export async function seedOfficialStandards(db: any, standardsFrameworks: any, standardsSubjects: any, standardsTopics: any, standardsSubtopics: any) {
  console.log("Seeding official standards...");
  
  for (const [educationalArea, frameworks] of Object.entries(officialStandardsData)) {
    for (const frameworkData of frameworks) {
      try {
        // Create framework
        const [framework] = await db.insert(standardsFrameworks)
          .values({
            name: frameworkData.name,
            description: frameworkData.description,
            educationalArea,
            frameworkType: frameworkData.frameworkType,
            isOfficial: true,
            tenantId: null, // Official standards have no tenant
            version: frameworkData.version
          })
          .returning();

        console.log(`Created framework: ${framework.name}`);

        // Create subjects
        for (const subjectData of frameworkData.subjects) {
          const [subject] = await db.insert(standardsSubjects)
            .values({
              frameworkId: framework.id,
              name: subjectData.name,
              code: subjectData.code,
              description: subjectData.description,
              sortOrder: 0
            })
            .returning();

          console.log(`  Created subject: ${subject.name}`);

          // Create topics
          if (subjectData.topics) {
            for (const topicData of subjectData.topics) {
              const [topic] = await db.insert(standardsTopics)
                .values({
                  subjectId: subject.id,
                  name: topicData.name,
                  code: topicData.code,
                  learningObjectives: topicData.learningObjectives || [],
                  sortOrder: 0
                })
                .returning();

              console.log(`    Created topic: ${topic.name}`);

              // Create subtopics (if they exist)
              if ('subtopics' in topicData && topicData.subtopics) {
                for (const subtopicData of topicData.subtopics) {
                  const [subtopic] = await db.insert(standardsSubtopics)
                    .values({
                      topicId: topic.id,
                      name: subtopicData.name,
                      code: subtopicData.code,
                      learningObjectives: subtopicData.learningObjectives || [],
                      competencyLevel: subtopicData.competencyLevel || 'basic',
                      assessmentCriteria: subtopicData.assessmentCriteria || [],
                      sortOrder: 0
                    })
                    .returning();

                  console.log(`      Created subtopic: ${subtopic.name}`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error creating framework ${frameworkData.name}:`, error);
      }
    }
  }
  
  console.log("Official standards seeding completed!");
}