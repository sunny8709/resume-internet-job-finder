"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ResumeUploadProps {
  onSkillsExtracted: (skills: string[]) => void
  onResumeUploaded: (resumeText: string) => void
}

export const ResumeUpload = ({ onSkillsExtracted, onResumeUploaded }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [resumeText, setResumeText] = useState("")
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const extractSkillsFromText = (text: string): string[] => {
    const commonSkills = [
      "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++",
      "SQL", "MongoDB", "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes",
      "Git", "Agile", "Scrum", "REST API", "GraphQL", "HTML", "CSS",
      "Angular", "Vue.js", "Express", "Django", "Flask", "Spring Boot",
      "Machine Learning", "Data Analysis", "DevOps", "CI/CD", "Jenkins",
      "TensorFlow", "PyTorch", "Pandas", "NumPy", "Leadership", "Communication",
      "Problem Solving", "Team Management", "Project Management", "Excel"
    ]

    const foundSkills: string[] = []
    const lowerText = text.toLowerCase()

    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill)
      }
    })

    return foundSkills
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        setResumeText(text)
        
        const skills = extractSkillsFromText(text)
        setExtractedSkills(skills)
        
        // Save to database with authentication
        const token = localStorage.getItem("bearer_token")
        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            resumeText: text,
            skills: skills,
            fileSize: file.size,
            fileType: file.type
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save resume')
        }

        onSkillsExtracted(skills)
        onResumeUploaded(text)
        
        toast({
          title: "Resume uploaded successfully",
          description: `Found ${skills.length} skills in your resume.`
        })
      } catch (error) {
        console.error('Error processing resume:', error)
        toast({
          title: "Error uploading resume",
          description: "Failed to save resume to database.",
          variant: "destructive"
        })
      } finally {
        setIsProcessing(false)
      }
    }
    
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === "application/pdf" || 
          file.type === "application/msword" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "text/plain") {
        setUploadedFile(file)
        processFile(file)
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      processFile(file)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setExtractedSkills([])
    setResumeText("")
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 lg:p-10 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 lg:p-16 text-center transition-all duration-300 ${
            isDragging 
              ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20" 
              : "border-border hover:border-primary/50 hover:bg-accent/5"
          }`}
        >
          {!uploadedFile ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/25">
                    <Upload className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Upload Your Resume</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Drag and drop your resume or click to browse
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="font-normal">PDF</Badge>
                  <Badge variant="outline" className="font-normal">DOC</Badge>
                  <Badge variant="outline" className="font-normal">DOCX</Badge>
                  <Badge variant="outline" className="font-normal">TXT</Badge>
                </div>
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                <div className="pt-4">
                  <Button asChild size="lg" className="shadow-lg shadow-primary/25 gap-2">
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Sparkles className="h-4 w-4" />
                      Choose File
                    </label>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                {isProcessing ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/25">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">{uploadedFile.name}</span>
                </div>
                <p className="text-muted-foreground">
                  {isProcessing ? "Processing and extracting skills..." : "Resume uploaded successfully!"}
                </p>
                {!isProcessing && (
                  <div className="pt-2">
                    <Button variant="outline" onClick={handleRemoveFile} className="gap-2">
                      <X className="h-4 w-4" />
                      Remove File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {extractedSkills.length > 0 && (
        <Card className="p-6 lg:p-8 shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Extracted Skills</h3>
              <p className="text-sm text-muted-foreground">Found {extractedSkills.length} relevant skills</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {extractedSkills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-sm px-3 py-1.5 bg-card hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
              >
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            These skills will be used to find relevant job opportunities matching your profile
          </p>
        </Card>
      )}
    </div>
  )
}

export default ResumeUpload