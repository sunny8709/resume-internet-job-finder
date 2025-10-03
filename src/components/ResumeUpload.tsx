"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X, CheckCircle2 } from "lucide-react"
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
      <Card className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          {!uploadedFile ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your resume or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports PDF, DOC, DOCX, and TXT files
                </p>
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                <Button asChild>
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                {isProcessing ? (
                  <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                ) : (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                )}
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{uploadedFile.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isProcessing ? "Processing and saving resume..." : "Resume uploaded successfully"}
                </p>
                {!isProcessing && (
                  <Button variant="outline" onClick={handleRemoveFile}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {extractedSkills.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Extracted Skills</h3>
          <div className="flex flex-wrap gap-2">
            {extractedSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            These skills will be used to find relevant job opportunities
          </p>
        </Card>
      )}
    </div>
  )
}

export default ResumeUpload