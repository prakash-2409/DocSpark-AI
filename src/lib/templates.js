/**
 * Templates Library
 * 
 * Pre-built document templates for students (school & college),
 * professionals, and professors/teachers.
 * 
 * Each template has an id, title, description, category, and htmlContent
 * that gets inserted directly into the TipTap editor.
 */

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'school', label: 'School' },
  { id: 'college', label: 'College' },
  { id: 'professional', label: 'Professional' },
  { id: 'professor', label: 'Professor / Teacher' },
];

export const TEMPLATES = [
  // ─── SCHOOL ───────────────────────────────────────────
  {
    id: 'book-report',
    title: 'Book Report',
    description: 'Standard book report with summary, characters, theme, and personal opinion.',
    category: 'school',
    icon: '📖',
    htmlContent: `
      <h1>Book Report</h1>
      <p><strong>Title:</strong> [Book Title]</p>
      <p><strong>Author:</strong> [Author Name]</p>
      <p><strong>Date:</strong> [Date]</p>
      <p><strong>Class:</strong> [Class/Period]</p>
      <hr />
      <h2>Summary</h2>
      <p>Write a brief summary of the book in your own words. What is the main story about? What happens in the beginning, middle, and end?</p>
      <h2>Main Characters</h2>
      <ul>
        <li><strong>[Character 1]</strong> — Describe their role and personality.</li>
        <li><strong>[Character 2]</strong> — Describe their role and personality.</li>
        <li><strong>[Character 3]</strong> — Describe their role and personality.</li>
      </ul>
      <h2>Theme & Message</h2>
      <p>What is the main theme or lesson of this book? What message is the author trying to share?</p>
      <h2>My Opinion</h2>
      <p>Did you enjoy this book? Why or why not? Would you recommend it to a friend? What was your favourite part?</p>
      <h2>Rating</h2>
      <p>⭐ [X] / 5 stars</p>
    `,
  },
  {
    id: 'science-lab',
    title: 'Science Lab Report',
    description: 'Structured lab report with hypothesis, materials, procedure, results, and conclusion.',
    category: 'school',
    icon: '🔬',
    htmlContent: `
      <h1>Science Lab Report</h1>
      <p><strong>Experiment Title:</strong> [Title]</p>
      <p><strong>Student Name:</strong> [Your Name]</p>
      <p><strong>Date:</strong> [Date]</p>
      <p><strong>Subject/Class:</strong> [Subject]</p>
      <hr />
      <h2>Objective</h2>
      <p>What are you trying to find out or prove?</p>
      <h2>Hypothesis</h2>
      <p>If [independent variable], then [predicted outcome], because [reasoning].</p>
      <h2>Materials</h2>
      <ul>
        <li>[Material 1]</li>
        <li>[Material 2]</li>
        <li>[Material 3]</li>
      </ul>
      <h2>Procedure</h2>
      <ol>
        <li>Step 1: [Describe what you did]</li>
        <li>Step 2: [Next step]</li>
        <li>Step 3: [Continue with steps]</li>
      </ol>
      <h2>Observations & Results</h2>
      <p>What did you observe during the experiment? Record your data here.</p>
      <h2>Conclusion</h2>
      <p>Was your hypothesis correct? What did you learn from this experiment? What would you do differently next time?</p>
    `,
  },
  {
    id: 'five-paragraph-essay',
    title: 'Five-Paragraph Essay',
    description: 'Classic essay structure with introduction, three body paragraphs, and conclusion.',
    category: 'school',
    icon: '✍️',
    htmlContent: `
      <h1>[Essay Title]</h1>
      <p><strong>Your Name:</strong> [Name] | <strong>Date:</strong> [Date] | <strong>Class:</strong> [Class]</p>
      <hr />
      <h2>Introduction</h2>
      <p>Start with a hook to grab the reader's attention. Provide background information on your topic. End with your <strong>thesis statement</strong> — the main argument of your essay.</p>
      <h2>Body Paragraph 1</h2>
      <p><strong>Topic sentence:</strong> State the first supporting point for your thesis.</p>
      <p>Provide evidence, examples, or explanations. Connect this point back to your thesis.</p>
      <h2>Body Paragraph 2</h2>
      <p><strong>Topic sentence:</strong> State the second supporting point.</p>
      <p>Provide evidence, examples, or explanations. Connect this point back to your thesis.</p>
      <h2>Body Paragraph 3</h2>
      <p><strong>Topic sentence:</strong> State the third supporting point.</p>
      <p>Provide evidence, examples, or explanations. Connect this point back to your thesis.</p>
      <h2>Conclusion</h2>
      <p>Restate your thesis in different words. Summarise your three main points. End with a final thought, call to action, or broader implication.</p>
    `,
  },
  {
    id: 'homework-sheet',
    title: 'Homework Sheet',
    description: 'Daily or weekly homework tracker with subjects and tasks.',
    category: 'school',
    icon: '📝',
    htmlContent: `
      <h1>Homework Sheet</h1>
      <p><strong>Week of:</strong> [Start Date] — [End Date]</p>
      <p><strong>Student:</strong> [Your Name] | <strong>Grade:</strong> [Grade]</p>
      <hr />
      <h2>Monday</h2>
      <ul>
        <li><strong>Maths:</strong> [Assignment]</li>
        <li><strong>English:</strong> [Assignment]</li>
        <li><strong>Science:</strong> [Assignment]</li>
      </ul>
      <h2>Tuesday</h2>
      <ul>
        <li><strong>Maths:</strong> [Assignment]</li>
        <li><strong>English:</strong> [Assignment]</li>
        <li><strong>Science:</strong> [Assignment]</li>
      </ul>
      <h2>Wednesday</h2>
      <ul>
        <li><strong>Maths:</strong> [Assignment]</li>
        <li><strong>English:</strong> [Assignment]</li>
        <li><strong>Science:</strong> [Assignment]</li>
      </ul>
      <h2>Thursday</h2>
      <ul>
        <li><strong>Maths:</strong> [Assignment]</li>
        <li><strong>English:</strong> [Assignment]</li>
        <li><strong>Science:</strong> [Assignment]</li>
      </ul>
      <h2>Friday</h2>
      <ul>
        <li><strong>Maths:</strong> [Assignment]</li>
        <li><strong>English:</strong> [Assignment]</li>
        <li><strong>Science:</strong> [Assignment]</li>
      </ul>
    `,
  },

  // ─── COLLEGE ──────────────────────────────────────────
  {
    id: 'research-paper',
    title: 'Research Paper (APA)',
    description: 'APA-formatted research paper with abstract, literature review, methodology, and references.',
    category: 'college',
    icon: '🎓',
    htmlContent: `
      <h1>[Title of Your Research Paper]</h1>
      <p style="text-align: center">[Your Full Name]</p>
      <p style="text-align: center">[Department, Institution]</p>
      <p style="text-align: center">[Course Name and Number]</p>
      <p style="text-align: center">[Instructor Name]</p>
      <p style="text-align: center">[Date]</p>
      <hr />
      <h2>Abstract</h2>
      <p>Write a 150–250 word summary of your entire paper. Include the research problem, methods, key findings, and conclusion. Do not indent the first line.</p>
      <p><strong>Keywords:</strong> <em>[keyword 1], [keyword 2], [keyword 3]</em></p>
      <h2>Introduction</h2>
      <p>Introduce the topic, provide context and background. State the research problem or question. Explain the significance of the study. End with a clear thesis or purpose statement.</p>
      <h2>Literature Review</h2>
      <p>Summarise and analyse existing research related to your topic. Show how your study fits into the broader academic conversation. Identify gaps in the current research.</p>
      <h2>Methodology</h2>
      <p>Describe your research design, data collection methods, and analysis procedures. Explain why these methods are appropriate for addressing your research question.</p>
      <h2>Results</h2>
      <p>Present your findings objectively. Use tables, figures, or statistics as needed. Do not interpret results here — save that for the discussion.</p>
      <h2>Discussion</h2>
      <p>Interpret your results. How do they relate to your hypothesis and existing literature? Discuss implications, limitations, and suggestions for future research.</p>
      <h2>Conclusion</h2>
      <p>Summarise the key findings. Restate the significance of your work. Provide final thoughts or recommendations.</p>
      <h2>References</h2>
      <p>[Author Last, First Initial. (Year). Title of work. <em>Journal Name, Volume</em>(Issue), Pages. https://doi.org/xxxxx]</p>
      <p>[Add more references in APA format]</p>
    `,
  },
  {
    id: 'college-assignment',
    title: 'College Assignment',
    description: 'Standard assignment with cover page, introduction, body, conclusion, and references.',
    category: 'college',
    icon: '📄',
    htmlContent: `
      <h1>[Assignment Title]</h1>
      <p style="text-align: center"><strong>Submitted by:</strong> [Your Name]</p>
      <p style="text-align: center"><strong>Student ID:</strong> [ID Number]</p>
      <p style="text-align: center"><strong>Course:</strong> [Course Code — Course Name]</p>
      <p style="text-align: center"><strong>Instructor:</strong> [Professor Name]</p>
      <p style="text-align: center"><strong>Date:</strong> [Submission Date]</p>
      <hr />
      <h2>Introduction</h2>
      <p>Introduce the topic of your assignment. Provide context and state the purpose or objectives of your work.</p>
      <h2>Main Body</h2>
      <h3>Section 1: [Topic]</h3>
      <p>Discuss the first major point. Support with evidence, examples, or citations.</p>
      <h3>Section 2: [Topic]</h3>
      <p>Discuss the second major point. Provide analysis and critical thinking.</p>
      <h3>Section 3: [Topic]</h3>
      <p>Continue with additional sections as needed.</p>
      <h2>Conclusion</h2>
      <p>Summarise your key arguments and findings. Restate the significance and provide final thoughts.</p>
      <h2>References</h2>
      <p>[List your references here in the required citation format]</p>
    `,
  },
  {
    id: 'project-proposal',
    title: 'Project Proposal',
    description: 'Detailed project proposal with objectives, scope, timeline, and budget.',
    category: 'college',
    icon: '🚀',
    htmlContent: `
      <h1>Project Proposal</h1>
      <p><strong>Project Title:</strong> [Title]</p>
      <p><strong>Proposed by:</strong> [Your Name / Team Names]</p>
      <p><strong>Course:</strong> [Course] | <strong>Date:</strong> [Date]</p>
      <hr />
      <h2>Executive Summary</h2>
      <p>Provide a brief overview of the project (2–3 sentences). What problem does it address? What is the proposed solution?</p>
      <h2>Problem Statement</h2>
      <p>Define the problem clearly. Why does it matter? Who is affected?</p>
      <h2>Objectives</h2>
      <ol>
        <li>[Objective 1]</li>
        <li>[Objective 2]</li>
        <li>[Objective 3]</li>
      </ol>
      <h2>Scope</h2>
      <p>Define what is included and excluded from the project. What are the boundaries?</p>
      <h2>Methodology</h2>
      <p>How will you approach this project? What tools, technologies, or methods will you use?</p>
      <h2>Timeline</h2>
      <ul>
        <li><strong>Week 1–2:</strong> [Phase 1 — Research & Planning]</li>
        <li><strong>Week 3–4:</strong> [Phase 2 — Development/Implementation]</li>
        <li><strong>Week 5–6:</strong> [Phase 3 — Testing & Review]</li>
        <li><strong>Week 7:</strong> [Phase 4 — Final Submission]</li>
      </ul>
      <h2>Expected Outcomes</h2>
      <p>What are the expected deliverables and results?</p>
      <h2>Budget (if applicable)</h2>
      <p>[Describe estimated costs, resources needed, or tools required]</p>
      <h2>References</h2>
      <p>[List any preliminary references or sources]</p>
    `,
  },
  {
    id: 'thesis-outline',
    title: 'Thesis Outline',
    description: 'Structured outline for a thesis or dissertation with chapters and sections.',
    category: 'college',
    icon: '📚',
    htmlContent: `
      <h1>Thesis Outline</h1>
      <p><strong>Working Title:</strong> [Your Thesis Title]</p>
      <p><strong>Author:</strong> [Your Name] | <strong>Supervisor:</strong> [Supervisor Name]</p>
      <p><strong>Department:</strong> [Department] | <strong>Expected Completion:</strong> [Date]</p>
      <hr />
      <h2>Chapter 1: Introduction</h2>
      <ul>
        <li>1.1 Background and Context</li>
        <li>1.2 Problem Statement</li>
        <li>1.3 Research Questions / Objectives</li>
        <li>1.4 Significance of the Study</li>
        <li>1.5 Scope and Limitations</li>
        <li>1.6 Structure of the Thesis</li>
      </ul>
      <h2>Chapter 2: Literature Review</h2>
      <ul>
        <li>2.1 Theoretical Framework</li>
        <li>2.2 Key Concepts and Definitions</li>
        <li>2.3 Review of Related Studies</li>
        <li>2.4 Research Gap</li>
      </ul>
      <h2>Chapter 3: Methodology</h2>
      <ul>
        <li>3.1 Research Design</li>
        <li>3.2 Data Collection Methods</li>
        <li>3.3 Sample and Population</li>
        <li>3.4 Data Analysis Procedures</li>
        <li>3.5 Ethical Considerations</li>
      </ul>
      <h2>Chapter 4: Results</h2>
      <ul>
        <li>4.1 Data Presentation</li>
        <li>4.2 Analysis and Findings</li>
      </ul>
      <h2>Chapter 5: Discussion</h2>
      <ul>
        <li>5.1 Interpretation of Results</li>
        <li>5.2 Comparison with Existing Literature</li>
        <li>5.3 Implications</li>
      </ul>
      <h2>Chapter 6: Conclusion and Recommendations</h2>
      <ul>
        <li>6.1 Summary of Findings</li>
        <li>6.2 Recommendations</li>
        <li>6.3 Areas for Further Research</li>
      </ul>
      <h2>References</h2>
      <p>[Bibliography — Use your required citation style]</p>
      <h2>Appendices</h2>
      <p>[Supporting documents, questionnaires, raw data, etc.]</p>
    `,
  },
  {
    id: 'case-study',
    title: 'Case Study',
    description: 'Business or academic case study with situation analysis, problem, and solution.',
    category: 'college',
    icon: '🔍',
    htmlContent: `
      <h1>Case Study: [Title]</h1>
      <p><strong>Author:</strong> [Your Name] | <strong>Course:</strong> [Course] | <strong>Date:</strong> [Date]</p>
      <hr />
      <h2>1. Introduction</h2>
      <p>Introduce the subject of the case study. Provide background information and context.</p>
      <h2>2. Situation Analysis</h2>
      <p>Describe the current situation in detail. What are the key facts and figures?</p>
      <h2>3. Problem Identification</h2>
      <p>What is the core problem or challenge? List the key issues that need to be addressed.</p>
      <h2>4. Analysis</h2>
      <p>Apply relevant theories, frameworks, or tools (SWOT, PESTLE, Porter's Five Forces, etc.) to analyse the situation.</p>
      <h2>5. Alternative Solutions</h2>
      <ol>
        <li><strong>Option A:</strong> [Description, pros/cons]</li>
        <li><strong>Option B:</strong> [Description, pros/cons]</li>
        <li><strong>Option C:</strong> [Description, pros/cons]</li>
      </ol>
      <h2>6. Recommended Solution</h2>
      <p>Which option do you recommend and why? Provide justification.</p>
      <h2>7. Implementation Plan</h2>
      <p>How should the recommended solution be implemented? What steps, timeline, and resources are needed?</p>
      <h2>8. Conclusion</h2>
      <p>Summarise the key findings and lessons learned.</p>
      <h2>References</h2>
      <p>[List sources used in your analysis]</p>
    `,
  },

  // ─── PROFESSIONAL ─────────────────────────────────────
  {
    id: 'resume',
    title: 'Resume / CV',
    description: 'Clean, professional resume with contact info, experience, education, and skills.',
    category: 'professional',
    icon: '💼',
    htmlContent: `
      <h1>[Your Full Name]</h1>
      <p>[City, Country] • [Phone Number] • [Email Address] • [LinkedIn / Portfolio URL]</p>
      <hr />
      <h2>Professional Summary</h2>
      <p>[2–3 sentences describing your experience, key skills, and career goals. Tailor this to each application.]</p>
      <h2>Experience</h2>
      <h3>[Job Title] — [Company Name]</h3>
      <p><em>[Start Date] — [End Date / Present] | [Location]</em></p>
      <ul>
        <li>[Key achievement or responsibility with quantified results]</li>
        <li>[Another accomplishment — use action verbs]</li>
        <li>[Third point demonstrating impact]</li>
      </ul>
      <h3>[Previous Job Title] — [Company Name]</h3>
      <p><em>[Start Date] — [End Date] | [Location]</em></p>
      <ul>
        <li>[Key achievement]</li>
        <li>[Key achievement]</li>
      </ul>
      <h2>Education</h2>
      <h3>[Degree] in [Field of Study]</h3>
      <p><em>[University Name] — [Graduation Year]</em></p>
      <p>GPA: [X.X/4.0] (if notable) | Relevant coursework: [Course 1, Course 2]</p>
      <h2>Skills</h2>
      <ul>
        <li><strong>Technical:</strong> [Skill 1, Skill 2, Skill 3]</li>
        <li><strong>Languages:</strong> [Language 1 (Fluent), Language 2 (Intermediate)]</li>
        <li><strong>Tools:</strong> [Tool 1, Tool 2, Tool 3]</li>
      </ul>
      <h2>Certifications</h2>
      <ul>
        <li>[Certification Name] — [Issuing Organisation] ([Year])</li>
      </ul>
    `,
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter',
    description: 'Professional cover letter template for job applications.',
    category: 'professional',
    icon: '✉️',
    htmlContent: `
      <p>[Your Name]</p>
      <p>[Your Address]</p>
      <p>[City, Postcode]</p>
      <p>[Your Email] | [Your Phone]</p>
      <p>[Date]</p>
      <p></p>
      <p>[Hiring Manager's Name]</p>
      <p>[Company Name]</p>
      <p>[Company Address]</p>
      <p></p>
      <p>Dear [Mr./Ms. Last Name],</p>
      <p></p>
      <p>I am writing to express my interest in the <strong>[Job Title]</strong> position at <strong>[Company Name]</strong>, as advertised on [where you found the listing]. With my background in [relevant field/experience], I am confident I would be a valuable addition to your team.</p>
      <p></p>
      <p>In my current role as [Current Position] at [Current Company], I have [describe key achievement]. This experience has given me [relevant skills] that directly align with the requirements of this role.</p>
      <p></p>
      <p>[In this paragraph, explain why you're specifically interested in THIS company and THIS role. Show you've done your research.]</p>
      <p></p>
      <p>I would welcome the opportunity to discuss how my skills and experience can contribute to [Company Name]'s continued success. Thank you for considering my application. I look forward to hearing from you.</p>
      <p></p>
      <p>Sincerely,</p>
      <p>[Your Full Name]</p>
    `,
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Structured meeting minutes with attendees, agenda, decisions, and action items.',
    category: 'professional',
    icon: '📋',
    htmlContent: `
      <h1>Meeting Notes</h1>
      <p><strong>Date:</strong> [Date] | <strong>Time:</strong> [Start] — [End]</p>
      <p><strong>Location:</strong> [Room / Virtual Link]</p>
      <p><strong>Organiser:</strong> [Name]</p>
      <hr />
      <h2>Attendees</h2>
      <ul>
        <li>[Name 1] — [Role]</li>
        <li>[Name 2] — [Role]</li>
        <li>[Name 3] — [Role]</li>
      </ul>
      <h2>Agenda</h2>
      <ol>
        <li>[Topic 1]</li>
        <li>[Topic 2]</li>
        <li>[Topic 3]</li>
      </ol>
      <h2>Discussion</h2>
      <h3>1. [Topic 1]</h3>
      <p>[Summary of discussion points, key arguments, data shared]</p>
      <h3>2. [Topic 2]</h3>
      <p>[Summary of discussion]</p>
      <h2>Decisions Made</h2>
      <ul>
        <li>[Decision 1] — Agreed by [who]</li>
        <li>[Decision 2]</li>
      </ul>
      <h2>Action Items</h2>
      <ul>
        <li><strong>[Person]:</strong> [Task] — Due: [Date]</li>
        <li><strong>[Person]:</strong> [Task] — Due: [Date]</li>
      </ul>
      <h2>Next Meeting</h2>
      <p><strong>Date:</strong> [Date] | <strong>Topic:</strong> [Follow-up items]</p>
    `,
  },

  // ─── PROFESSOR / TEACHER ──────────────────────────────
  {
    id: 'syllabus',
    title: 'Course Syllabus',
    description: 'Complete course syllabus with schedule, grading policy, and course rules.',
    category: 'professor',
    icon: '🏫',
    htmlContent: `
      <h1>[Course Code]: [Course Title]</h1>
      <p><strong>Instructor:</strong> [Professor Name]</p>
      <p><strong>Email:</strong> [Email] | <strong>Office Hours:</strong> [Times]</p>
      <p><strong>Semester:</strong> [Semester Year] | <strong>Schedule:</strong> [Days/Times]</p>
      <p><strong>Location:</strong> [Room / Online]</p>
      <hr />
      <h2>Course Description</h2>
      <p>[Brief description of what the course covers, its place in the curriculum, and what students will gain.]</p>
      <h2>Learning Objectives</h2>
      <p>By the end of this course, students will be able to:</p>
      <ol>
        <li>[Objective 1]</li>
        <li>[Objective 2]</li>
        <li>[Objective 3]</li>
        <li>[Objective 4]</li>
      </ol>
      <h2>Required Materials</h2>
      <ul>
        <li><strong>Textbook:</strong> [Title, Author, Edition, ISBN]</li>
        <li>[Other materials, software, etc.]</li>
      </ul>
      <h2>Grading Policy</h2>
      <ul>
        <li>Assignments: 30%</li>
        <li>Midterm Exam: 20%</li>
        <li>Final Exam: 30%</li>
        <li>Participation: 10%</li>
        <li>Project: 10%</li>
      </ul>
      <h2>Grading Scale</h2>
      <p>A: 90–100 | B: 80–89 | C: 70–79 | D: 60–69 | F: Below 60</p>
      <h2>Course Schedule</h2>
      <ul>
        <li><strong>Week 1:</strong> [Topic] — Readings: [Chapter]</li>
        <li><strong>Week 2:</strong> [Topic] — Readings: [Chapter]</li>
        <li><strong>Week 3:</strong> [Topic] — Assignment 1 Due</li>
        <li><strong>Week 4–5:</strong> [Topic]</li>
        <li><strong>Week 6:</strong> Midterm Exam</li>
        <li><strong>Week 7–10:</strong> [Topics]</li>
        <li><strong>Week 11–12:</strong> [Topics] — Project Due</li>
        <li><strong>Week 13–14:</strong> Review & Final Exam</li>
      </ul>
      <h2>Policies</h2>
      <h3>Attendance</h3>
      <p>[State your attendance policy]</p>
      <h3>Late Submissions</h3>
      <p>[Penalty for late work, grace period, etc.]</p>
      <h3>Academic Integrity</h3>
      <p>All work must be original. Plagiarism will result in [consequences]. See the university's academic integrity policy at [link].</p>
    `,
  },
  {
    id: 'lesson-plan',
    title: 'Lesson Plan',
    description: 'Detailed lesson plan with objectives, activities, assessment, and materials.',
    category: 'professor',
    icon: '📐',
    htmlContent: `
      <h1>Lesson Plan</h1>
      <p><strong>Subject:</strong> [Subject] | <strong>Grade/Level:</strong> [Grade]</p>
      <p><strong>Topic:</strong> [Lesson Topic]</p>
      <p><strong>Duration:</strong> [Time — e.g., 50 minutes]</p>
      <p><strong>Date:</strong> [Date]</p>
      <hr />
      <h2>Learning Objectives</h2>
      <p>By the end of this lesson, students will be able to:</p>
      <ol>
        <li>[Objective 1 — use Bloom's taxonomy verbs: identify, explain, analyse, create...]</li>
        <li>[Objective 2]</li>
        <li>[Objective 3]</li>
      </ol>
      <h2>Materials Needed</h2>
      <ul>
        <li>[Material 1 — textbook, handouts, projector, etc.]</li>
        <li>[Material 2]</li>
      </ul>
      <h2>Lesson Structure</h2>
      <h3>1. Warm-Up / Introduction (10 min)</h3>
      <p>[Engage students: question, short video, brainstorm, review of previous lesson]</p>
      <h3>2. Direct Instruction (15 min)</h3>
      <p>[Present new content: lecture, demonstration, reading, slides]</p>
      <h3>3. Guided Practice (10 min)</h3>
      <p>[Students practice with teacher support: group activity, worked examples, discussion]</p>
      <h3>4. Independent Practice (10 min)</h3>
      <p>[Students work independently: worksheet, problem set, writing task]</p>
      <h3>5. Wrap-Up / Closure (5 min)</h3>
      <p>[Exit ticket, summary, preview next lesson, Q&A]</p>
      <h2>Assessment</h2>
      <p>[How will you check for understanding? Formative assessment methods]</p>
      <h2>Differentiation</h2>
      <ul>
        <li><strong>For advanced learners:</strong> [Extension activities]</li>
        <li><strong>For struggling learners:</strong> [Support strategies]</li>
      </ul>
      <h2>Reflection (post-lesson)</h2>
      <p>[What went well? What would you change? Notes for next time]</p>
    `,
  },
  {
    id: 'rubric',
    title: 'Grading Rubric',
    description: 'Assessment rubric with criteria, levels, and point values.',
    category: 'professor',
    icon: '📊',
    htmlContent: `
      <h1>Grading Rubric</h1>
      <p><strong>Assignment:</strong> [Assignment Name]</p>
      <p><strong>Course:</strong> [Course] | <strong>Total Points:</strong> [X]</p>
      <hr />
      <h2>Criteria</h2>
      <h3>1. Content & Understanding (__ / 25 points)</h3>
      <ul>
        <li><strong>Excellent (22–25):</strong> Demonstrates thorough understanding. Content is comprehensive, accurate, and insightful.</li>
        <li><strong>Good (18–21):</strong> Shows solid understanding with minor gaps. Content is mostly accurate.</li>
        <li><strong>Satisfactory (14–17):</strong> Basic understanding shown. Some inaccuracies or missing information.</li>
        <li><strong>Needs Improvement (0–13):</strong> Limited understanding. Significant gaps or inaccuracies.</li>
      </ul>
      <h3>2. Organisation & Structure (__ / 25 points)</h3>
      <ul>
        <li><strong>Excellent (22–25):</strong> Well-organised with clear logical flow. Headings and paragraphs used effectively.</li>
        <li><strong>Good (18–21):</strong> Generally well-organised. Minor structural issues.</li>
        <li><strong>Satisfactory (14–17):</strong> Some organisation present but lacks coherence in places.</li>
        <li><strong>Needs Improvement (0–13):</strong> Poorly organised. Difficult to follow.</li>
      </ul>
      <h3>3. Writing Quality (__ / 25 points)</h3>
      <ul>
        <li><strong>Excellent (22–25):</strong> Clear, concise, and professional writing. Minimal errors.</li>
        <li><strong>Good (18–21):</strong> Good writing quality. Few grammatical or spelling errors.</li>
        <li><strong>Satisfactory (14–17):</strong> Acceptable writing. Several errors that impact readability.</li>
        <li><strong>Needs Improvement (0–13):</strong> Frequent errors. Writing is unclear or unprofessional.</li>
      </ul>
      <h3>4. Citations & References (__ / 25 points)</h3>
      <ul>
        <li><strong>Excellent (22–25):</strong> All sources properly cited. Reference list is complete and correctly formatted.</li>
        <li><strong>Good (18–21):</strong> Most sources cited correctly. Minor formatting issues.</li>
        <li><strong>Satisfactory (14–17):</strong> Some citations missing or incorrectly formatted.</li>
        <li><strong>Needs Improvement (0–13):</strong> Little to no citations. Potential plagiarism concerns.</li>
      </ul>
      <hr />
      <h2>Total Score: __ / 100</h2>
      <h2>Comments</h2>
      <p>[Provide specific, constructive feedback for the student]</p>
    `,
  },
  {
    id: 'exam-template',
    title: 'Exam / Quiz Template',
    description: 'Exam paper template with sections for multiple choice, short answer, and essays.',
    category: 'professor',
    icon: '📝',
    htmlContent: `
      <h1>[Course Code]: [Course Name]</h1>
      <h2>[Midterm / Final / Quiz] Examination</h2>
      <p><strong>Date:</strong> [Date] | <strong>Time Allowed:</strong> [Duration]</p>
      <p><strong>Total Marks:</strong> [X] | <strong>Instructions:</strong> Answer all questions</p>
      <hr />
      <p><strong>Student Name:</strong> _________________________ <strong>ID:</strong> _________________________</p>
      <hr />
      <h2>Section A: Multiple Choice (__ marks)</h2>
      <p><em>Choose the best answer for each question.</em></p>
      <p><strong>1.</strong> [Question text]</p>
      <p>a) [Option A] &nbsp;&nbsp; b) [Option B] &nbsp;&nbsp; c) [Option C] &nbsp;&nbsp; d) [Option D]</p>
      <p><strong>2.</strong> [Question text]</p>
      <p>a) [Option A] &nbsp;&nbsp; b) [Option B] &nbsp;&nbsp; c) [Option C] &nbsp;&nbsp; d) [Option D]</p>
      <p><strong>3.</strong> [Question text]</p>
      <p>a) [Option A] &nbsp;&nbsp; b) [Option B] &nbsp;&nbsp; c) [Option C] &nbsp;&nbsp; d) [Option D]</p>
      <h2>Section B: Short Answer (__ marks)</h2>
      <p><em>Answer each question in 2–3 sentences.</em></p>
      <p><strong>4.</strong> [Question]</p>
      <p></p>
      <p><strong>5.</strong> [Question]</p>
      <p></p>
      <h2>Section C: Essay Questions (__ marks)</h2>
      <p><em>Answer in detail. Support your answer with examples and references where applicable.</em></p>
      <p><strong>6.</strong> [Essay question — longer response expected]</p>
      <p></p>
      <p><strong>7.</strong> [Essay question]</p>
      <p></p>
      <hr />
      <p style="text-align: center"><em>— End of Examination —</em></p>
    `,
  },
];
