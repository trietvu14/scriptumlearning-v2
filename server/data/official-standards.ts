// Official standards for different educational areas
// This file contains the predefined standards frameworks for each educational domain

export const officialStandardsData = {
  medical_school: [
    {
      name: "USMLE Step 1",
      description: "United States Medical Licensing Examination Step 1 content outline",
      frameworkType: "board_exam",
      version: "2024",
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
      version: "2024-25",
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
      name: "NBDE Part I",
      description: "National Board Dental Examinations Part I content outline",
      frameworkType: "board_exam",
      version: "2024",
      subjects: [
        {
          name: "Anatomic Sciences",
          code: "ANAT",
          description: "Head, neck, and oral anatomy",
          topics: [
            {
              name: "Head and Neck Anatomy",
              code: "ANAT-HN",
              learningObjectives: [
                "Identify cranial nerves",
                "Describe muscle attachments",
                "Explain vascular supply"
              ]
            }
          ]
        },
        {
          name: "Oral Pathology",
          code: "PATH",
          description: "Oral and maxillofacial pathology",
          topics: [
            {
              name: "Developmental Disorders",
              code: "PATH-DEV",
              learningObjectives: [
                "Recognize developmental anomalies",
                "Classify congenital conditions"
              ]
            }
          ]
        }
      ]
    },
    {
      name: "CODA Standards",
      description: "Commission on Dental Accreditation standards",
      frameworkType: "accreditation",
      version: "2024",
      subjects: [
        {
          name: "Educational Program Standards",
          code: "EPS",
          description: "Predoctoral dental education standards",
          topics: [
            {
              name: "Clinical Education",
              code: "EPS-CE",
              learningObjectives: [
                "Provide comprehensive patient care",
                "Ensure clinical competency assessment"
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
      version: "2024",
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
    }
  ],

  nursing_school: [
    {
      name: "CCNE Standards",
      description: "Commission on Collegiate Nursing Education Accreditation Standards",
      frameworkType: "accreditation",
      version: "2024",
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
      version: "2024",
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
      version: "2024",
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
      version: "2024",
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
      version: "2024",
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
      version: "2024",
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