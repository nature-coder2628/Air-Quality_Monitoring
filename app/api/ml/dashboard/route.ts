// ML Dashboard API - Comprehensive monitoring and management endpoint

import { NextRequest, NextResponse } from "next/server";
import { advancedMLEngine } from "@/lib/ml/advanced-ml-engine";
import { realTimeMonitoring } from "@/lib/ml/real-time-monitoring";
import { autoRetrainingPipeline } from "@/lib/ml/auto-retraining-pipeline";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const section = url.searchParams.get("section") || "overview";

    switch (section) {
      case "overview":
        return NextResponse.json(await getOverviewData());
        
      case "performance":
        return NextResponse.json(await getPerformanceData());
        
      case "monitoring":
        return NextResponse.json(await getMonitoringData());
        
      case "retraining":
        return NextResponse.json(await getRetrainingData());
        
      default:
        return NextResponse.json(
          { error: "Invalid section parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("ML Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ML dashboard data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "trigger_retraining":
        const jobId = await autoRetrainingPipeline.triggerRetraining(
          params.reason || "manual",
          params.metadata || {}
        );
        return NextResponse.json({ success: true, jobId });

      case "update_monitoring_rule":
        const updated = realTimeMonitoring.updateAlertRule(
          params.ruleId,
          params.updates
        );
        return NextResponse.json({ success: updated });

      case "configure_retraining":
        autoRetrainingPipeline.updateConfiguration(params.configuration);
        return NextResponse.json({ success: true });

      case "toggle_retraining":
        autoRetrainingPipeline.setRetrainingEnabled(params.enabled);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("ML Dashboard API POST error:", error);
    return NextResponse.json(
      { error: "Failed to execute ML dashboard action" },
      { status: 500 }
    );
  }
}

async function getOverviewData() {
  const performanceDashboard = advancedMLEngine.getPerformanceDashboard();
  const systemHealth = realTimeMonitoring.getSystemHealth();
  const retrainingStatus = autoRetrainingPipeline.getRetrainingStatus();

  return {
    timestamp: new Date().toISOString(),
    model: {
      version: performanceDashboard.currentMetrics?.modelVersion || "v2.0.0-advanced",
      health: performanceDashboard.modelHealth,
      accuracy: performanceDashboard.currentMetrics?.accuracy || 0,
      confidence: performanceDashboard.currentMetrics?.confidenceCalibration || 0,
      lastUpdate: performanceDashboard.currentMetrics?.timestamp || new Date().toISOString()
    },
    system: {
      status: systemHealth.status,
      healthScore: systemHealth.healthScore,
      errorRate: systemHealth.metrics.errorRate,
      averageLatency: systemHealth.metrics.averageLatency,
      predictionsPerHour: systemHealth.metrics.predictionsPerHour
    },
    retraining: {
      isEnabled: retrainingStatus.isEnabled,
      activeJobs: retrainingStatus.activeJobs.length,
      nextScheduled: retrainingStatus.nextScheduledRetraining,
      lastSuccess: retrainingStatus.recentJobs.find(j => j.status === "completed")?.endTime || null
    },
    alerts: {
      active: systemHealth.recentAlerts.length,
      critical: systemHealth.recentAlerts.filter(a => a.severity === "critical").length,
      warnings: systemHealth.recentAlerts.filter(a => a.severity === "warning").length
    }
  };
}

async function getPerformanceData() {
  const performanceDashboard = advancedMLEngine.getPerformanceDashboard();
  const monitoringDashboard = realTimeMonitoring.getMonitoringDashboard();

  return {
    timestamp: new Date().toISOString(),
    current_metrics: performanceDashboard.currentMetrics,
    performance_trend: performanceDashboard.performanceTrend,
    model_health: performanceDashboard.modelHealth,
    system_metrics: monitoringDashboard.systemHealth.metrics,
    performance_chart: monitoringDashboard.performanceChart,
    drift_alerts: performanceDashboard.driftAlerts,
    retraining_status: performanceDashboard.retrainingStatus,
    recommendations: generatePerformanceRecommendations(performanceDashboard, monitoringDashboard)
  };
}

async function getMonitoringData() {
  const monitoringDashboard = realTimeMonitoring.getMonitoringDashboard();

  return {
    timestamp: new Date().toISOString(),
    system_health: monitoringDashboard.systemHealth,
    recent_events: monitoringDashboard.recentEvents.slice(0, 50),
    alert_rules: monitoringDashboard.alertRules,
    performance_chart: monitoringDashboard.performanceChart,
    metrics_summary: {
      total_predictions_24h: monitoringDashboard.performanceChart.reduce(
        (sum, point) => sum + (point.latency > 0 ? 1 : 0), 0
      ),
      average_latency_24h: Math.round(
        monitoringDashboard.performanceChart.reduce(
          (sum, point) => sum + point.latency, 0
        ) / Math.max(monitoringDashboard.performanceChart.length, 1)
      ),
      error_rate_24h: Math.round(
        monitoringDashboard.performanceChart.reduce(
          (sum, point) => sum + point.errorRate, 0
        ) / Math.max(monitoringDashboard.performanceChart.length, 1) * 100
      ) / 100
    }
  };
}

async function getRetrainingData() {
  const retrainingStatus = autoRetrainingPipeline.getRetrainingStatus();

  return {
    timestamp: new Date().toISOString(),
    is_enabled: retrainingStatus.isEnabled,
    configuration: retrainingStatus.configuration,
    active_jobs: retrainingStatus.activeJobs,
    recent_jobs: retrainingStatus.recentJobs,
    next_scheduled_retraining: retrainingStatus.nextScheduledRetraining,
    success_rate: calculateRetrainingSuccessRate(retrainingStatus.recentJobs),
    average_duration: calculateAverageRetrainingDuration(retrainingStatus.recentJobs),
    triggers_summary: calculateTriggersSummary(retrainingStatus.recentJobs),
    recommendations: generateRetrainingRecommendations(retrainingStatus)
  };
}

function generatePerformanceRecommendations(
  performanceDashboard: any, 
  monitoringDashboard: any
): string[] {
  const recommendations: string[] = [];

  if (performanceDashboard.modelHealth === "poor") {
    recommendations.push("Model performance is poor - consider immediate retraining");
  }

  if (monitoringDashboard.systemHealth.metrics.errorRate > 5) {
    recommendations.push("High error rate detected - investigate data quality issues");
  }

  if (monitoringDashboard.systemHealth.metrics.averageLatency > 3000) {
    recommendations.push("High latency detected - consider model optimization or scaling");
  }

  if (performanceDashboard.driftAlerts.length > 0) {
    recommendations.push("Model drift detected - monitor feature distributions closely");
  }

  if (performanceDashboard.currentMetrics?.accuracy < 0.8) {
    recommendations.push("Model accuracy below threshold - schedule retraining soon");
  }

  return recommendations;
}

function generateRetrainingRecommendations(retrainingStatus: any): string[] {
  const recommendations: string[] = [];
  const recentJobs = retrainingStatus.recentJobs || [];
  const failedJobs = recentJobs.filter((job: any) => job.status === "failed");

  if (failedJobs.length > recentJobs.length * 0.3) {
    recommendations.push("High retraining failure rate - review data quality and model configuration");
  }

  if (retrainingStatus.configuration.regularInterval > 7 * 24) {
    recommendations.push("Consider more frequent retraining for better model freshness");
  }

  if (!retrainingStatus.isEnabled) {
    recommendations.push("Automated retraining is disabled - enable for production systems");
  }

  const avgDuration = calculateAverageRetrainingDuration(recentJobs);
  if (avgDuration > 60 * 60 * 1000) { // > 1 hour
    recommendations.push("Retraining duration is high - consider optimizing the training pipeline");
  }

  return recommendations;
}

function calculateRetrainingSuccessRate(recentJobs: any[]): number {
  if (recentJobs.length === 0) return 100;
  
  const successfulJobs = recentJobs.filter(job => job.status === "completed").length;
  return Math.round((successfulJobs / recentJobs.length) * 100);
}

function calculateAverageRetrainingDuration(recentJobs: any[]): number {
  const completedJobs = recentJobs.filter(job => job.endTime);
  
  if (completedJobs.length === 0) return 0;
  
  const totalDuration = completedJobs.reduce((sum, job) => {
    return sum + (new Date(job.endTime!).getTime() - new Date(job.startTime).getTime());
  }, 0);
  
  return Math.round(totalDuration / completedJobs.length);
}

function calculateTriggersSummary(recentJobs: any[]): Record<string, number> {
  const triggers: Record<string, number> = {};
  
  recentJobs.forEach(job => {
    triggers[job.triggerReason] = (triggers[job.triggerReason] || 0) + 1;
  });
  
  return triggers;
}