"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Search, Send, BarChart3, LogOut, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { authClient, useSession } from "@/lib/auth-client"
import ResumeUpload from "@/components/ResumeUpload"
import JobSearch from "@/components/JobSearch"
import JobApplicationAutomation from "@/components/JobApplicationAutomation"
import Dashboard from "@/components/Dashboard"

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

interface ApplicationHistory {
  jobId: string
  jobTitle: string
  company: string
  status: "success" | "failed" | "pending"
  appliedAt: string
  website: string
}

export default function Home() {
  const { data: session, isPending, refetch } = useSession()
  const router = useRouter()
  const [skills, setSkills] = useState<string[]>([])
  const [resumeText, setResumeText] = useState("")
  const [foundJobs, setFoundJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<ApplicationHistory[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login")
    }
  }, [session, isPending, router])

  // Load initial data from database
  useEffect(() => {
    const loadInitialData = async () => {
      if (!session?.user) return
      
      try {
        setIsLoadingData(true)
        
        const token = localStorage.getItem("bearer_token")
        const headers = {
          Authorization: `Bearer ${token}`
        }

        // Load latest resume
        const resumesRes = await fetch('/api/resumes?limit=1', { headers })
        if (resumesRes.ok) {
          const resumes = await resumesRes.json()
          if (resumes.length > 0) {
            setResumeText(resumes[0].resumeText || "")
            setSkills(resumes[0].skills || [])
          }
        }

        // Load saved jobs
        const jobsRes = await fetch('/api/jobs?limit=100', { headers })
        if (jobsRes.ok) {
          const dbJobs = await jobsRes.json()
          const formattedJobs = dbJobs.map((job: any) => ({
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
          setFoundJobs(formattedJobs)
        }

        // Load applications
        const appsRes = await fetch('/api/applications?limit=100', { headers })
        if (appsRes.ok) {
          const dbApps = await appsRes.json()
          const formattedApps = dbApps.map((app: any) => ({
            jobId: app.jobId.toString(),
            jobTitle: app.jobTitle || "",
            company: app.company || "",
            status: app.status as "success" | "failed" | "pending",
            appliedAt: app.appliedAt || new Date(app.createdAt).toLocaleDateString(),
            website: app.website || ""
          }))
          setApplications(formattedApps)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (session?.user) {
      loadInitialData()
    }
  }, [session])

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token")
    
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    if (error?.code) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    } else {
      localStorage.removeItem("bearer_token")
      refetch()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      })
      router.push("/login")
    }
  }

  const handleSkillsExtracted = (extractedSkills: string[]) => {
    setSkills(extractedSkills)
    setTimeout(() => setActiveTab("search"), 500)
  }

  const handleResumeUploaded = (text: string) => {
    setResumeText(text)
  }

  const handleJobsFound = (jobs: Job[]) => {
    setFoundJobs(jobs)
    setTimeout(() => setActiveTab("apply"), 500)
  }

  const handleApplicationComplete = (jobId: string, status: "success" | "failed") => {
    const job = foundJobs.find(j => j.id === jobId)
    if (job) {
      const newApplication: ApplicationHistory = {
        jobId,
        jobTitle: job.title,
        company: job.company,
        status,
        appliedAt: new Date().toLocaleDateString(),
        website: job.website
      }
      setApplications(prev => [newApplication, ...prev])
    }
  }

  const stats = {
    totalApplications: applications.length,
    successfulApplications: applications.filter(app => app.status === "success").length,
    pendingApplications: applications.filter(app => app.status === "pending").length,
    failedApplications: applications.filter(app => app.status === "failed").length
  }

  if (isPending || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">JobAutoApply</h1>
              <p className="text-muted-foreground">Automated job application system</p>
            </div>
            <div className="flex items-center gap-4">
              {skills.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Skills Detected</p>
                  <p className="text-xl font-semibold">{skills.length}</p>
                </div>
              )}
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Resume</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2" disabled={skills.length === 0}>
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search Jobs</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="apply" className="gap-2" disabled={foundJobs.length === 0}>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Auto Apply</span>
              <span className="sm:hidden">Apply</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <ResumeUpload 
              onSkillsExtracted={handleSkillsExtracted}
              onResumeUploaded={handleResumeUploaded}
            />
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            <JobSearch 
              skills={skills}
              onJobsFound={handleJobsFound}
            />
          </TabsContent>

          <TabsContent value="apply" className="mt-0">
            <JobApplicationAutomation 
              jobs={foundJobs}
              resumeText={resumeText}
              onApplicationComplete={handleApplicationComplete}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard 
              applications={applications}
              stats={stats}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 JobAutoApply. Streamline your job search with automated applications.</p>
          <p className="mt-2">
            <span className="font-semibold">Disclaimer:</span> This is a demonstration app. 
            Always review and customize your applications before submission.
          </p>
        </div>
      </footer>
    </div>
  )
}