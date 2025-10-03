"use client"

import { useState, useEffect } from "react"
import { Briefcase, CheckCircle2, Clock, XCircle, TrendingUp, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface DashboardStats {
  totalApplications: number
  successfulApplications: number
  pendingApplications: number
  failedApplications: number
}

interface ApplicationHistory {
  jobId: string
  jobTitle: string
  company: string
  status: "success" | "failed" | "pending"
  appliedAt: string
  website: string
}

interface DashboardProps {
  applications: ApplicationHistory[]
  stats: DashboardStats
}

export const Dashboard = ({ applications, stats }: DashboardProps) => {
  const [successRate, setSuccessRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dbStats, setDbStats] = useState<any>(null)

  useEffect(() => {
    if (stats.totalApplications > 0) {
      setSuccessRate((stats.successfulApplications / stats.totalApplications) * 100)
    }
  }, [stats])

  // Fetch stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/applications/stats')
        if (response.ok) {
          const data = await response.json()
          setDbStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [applications])

  // Use database stats if available, otherwise use prop stats
  const displayStats = dbStats ? {
    totalApplications: dbStats.total || 0,
    successfulApplications: dbStats.byStatus?.success || 0,
    pendingApplications: dbStats.byStatus?.pending || 0,
    failedApplications: dbStats.byStatus?.failed || 0,
  } : stats

  const displaySuccessRate = dbStats ? dbStats.successRate || 0 : successRate

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Application Dashboard</h2>
        <p className="text-muted-foreground">Track your job applications and success rate</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
              <p className="text-3xl font-bold">{displayStats.totalApplications}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Successful</p>
              <p className="text-3xl font-bold text-green-600">{displayStats.successfulApplications}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{displayStats.pendingApplications}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-600">{displayStats.failedApplications}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Success Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Success Rate</h3>
          </div>
          <span className="text-2xl font-bold">{displaySuccessRate.toFixed(1)}%</span>
        </div>
        <Progress value={displaySuccessRate} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {displayStats.successfulApplications} out of {displayStats.totalApplications} applications submitted successfully
        </p>
      </Card>

      {/* Application History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Application History</h3>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="success">Successful</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {applications.length > 0 ? (
              applications.map((app) => (
                <ApplicationCard key={app.jobId} application={app} />
              ))
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="success" className="space-y-4 mt-4">
            {applications.filter(app => app.status === "success").length > 0 ? (
              applications
                .filter(app => app.status === "success")
                .map((app) => <ApplicationCard key={app.jobId} application={app} />)
            ) : (
              <EmptyState message="No successful applications yet" />
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {applications.filter(app => app.status === "pending").length > 0 ? (
              applications
                .filter(app => app.status === "pending")
                .map((app) => <ApplicationCard key={app.jobId} application={app} />)
            ) : (
              <EmptyState message="No pending applications" />
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4 mt-4">
            {applications.filter(app => app.status === "failed").length > 0 ? (
              applications
                .filter(app => app.status === "failed")
                .map((app) => <ApplicationCard key={app.jobId} application={app} />)
            ) : (
              <EmptyState message="No failed applications" />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function ApplicationCard({ application }: { application: ApplicationHistory }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          application.status === "success" ? "bg-green-100 dark:bg-green-950/20" :
          application.status === "failed" ? "bg-red-100 dark:bg-red-950/20" :
          "bg-amber-100 dark:bg-amber-950/20"
        }`}>
          {application.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          {application.status === "failed" && <XCircle className="h-5 w-5 text-red-600" />}
          {application.status === "pending" && <Clock className="h-5 w-5 text-amber-600" />}
        </div>
        
        <div>
          <h4 className="font-semibold">{application.jobTitle}</h4>
          <p className="text-sm text-muted-foreground">{application.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <Badge variant="outline" className="mb-1">
            {application.website}
          </Badge>
          <p className="text-xs text-muted-foreground">{application.appliedAt}</p>
        </div>
        
        <Badge 
          variant={
            application.status === "success" ? "default" :
            application.status === "failed" ? "destructive" :
            "secondary"
          }
          className={
            application.status === "success" ? "bg-green-600" : ""
          }
        >
          {application.status}
        </Badge>
      </div>
    </div>
  )
}

function EmptyState({ message = "No applications yet" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

export default Dashboard