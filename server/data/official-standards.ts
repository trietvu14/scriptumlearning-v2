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
      description: "American Bar Association Standards for Legal Education",
      frameworkType: "accreditation",
      version: "2024",
      subjects: [
        {
          name: "Program of Legal Education",
          code: "PLE",
          description: "Academic standards for JD programs",
          topics: [
            {
              name: "Curriculum",
              code: "PLE-CURR",
              learningObjectives: [
                "Provide rigorous legal education",
                "Include practical skills training",
                "Ensure ethical instruction"
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

              // Create subtopics
              if (topicData.subtopics) {
                for (const subtopicData of topicData.subtopics) {
                  const [subtopic] = await db.insert(standardsSubtopics)
                    .values({
                      topicId: topic.id,
                      name: subtopicData.name,
                      code: subtopicData.code,
                      learningObjectives: subtopicData.learningObjectives || [],
                      competencyLevel: subtopicData.competencyLevel,
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