"use client"

import { useState } from "react"
import { Search, Briefcase, MapPin, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  description: string
  skills: string[]
  website: string
  posted: string
}

interface JobSearchProps {
  skills: string[]
  onJobsFound: (jobs: Job[]) => void
}

export const JobSearch = ({ skills, onJobsFound }: JobSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundJobs, setFoundJobs] = useState<Job[]>([])
  const [location, setLocation] = useState("")
  const { toast } = useToast()

  const mockJobSearch = (query: string, userSkills: string[]) => {
    const mockJobs: Job[] = [
      {
        id: "1",
        title: "Senior Full Stack Developer",
        company: "Tech Solutions Inc.",
        location: "Bangalore, India",
        salary: "₹15-25 LPA",
        type: "Full-time",
        description: "We are looking for an experienced Full Stack Developer with expertise in React, Node.js, and cloud technologies.",
        skills: ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
        website: "naukri.com",
        posted: "2 days ago"
      },
      {
        id: "2",
        title: "Frontend Developer",
        company: "Digital Innovations",
        location: "Mumbai, India",
        salary: "₹10-18 LPA",
        type: "Full-time",
        description: "Join our team as a Frontend Developer to build cutting-edge web applications using modern frameworks.",
        skills: ["React", "JavaScript", "HTML", "CSS", "TypeScript"],
        website: "naukri.com",
        posted: "1 day ago"
      },
      {
        id: "3",
        title: "DevOps Engineer",
        company: "Cloud Systems Ltd.",
        location: "Hyderabad, India",
        salary: "₹12-20 LPA",
        type: "Full-time",
        description: "Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.",
        skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Python"],
        website: "linkedin.com",
        posted: "3 days ago"
      },
      {
        id: "4",
        title: "Python Developer",
        company: "Data Analytics Corp",
        location: "Pune, India",
        salary: "₹8-15 LPA",
        type: "Full-time",
        description: "Looking for a Python Developer with experience in data processing and API development.",
        skills: ["Python", "Django", "PostgreSQL", "REST API", "Git"],
        website: "indeed.com",
        posted: "5 days ago"
      },
      {
        id: "5",
        title: "Full Stack JavaScript Developer",
        company: "Startup Hub",
        location: "Remote",
        salary: "₹18-30 LPA",
        type: "Full-time",
        description: "Join our fast-growing startup as a Full Stack JavaScript Developer working on innovative products.",
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
        website: "naukri.com",
        posted: "1 week ago"
      },
      {
        id: "6",
        title: "Software Engineer",
        company: "Enterprise Solutions",
        location: "Delhi NCR, India",
        salary: "₹10-16 LPA",
        type: "Full-time",
        description: "We need a Software Engineer with strong problem-solving skills and experience in modern web technologies.",
        skills: ["Java", "Spring Boot", "React", "SQL", "Git"],
        website: "naukri.com",
        posted: "4 days ago"
      }
    ]

    return mockJobs.filter(job => {
      const hasMatchingSkills = job.skills.some(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase() === skill.toLowerCase()
        )
      )
      const matchesQuery = query ? 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase()) : true
      
      return hasMatchingSkills && matchesQuery
    })
  }

  const handleSearch = async () => {
    setIsSearching(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const query = searchQuery || jobDescription
      const jobs = mockJobSearch(query, skills)
      setFoundJobs(jobs)
      
      // Save jobs to database
      if (jobs.length > 0) {
        const jobsToSave = jobs.map(job => ({
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type,
          description: job.description,
          skills: job.skills,
          website: job.website,
          posted: job.posted
        }))

        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobsToSave)
        })

        if (!response.ok) {
          throw new Error('Failed to save jobs')
        }

        const savedJobs = await response.json()
        
        // Update jobs with database IDs
        const jobsWithIds = savedJobs.map((job: any) => ({
          id: job.id.toString(),
          title: job.title,
          company: job.company,
          location: job.location || "",
          salary: job.salary || "",
          type: job.type || "",
          description: job.description || "",
          skills: job.skills || [],
          website: job.website || "",
          posted: job.posted || ""
        }))
        
        onJobsFound(jobsWithIds)
        
        toast({
          title: "Jobs found and saved",
          description: `Found ${jobs.length} matching jobs.`
        })
      } else {
        toast({
          title: "No jobs found",
          description: "Try adjusting your search criteria.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error searching jobs:', error)
      toast({
        title: "Error searching jobs",
        description: "Failed to save jobs to database.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Search for Jobs</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-query">Job Title or Keywords</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="search-query"
                placeholder="e.g., Full Stack Developer, Python Engineer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Bangalore, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="job-description">Or Paste Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste a job description to find similar opportunities..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-2 min-h-[120px]"
            />
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isSearching || skills.length === 0}
            className="w-full"
            size="lg"
          >
            {isSearching ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </>
            )}
          </Button>

          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Please upload a resume first to enable job search
            </p>
          )}
        </div>
      </Card>

      {foundJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Found {foundJobs.length} Jobs</h3>
          </div>

          {foundJobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold mb-1">{job.title}</h4>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  <Badge variant="secondary">{job.website}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.posted}
                  </div>
                </div>

                <p className="text-sm">{job.description}</p>

                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobSearch