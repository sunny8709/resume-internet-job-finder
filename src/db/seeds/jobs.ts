import { db } from '@/db';
import { jobs } from '@/db/schema';

async function main() {
    const sampleJobs = [
        {
            title: 'Full Stack Developer',
            company: 'TCS',
            location: 'Bangalore, Karnataka',
            salary: '₹8-12 LPA',
            type: 'Full-time',
            description: 'We are looking for a skilled Full Stack Developer to join our dynamic team. The ideal candidate will have experience in both front-end and back-end development, with strong proficiency in JavaScript frameworks and server-side technologies. You will be responsible for developing and maintaining web applications, collaborating with cross-functional teams, and ensuring high-quality code delivery.',
            skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
            website: 'naukri.com',
            posted: '2 days ago',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            title: 'React Developer',
            company: 'Infosys',
            location: 'Pune, Maharashtra',
            salary: '₹6-10 LPA',
            type: 'Full-time',
            description: 'Join our innovative team as a React Developer where you will build cutting-edge user interfaces and enhance user experiences. You will work closely with designers and backend developers to implement responsive web applications. Strong knowledge of React ecosystem, state management, and modern JavaScript is essential.',
            skills: JSON.stringify(['React', 'JavaScript', 'CSS']),
            website: 'linkedin.com',
            posted: '1 day ago',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            title: 'Backend Developer',
            company: 'Wipro',
            location: 'Chennai, Tamil Nadu',
            salary: '₹7-11 LPA',
            type: 'Full-time',
            description: 'Seeking an experienced Backend Developer to design and implement robust server-side solutions. You will work with databases, APIs, and microservices architecture. The role involves optimizing application performance, ensuring data security, and maintaining scalable backend systems. Experience with cloud platforms is a plus.',
            skills: JSON.stringify(['Node.js', 'Python', 'MongoDB']),
            website: 'indeed.com',
            posted: '3 days ago',
            createdAt: new Date('2024-01-14').toISOString(),
        },
        {
            title: 'Frontend Developer',
            company: 'HCL',
            location: 'Hyderabad, Telangana',
            salary: '₹5-8 LPA',
            type: 'Full-time',
            description: 'Looking for a passionate Frontend Developer to create engaging and interactive user interfaces. You will transform UI/UX designs into high-quality code and optimize applications for maximum speed and scalability. Knowledge of modern frontend frameworks and responsive design principles is required.',
            skills: JSON.stringify(['React', 'Vue.js', 'TypeScript']),
            website: 'naukri.com',
            posted: '4 days ago',
            createdAt: new Date('2024-01-13').toISOString(),
        },
        {
            title: 'DevOps Engineer',
            company: 'Tech Mahindra',
            location: 'Noida, Uttar Pradesh',
            salary: '₹10-15 LPA',
            type: 'Full-time',
            description: 'We are hiring a DevOps Engineer to streamline our development and deployment processes. You will manage cloud infrastructure, implement CI/CD pipelines, and ensure system reliability and security. Experience with containerization, orchestration, and infrastructure as code is essential for this role.',
            skills: JSON.stringify(['AWS', 'Docker', 'Kubernetes']),
            website: 'linkedin.com',
            posted: '1 week ago',
            createdAt: new Date('2024-01-08').toISOString(),
        },
        {
            title: 'Python Developer',
            company: 'Accenture',
            location: 'Mumbai, Maharashtra',
            salary: '₹9-13 LPA',
            type: 'Full-time',
            description: 'Join our team as a Python Developer to build scalable applications and data solutions. You will develop backend services, integrate third-party APIs, and work with data processing frameworks. Strong expertise in Python programming, web frameworks, and database management is required.',
            skills: JSON.stringify(['Python', 'Django', 'PostgreSQL']),
            website: 'indeed.com',
            posted: '5 days ago',
            createdAt: new Date('2024-01-12').toISOString(),
        }
    ];

    await db.insert(jobs).values(sampleJobs);
    
    console.log('✅ Jobs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});