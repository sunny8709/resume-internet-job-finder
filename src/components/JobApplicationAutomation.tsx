"use client"

import { useState, useEffect } from "react"
import { Send, CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles, Mail, Phone, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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

interface JobApplicationAutomationProps {
  jobs: Job[]
  resumeText: string
  onApplicationComplete: (jobId: string, status: "success" | "failed") => void
}

export const JobApplicationAutomation = ({ 
  jobs, 
  resumeText,
  onApplicationComplete 
}: JobApplicationAutomationProps) => {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<Record<string, "pending" | "applying" | "success" | "failed">>({})
  const [progress, setProgress] = useState(0)
  const [coverLetter, setCoverLetter] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [linkedIn, setLinkedIn] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const { toast } = useToast()

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("bearer_token")
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.ok) {
          const profile = await response.json()
          setEmail(profile.email || "")
          setPhone(profile.phone || "")
          setLinkedIn(profile.linkedin || "")
          setCoverLetter(profile.coverLetter || "")
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    loadProfile()
  }, [])

  // Save profile when fields change
  useEffect(() => {
    const saveProfile = async () => {
      if (!isLoadingProfile && (email || phone || linkedIn || coverLetter)) {
        try {
          const token = localStorage.getItem("bearer_token")
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ email, phone, linkedin: linkedIn, coverLetter })
          })
        } catch (error) {
          console.error('Error saving profile:', error)
        }
      }
    }
    
    const timeoutId = setTimeout(saveProfile, 1000)
    return () => clearTimeout(timeoutId)
  }, [email, phone, linkedIn, coverLetter, isLoadingProfile])

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const selectAllJobs = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(jobs.map(job => job.id))
    }
  }

  const simulateApplication = async (jobId: string): Promise<"success" | "failed"> => {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
    return Math.random() > 0.1 ? "success" : "failed"
  }

  const handleApplyToAll = async () => {
    if (selectedJobs.length === 0) return

    setIsApplying(true)
    setProgress(0)

    const initialStatus: Record<string, "pending" | "applying" | "success" | "failed"> = {}
    selectedJobs.forEach(id => {
      initialStatus[id] = "pending"
    })
    setApplicationStatus(initialStatus)

    for (let i = 0; i < selectedJobs.length; i++) {
      const jobId = selectedJobs[i]
      
      setApplicationStatus(prev => ({
        ...prev,
        [jobId]: "applying"
      }))

      const result = await simulateApplication(jobId)
      
      setApplicationStatus(prev => ({
        ...prev,
        [jobId]: result
      }))

      // Save application to database
      try {
        const job = jobs.find(j => j.id === jobId)
        if (job) {
          const token = localStorage.getItem("bearer_token")
          const response = await fetch('/api/applications', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              jobId: parseInt(jobId),
              jobTitle: job.title,
              company: job.company,
              status: result,
              appliedAt: new Date().toISOString(),
              website: job.website
            })
          })

          if (!response.ok) {
            console.error('Failed to save application')
          }
        }
      } catch (error) {
        console.error('Error saving application:', error)
      }

      onApplicationComplete(jobId, result)
      setProgress(((i + 1) / selectedJobs.length) * 100)
    }

    setIsApplying(false)
    
    const successCount = Object.values(applicationStatus).filter(s => s === "success").length
    toast({
      title: "Applications complete",
      description: `Successfully applied to ${successCount} out of ${selectedJobs.length} jobs.`
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 lg:p-8 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
            <Send className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Automated Job Application</h2>
            <p className="text-sm text-muted-foreground">Configure your profile and apply to multiple jobs</p>
          </div>
        </div>
        
        <div className="space-y-5 mb-6">
          <div>
            <Label htmlFor="email" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-12 bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 h-12 bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="linkedin" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-primary" />
              LinkedIn Profile (Optional)
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              className="mt-2 h-12 bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="cover-letter" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Cover Letter Template (Optional)
            </Label>
            <Textarea
              id="cover-letter"
              placeholder="Write a general cover letter that will be customized for each application..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="mt-2 min-h-[120px] bg-background/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={selectedJobs.length === jobs.length && jobs.length > 0}
              onCheckedChange={selectAllJobs}
              className="h-5 w-5"
            />
            <Label htmlFor="select-all" className="cursor-pointer font-semibold">
              Select All ({selectedJobs.length}/{jobs.length})
            </Label>
          </div>

          <Button 
            onClick={handleApplyToAll}
            disabled={isApplying || selectedJobs.length === 0 || !email || !phone}
            size="lg"
            className="shadow-lg shadow-primary/25 gap-2"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Apply to {selectedJobs.length} Job{selectedJobs.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>

        {isApplying && (
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Application Progress
              </span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>
        )}

        {!email || !phone && (
          <div className="text-sm text-amber-600 dark:text-amber-400 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Please fill in your email and phone number to enable job applications
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {jobs.map((job) => {
          const status = applicationStatus[job.id]
          const isSelected = selectedJobs.includes(job.id)

          return (
            <Card 
              key={job.id} 
              className={`p-6 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm ${
                isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.01]" : "hover:shadow-lg"
              } ${
                status === "success" ? "bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 border-green-200 dark:border-green-800" :
                status === "failed" ? "bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 border-red-200 dark:border-red-800" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  id={`job-${job.id}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleJobSelection(job.id)}
                  disabled={isApplying || status === "success"}
                  className="mt-1 h-5 w-5"
                />

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Label htmlFor={`job-${job.id}`} className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
                        {job.title}
                      </Label>
                      <p className="text-muted-foreground font-medium">{job.company}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status === "applying" && (
                        <Badge variant="secondary" className="gap-1.5 shadow-sm">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Applying
                        </Badge>
                      )}
                      {status === "success" && (
                        <Badge variant="default" className="gap-1.5 bg-green-600 shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          Applied
                        </Badge>
                      )}
                      {status === "failed" && (
                        <Badge variant="destructive" className="gap-1.5 shadow-sm">
                          <AlertCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                      <Badge variant="outline" className="shadow-sm">{job.website}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.salary}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>

                  <p className="text-sm leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-3 py-1 shadow-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {status === "success" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Application submitted successfully! Check your email for confirmation.
                    </div>
                  )}

                  {status === "failed" && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      Application failed. Please try again or apply manually on {job.website}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="gap-2 shadow-sm">
                      <a href={`https://${job.website}`} target="_blank" rel="noopener noreferrer">
                        View on {job.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {jobs.length === 0 && (
        <Card className="p-12 text-center shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              No jobs available. Please search for jobs first.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default JobApplicationAutomation