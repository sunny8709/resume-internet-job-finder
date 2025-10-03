import { db } from '@/db';
import { applications } from '@/db/schema';

async function main() {
    const sampleApplications = [
        {
            jobId: 1,
            jobTitle: 'Full Stack Developer',
            company: 'TCS',
            status: 'success',
            appliedAt: '2024-01-15T10:30:00Z',
            website: 'naukri.com',
            createdAt: '2024-01-15T10:35:00Z',
        },
        {
            jobId: 3,
            jobTitle: 'Backend Developer',
            company: 'Wipro',
            status: 'failed',
            appliedAt: '2024-01-16T14:20:00Z',
            website: 'indeed.com',
            createdAt: '2024-01-16T14:25:00Z',
        },
        {
            jobId: 5,
            jobTitle: 'DevOps Engineer',
            company: 'Tech Mahindra',
            status: 'pending',
            appliedAt: '2024-01-17T09:45:00Z',
            website: 'linkedin.com',
            createdAt: '2024-01-17T09:50:00Z',
        }
    ];

    await db.insert(applications).values(sampleApplications);
    
    console.log('✅ Applications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});