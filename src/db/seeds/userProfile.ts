import { db } from '@/db';
import { userProfile } from '@/db/schema';

async function main() {
    const sampleUserProfile = [
        {
            email: 'rajesh.kumar@gmail.com',
            phone: '+91-9876543210',
            linkedin: 'https://linkedin.com/in/rajeshkumar-dev',
            coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Full Stack Developer position at your company. With over 4 years of experience in web development, I have developed a comprehensive skill set in both frontend and backend technologies that makes me an ideal candidate for this role.\n\nMy technical expertise spans across the entire web development stack, with particular strength in JavaScript, React, and Node.js. I have successfully built and deployed numerous scalable web applications, ranging from e-commerce platforms to data-driven dashboards. My experience with React includes working with hooks, context API, and state management libraries like Redux, while my Node.js background encompasses building RESTful APIs, implementing authentication systems, and database integration.\n\nWhat sets me apart is my passion for creating efficient, user-friendly applications that solve real-world problems. I believe in writing clean, maintainable code and following best practices in software development. I am also experienced with modern development workflows, including Git version control, CI/CD pipelines, and agile methodologies.\n\nI am excited about the opportunity to contribute to your team and help build innovative solutions that drive business growth. I would welcome the chance to discuss how my skills and enthusiasm can benefit your organization.\n\nThank you for your consideration.\n\nBest regards,\nRajesh Kumar',
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        }
    ];

    await db.insert(userProfile).values(sampleUserProfile);
    
    console.log('✅ User profile seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});