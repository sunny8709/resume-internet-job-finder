"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Search, Send, BarChart3, LogOut, User, Sparkles, Zap } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-6 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-lg font-medium text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Premium Header */}
      <header className="border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Top bar with gradient accent */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-accent animate-gradient" />
          
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  JobAutoApply
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  AI-Powered Job Application Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {skills.length > 0 && (
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Skills Detected</p>
                    <p className="text-lg font-bold text-primary">{skills.length}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 pl-4 border-l border-border/40">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="h-10 w-10 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-card/50 backdrop-blur-sm p-1.5 shadow-sm">
            <TabsTrigger 
              value="upload" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all rounded-lg"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Upload Resume</span>
              <span className="sm:hidden font-semibold">Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all rounded-lg" 
              disabled={skills.length === 0}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Search Jobs</span>
              <span className="sm:hidden font-semibold">Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="apply" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all rounded-lg" 
              disabled={foundJobs.length === 0}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Auto Apply</span>
              <span className="sm:hidden font-semibold">Apply</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all rounded-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Dashboard</span>
              <span className="sm:hidden font-semibold">Stats</span>
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

      {/* Premium Footer */}
      <footer className="border-t border-border/40 mt-20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-1 w-8 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <p className="font-medium">© 2024 JobAutoApply. Streamline your job search with AI automation.</p>
              <div className="h-1 w-8 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              <span className="font-semibold text-primary">Disclaimer:</span> This is a demonstration platform. 
              Always review and customize your applications before final submission to ensure accuracy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}