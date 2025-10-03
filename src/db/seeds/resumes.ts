import { db } from '@/db';
import { resumes } from '@/db/schema';

async function main() {
    const sampleResumes = [
        {
            resumeText: `ALEX JOHNSON
Full Stack Developer

Email: alex.johnson@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/alexjohnson
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 3+ years of expertise in modern web technologies including JavaScript, React, Node.js, and cloud platforms. Proven track record of building scalable web applications and leading development teams. Strong background in both frontend and backend development with experience in agile methodologies.

TECHNICAL SKILLS
• Frontend: JavaScript (ES6+), React.js, TypeScript, HTML5, CSS3, Redux
• Backend: Node.js, Express.js, Python, RESTful APIs, GraphQL
• Databases: MongoDB, PostgreSQL, MySQL
• Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Git, CI/CD
• Testing: Jest, Cypress, Mocha
• Other: Agile/Scrum, Webpack, Babel

PROFESSIONAL EXPERIENCE

Senior Full Stack Developer | TechCorp Solutions | Jan 2022 - Present
• Led development of e-commerce platform serving 50K+ users using React and Node.js
• Implemented microservices architecture reducing system response time by 40%
• Collaborated with cross-functional teams to deliver features on time and within budget
• Mentored 2 junior developers and conducted code reviews

Full Stack Developer | StartupXYZ | Jun 2021 - Dec 2021
• Built responsive web applications using React, Express.js, and MongoDB
• Developed RESTful APIs handling 10K+ daily requests
• Integrated third-party payment systems and authentication services
• Improved application performance through database optimization

Junior Developer | WebDev Inc | Mar 2020 - May 2021
• Developed frontend components using React and JavaScript
• Assisted in backend development with Node.js and PostgreSQL
• Participated in agile development processes and daily standups
• Contributed to open-source projects and internal tooling

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2016 - 2020

PROJECTS
• PersonalFinance App: Full-stack application built with React, Node.js, and PostgreSQL
• E-commerce API: RESTful API using Express.js and MongoDB with JWT authentication
• Task Management Tool: React application with real-time updates using Socket.io

CERTIFICATIONS
• AWS Certified Developer Associate (2023)
• MongoDB Certified Developer (2022)`,
            skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB", "PostgreSQL", "Express.js", "TypeScript", "AWS", "Docker"],
            fileName: "resume_fullstack_developer.pdf",
            fileSize: 245760,
            fileType: "application/pdf",
            createdAt: new Date('2024-03-15').toISOString(),
        }
    ];

    await db.insert(resumes).values(sampleResumes);
    
    console.log('✅ Resumes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});