"use client"

import { useState, useEffect } from "react"
import { Briefcase, CheckCircle2, Clock, XCircle, TrendingUp, FileText, BarChart3 } from "lucide-react"
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
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Application Dashboard</h2>
          <p className="text-muted-foreground">Track your job applications and success rate</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 shadow-lg border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Total Applications</p>
              <p className="text-4xl font-bold">{displayStats.totalApplications}</p>
            </div>
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-green-200 dark:border-green-800/50 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Successful</p>
              <p className="text-4xl font-bold text-green-600">{displayStats.successfulApplications}</p>
            </div>
            <div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/20 dark:to-amber-950/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Pending</p>
              <p className="text-4xl font-bold text-amber-600">{displayStats.pendingApplications}</p>
            </div>
            <div className="h-14 w-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-sm">
              <Clock className="h-7 w-7 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Failed</p>
              <p className="text-4xl font-bold text-red-600">{displayStats.failedApplications}</p>
            </div>
            <div className="h-14 w-14 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sm">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Success Rate */}
      <Card className="p-6 lg:p-8 shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Success Rate</h3>
          </div>
          <span className="text-3xl font-bold text-primary">{displaySuccessRate.toFixed(1)}%</span>
        </div>
        <Progress value={displaySuccessRate} className="h-4 mb-3" />
        <p className="text-sm text-muted-foreground">
          {displayStats.successfulApplications} out of {displayStats.totalApplications} applications submitted successfully
        </p>
      </Card>

      {/* Application History */}
      <Card className="p-6 lg:p-8 shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Application History
        </h3>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium">All</TabsTrigger>
            <TabsTrigger value="success" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium">Successful</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium">Pending</TabsTrigger>
            <TabsTrigger value="failed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-6">
            {applications.length > 0 ? (
              applications.map((app) => (
                <ApplicationCard key={app.jobId} application={app} />
              ))
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="success" className="space-y-3 mt-6">
            {applications.filter(app => app.status === "success").length > 0 ? (
              applications
                .filter(app => app.status === "success")
                .map((app) => <ApplicationCard key={app.jobId} application={app} />)
            ) : (
              <EmptyState message="No successful applications yet" />
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-6">
            {applications.filter(app => app.status === "pending").length > 0 ? (
              applications
                .filter(app => app.status === "pending")
                .map((app) => <ApplicationCard key={app.jobId} application={app} />)
            ) : (
              <EmptyState message="No pending applications" />
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-3 mt-6">
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
    <div className="flex items-center justify-between p-5 border rounded-xl hover:bg-accent/50 hover:shadow-md transition-all duration-300 bg-card/30">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
          application.status === "success" ? "bg-green-100 dark:bg-green-900/30" :
          application.status === "failed" ? "bg-red-100 dark:bg-red-900/30" :
          "bg-amber-100 dark:bg-amber-900/30"
        }`}>
          {application.status === "success" && <CheckCircle2 className="h-6 w-6 text-green-600" />}
          {application.status === "failed" && <XCircle className="h-6 w-6 text-red-600" />}
          {application.status === "pending" && <Clock className="h-6 w-6 text-amber-600" />}
        </div>
        
        <div>
          <h4 className="font-bold text-base">{application.jobTitle}</h4>
          <p className="text-sm text-muted-foreground">{application.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <Badge variant="outline" className="mb-1.5 shadow-sm">
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
          className={`${
            application.status === "success" ? "bg-green-600 shadow-sm" : "shadow-sm"
          } capitalize`}
        >
          {application.status}
        </Badge>
      </div>
    </div>
  )
}

function EmptyState({ message = "No applications yet" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  )
}

export default Dashboard