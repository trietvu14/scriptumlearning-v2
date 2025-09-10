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
              learningObjectives: ["Requirements for written course information and student evaluation policies"],
              subtopics: [
                {
                  name: "2-1: Course Information Requirements",
                  code: "CODA-2-1",
                  competencyLevel: "required",
                  learningObjectives: [
                    "Provide written information about course goals and requirements in advance",
                    "Specify nature of course content and evaluation methods", 
                    "Explain how grades and competency are determined"
                  ],
                  assessmentCriteria: ["Written course syllabi available", "Clear evaluation criteria published"]
                },
                {
                  name: "2-2: Student Evaluation Policies",
                  code: "CODA-2-2", 
                  competencyLevel: "required",
                  learningObjectives: [
                    "Perform individual evaluations for students not meeting published criteria",
                    "Implement institutional due process policies for evaluation decisions"
                  ],
                  assessmentCriteria: ["Due process procedures documented", "Individual evaluation protocols established"]
                }
              ]
            },
            {
              name: "Critical Thinking",
              code: "CODA-2-CT",
              learningObjectives: ["Development of critical thinking and problem-solving competencies"],
              subtopics: [
                {
                  name: "2-10: Critical Thinking Competency",
                  code: "CODA-2-10",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Demonstrate competency in critical thinking and problem-solving for comprehensive patient care",
                    "Apply critical thinking to scientific inquiry and research methodology"
                  ],
                  assessmentCriteria: ["Critical thinking assessments conducted", "Problem-solving skills demonstrated"]
                },
                {
                  name: "Evidence of Critical Thinking Development",
                  code: "CODA-2-10-EVIDENCE",
                  competencyLevel: "implementation",
                  learningObjectives: [
                    "Explicit discussion of meaning, importance, and application of critical thinking",
                    "Use questions requiring analysis of problem etiology and alternative approaches",
                    "Provide rationale for plans of action and predict outcomes",
                    "Conduct prospective simulations for decision-making practice",
                    "Perform retrospective critiques identifying errors and exemplary performance",
                    "Assign writing tasks analyzing problems and defending decisions",
                    "Analyze work products comparing outcomes to best evidence",
                    "Demonstrate active learning methods including case analysis and evidence appraisal"
                  ],
                  assessmentCriteria: ["Teaching methods support critical thinking", "Multiple evidence types documented"]
                }
              ]
            },
            {
              name: "Biomedical Sciences",
              code: "CODA-2-BMS",
              learningObjectives: ["Comprehensive biomedical science knowledge and application"],
              subtopics: [
                {
                  name: "2-12: Basic Biological Principles",
                  code: "CODA-2-12",
                  competencyLevel: "foundational",
                  learningObjectives: [
                    "Ensure in-depth understanding of basic biological principles",
                    "Provide core information on fundamental structures, functions and interrelationships of body systems"
                  ],
                  assessmentCriteria: ["Comprehensive biomedical curricula implemented", "Systems integration demonstrated"]
                },
                {
                  name: "2-13: Oro-facial Complex Emphasis",
                  code: "CODA-2-13",
                  competencyLevel: "specialized",
                  learningObjectives: [
                    "Emphasize oro-facial complex as important anatomical area",
                    "Understand complex biological interrelationship with entire body"
                  ],
                  assessmentCriteria: ["Oro-facial anatomy extensively covered", "Systemic relationships taught"]
                },
                {
                  name: "2-14: Abnormal Biological Conditions",
                  code: "CODA-2-14",
                  competencyLevel: "clinical",
                  learningObjectives: [
                    "Provide in-depth information on abnormal biological conditions",
                    "Support understanding of etiology, epidemiology, differential diagnosis",
                    "Cover pathogenesis, prevention, treatment and prognosis of oral disorders"
                  ],
                  assessmentCriteria: ["Pathology curricula comprehensive", "Clinical correlation demonstrated"]
                },
                {
                  name: "2-15: Clinical Application",
                  code: "CODA-2-15",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Apply biomedical science knowledge in patient care delivery",
                    "Integrate advances in modern biology to clinical practice",
                    "Apply new medical knowledge relevant to oral health care"
                  ],
                  assessmentCriteria: ["Clinical application demonstrated", "Current knowledge integrated"]
                }
              ]
            },
            {
              name: "Behavioral Sciences",
              code: "CODA-2-BS",
              learningObjectives: ["Behavioral science principles for patient-centered care"],
              subtopics: [
                {
                  name: "2-16: Behavioral Sciences Application",
                  code: "CODA-2-16",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Apply fundamental principles of behavioral sciences",
                    "Use patient-centered approaches for promoting, improving and maintaining oral health"
                  ],
                  assessmentCriteria: ["Behavioral science competencies assessed", "Patient-centered care demonstrated"]
                },
                {
                  name: "2-17: Diverse Population Management",
                  code: "CODA-2-17",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Manage diverse patient populations effectively",
                    "Demonstrate interpersonal and communication skills",
                    "Function successfully in multicultural work environments"
                  ],
                  assessmentCriteria: ["Cultural competence demonstrated", "Communication skills assessed"]
                },
                {
                  name: "Diversity and Inclusion Focus",
                  code: "CODA-2-BS-DIVERSITY",
                  competencyLevel: "curricular",
                  learningObjectives: [
                    "Learn about factors associated with health disparities among subpopulations",
                    "Address racial, ethnic, geographic, and socioeconomic health disparities",
                    "Facilitate education in environments supportive of diversity and inclusion"
                  ],
                  assessmentCriteria: ["Diversity curriculum implemented", "Health disparities addressed"]
                }
              ]
            },
            {
              name: "Clinical Sciences",
              code: "CODA-2-CS",
              learningObjectives: ["Comprehensive clinical competencies for general dentistry"],
              subtopics: [
                {
                  name: "2-22: Evidence-Based Practice",
                  code: "CODA-2-22",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Access, critically appraise, apply, and communicate scientific literature",
                    "Provide evidence-based patient care",
                    "Understand basic principles of clinical and translational research"
                  ],
                  assessmentCriteria: ["Evidence-based practice demonstrated", "Research principles understood"]
                },
                {
                  name: "2-23: General Dentistry Scope",
                  code: "CODA-2-23",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Provide oral health care within scope of general dentistry",
                    "Treat patients in all stages of life competently"
                  ],
                  assessmentCriteria: ["General dentistry competencies demonstrated", "Life-stage care provided"]
                },
                {
                  name: "2-24: Minimum Clinical Competencies",
                  code: "CODA-2-24",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Perform patient assessment, diagnosis, comprehensive treatment planning, prognosis, and informed consent",
                    "Conduct screening and risk assessment for head and neck cancer",
                    "Recognize treatment complexity and identify when referral is indicated",
                    "Implement health promotion and disease prevention including caries management",
                    "Administer local anesthesia and manage pain and anxiety control",
                    "Restore teeth and manage dental laboratory procedures",
                    "Replace teeth including fixed, removable and dental implant prosthodontic therapies",
                    "Provide periodontal therapy and pulpal therapy",
                    "Manage oral mucosal, temporomandibular, and osseous disorders",
                    "Perform hard and soft tissue surgery and manage dental emergencies",
                    "Manage malocclusion and space management",
                    "Evaluate treatment outcomes, recall strategies, and prognosis"
                  ],
                  assessmentCriteria: ["All competency areas demonstrated", "Clinical proficiency assessed"]
                },
                {
                  name: "2-25: Patients with Special Needs",
                  code: "CODA-2-25",
                  competencyLevel: "graduate_competency",
                  learningObjectives: [
                    "Assess and manage treatment of patients with special needs",
                    "Use proper communication techniques and respectful nomenclature",
                    "Assess treatment needs compatible with special needs",
                    "Provide services or referral as appropriate"
                  ],
                  assessmentCriteria: ["Special needs patients treated", "Appropriate care protocols followed"]
                },
                {
                  name: "2-26: Service Learning",
                  code: "CODA-2-26",
                  competencyLevel: "experiential",
                  learningObjectives: [
                    "Engage in service learning and community-based learning experiences",
                    "Develop culturally competent oral health care workforce",
                    "Experience treatment of diverse populations in community settings"
                  ],
                  assessmentCriteria: ["Service learning opportunities provided", "Community engagement documented"]
                }
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
              learningObjectives: ["Establish comprehensive patient-centered care policies"],
              subtopics: [
                {
                  name: "5-1: Published Policy Requirements",
                  code: "CODA-5-1",
                  competencyLevel: "institutional",
                  learningObjectives: [
                    "Establish published policy addressing meaning and commitment to patient-centered care",
                    "Distribute written policy to students, faculty, staff, and patients"
                  ],
                  assessmentCriteria: ["Written policy published", "Policy distributed to all stakeholders"]
                },
                {
                  name: "Patient Rights Statement Components",
                  code: "CODA-5-1-RIGHTS",
                  competencyLevel: "policy",
                  learningObjectives: [
                    "Ensure considerate, respectful and confidential treatment",
                    "Provide continuity and completion of treatment",
                    "Give access to complete and current information about patient condition",
                    "Provide advance knowledge of treatment costs",
                    "Obtain informed consent for all procedures",
                    "Explain recommended treatment, alternatives, refusal options, and risks",
                    "Ensure treatment meets professional standard of care"
                  ],
                  assessmentCriteria: ["All patient rights components addressed", "Patient rights statement comprehensive"]
                }
              ]
            },
            {
              name: "Evidence-Based Patient Care",
              code: "CODA-5-EBC",
              learningObjectives: ["Implement evidence-based patient care protocols"],
              subtopics: [
                {
                  name: "5-2: Evidence Integration",
                  code: "CODA-5-2",
                  competencyLevel: "clinical",
                  learningObjectives: [
                    "Provide evidence-based patient care integrating best research evidence and patient values",
                    "Use evidence to evaluate new technology and products",
                    "Guide diagnosis and treatment decisions with current evidence"
                  ],
                  assessmentCriteria: ["Evidence-based protocols implemented", "Technology evaluation processes established"]
                }
              ]
            },
            {
              name: "Quality Improvement System",
              code: "CODA-5-QI",
              learningObjectives: ["Conduct formal continuous quality improvement"],
              subtopics: [
                {
                  name: "5-3: Continuous Quality Improvement",
                  code: "CODA-5-3",
                  competencyLevel: "institutional",
                  learningObjectives: [
                    "Establish patient-centered standards of care with measurable criteria",
                    "Conduct ongoing review and analysis of compliance with standards",
                    "Review representative sample of patients and records for quality assessment",
                    "Determine causes of treatment deficiencies",
                    "Implement corrective measures as appropriate"
                  ],
                  assessmentCriteria: ["Quality improvement system operational", "Data monitoring databases maintained"]
                }
              ]
            },
            {
              name: "Operational Requirements",
              code: "CODA-5-OPS",
              learningObjectives: ["Ensure safe and effective patient care operations"],
              subtopics: [
                {
                  name: "5-4: Student Advancement Criteria",
                  code: "CODA-5-4",
                  competencyLevel: "policy",
                  learningObjectives: [
                    "Ensure quantitative criteria for advancement do not compromise comprehensive patient care"
                  ],
                  assessmentCriteria: ["Advancement criteria reviewed for patient care impact"]
                },
                {
                  name: "5-5: Emergency Services Access",
                  code: "CODA-5-5",
                  competencyLevel: "operational",
                  learningObjectives: [
                    "Provide active patients access to professional services at all times for dental emergencies"
                  ],
                  assessmentCriteria: ["24/7 emergency service protocols established"]
                },
                {
                  name: "5-6: Basic Life Support Certification",
                  code: "CODA-5-6",
                  competencyLevel: "safety",
                  learningObjectives: [
                    "Maintain continuous basic life support certification for all patient care personnel",
                    "Ensure ability to manage common medical emergencies"
                  ],
                  assessmentCriteria: ["All personnel BLS certified", "Emergency management protocols current"]
                },
                {
                  name: "5-7: Radiation Safety",
                  code: "CODA-5-7",
                  competencyLevel: "safety",
                  learningObjectives: [
                    "Implement written policies for safe use of ionizing radiation",
                    "Establish criteria for patient selection and exposure frequency",
                    "Define protocols for retaking radiographs consistent with accepted practice"
                  ],
                  assessmentCriteria: ["Radiation safety protocols documented", "ALARA principles followed"]
                },
                {
                  name: "5-8: Infection Control",
                  code: "CODA-5-8",
                  competencyLevel: "safety",
                  learningObjectives: [
                    "Establish and enforce adequate preclinical/clinical/laboratory asepsis",
                    "Implement infection and biohazard control measures",
                    "Ensure proper disposal of hazardous waste"
                  ],
                  assessmentCriteria: ["Infection control protocols enforced", "Waste disposal procedures compliant"]
                },
                {
                  name: "5-9: Patient Confidentiality",
                  code: "CODA-5-9",
                  competencyLevel: "privacy",
                  learningObjectives: [
                    "Ensure strict confidentiality of patient health information",
                    "Implement HIPAA-compliant privacy policies and procedures"
                  ],
                  assessmentCriteria: ["Patient privacy protected", "HIPAA compliance maintained"]
                }
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
              learningObjectives: ["Establish research as integral component of dental school mission"],
              subtopics: [
                {
                  name: "6-1: Research Integration",
                  code: "CODA-6-1",
                  competencyLevel: "institutional",
                  learningObjectives: [
                    "Integrate research as component of dental school purpose, mission, goals and objectives",
                    "Develop and sustain research program on continuing basis",
                    "Regularly assess research mission achievement"
                  ],
                  assessmentCriteria: ["Research mission documented", "Annual research evaluations conducted"]
                },
                {
                  name: "Research Infrastructure Evidence",
                  code: "CODA-6-1-EVIDENCE",
                  competencyLevel: "implementation",
                  learningObjectives: [
                    "Establish research areas with ongoing funded support",
                    "Demonstrate commitment in mission statement, strategic plan, and financial support",
                    "Conduct regular ongoing research programmatic review",
                    "Secure extramural grant and foundation support",
                    "Demonstrate global impact of research program"
                  ],
                  assessmentCriteria: ["Research infrastructure established", "External funding secured", "Global impact demonstrated"]
                }
              ]
            },
            {
              name: "Faculty Research Requirements",
              code: "CODA-6-FRR",
              learningObjectives: ["Ensure faculty engagement in research and scholarly activity"],
              subtopics: [
                {
                  name: "6-2: Faculty Research Engagement",
                  code: "CODA-6-2",
                  competencyLevel: "faculty",
                  learningObjectives: [
                    "Engage dental school faculty in research and scholarly activity appropriate to school mission",
                    "Establish programs to recruit and retain qualified research faculty",
                    "Employ adequate number of full-time faculty with dedicated research time"
                  ],
                  assessmentCriteria: ["Faculty research participation documented", "Research faculty retention tracked"]
                },
                {
                  name: "Faculty Research Evidence",
                  code: "CODA-6-2-EVIDENCE",
                  competencyLevel: "productivity",
                  learningObjectives: [
                    "Maintain faculty roster of full-time equivalents dedicated to research",
                    "Secure extramural funding for faculty research",
                    "Document research faculty recruitment efforts",
                    "Produce peer-reviewed scholarly publications based on original research",
                    "Present research at scientific meetings and symposia",
                    "Demonstrate research program impact and productivity"
                  ],
                  assessmentCriteria: ["Faculty research productivity measured", "Publications and presentations tracked"]
                }
              ]
            },
            {
              name: "Student Research Participation",
              code: "CODA-6-SRP",
              learningObjectives: ["Provide student research opportunities and mentorship"],
              subtopics: [
                {
                  name: "6-3: Student Research Opportunities",
                  code: "CODA-6-3",
                  competencyLevel: "educational",
                  learningObjectives: [
                    "Provide opportunities and encourage student participation in faculty-mentored research",
                    "Expose students to biomedical, translational, educational, epidemiologic and clinical research",
                    "Align student research activities with institutional research mission and goals",
                    "Introduce students to principles of research methodology"
                  ],
                  assessmentCriteria: ["Student research opportunities provided", "Research methodology taught"]
                },
                {
                  name: "Student Research Evidence",
                  code: "CODA-6-3-EVIDENCE",
                  competencyLevel: "outcomes",
                  learningObjectives: [
                    "Support formal presentation of student research at school or university events",
                    "Encourage scholarly publications with student authors based on original research",
                    "Facilitate student presentation at scientific meetings"
                  ],
                  assessmentCriteria: ["Student research presentations documented", "Student research publications tracked"]
                }
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