// Real-time ML Model Monitoring and Performance Tracking
// Production-grade monitoring for air quality prediction models

export interface MonitoringEvent {
  id: string;
  timestamp: string;
  type: "prediction" | "performance" | "drift" | "alert" | "retraining";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  metadata: Record<string, any>;
}

export interface SystemMetrics {
  predictionsPerHour: number;
  averageLatency: number;
  errorRate: number;
  dataIngestionRate: number;
  modelMemoryUsage: number;
  apiCallsRemaining?: number;
  systemLoad: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: "warning" | "error" | "critical";
  cooldownMinutes: number;
  enabled: boolean;
}

class RealTimeMonitoring {
  private events: MonitoringEvent[] = [];
  private metrics: SystemMetrics;
  private alertRules: AlertRule[] = [];
  private lastAlertTimes: Map<string, number> = new Map();

  constructor() {
    this.metrics = {
      predictionsPerHour: 0,
      averageLatency: 0,
      errorRate: 0,
      dataIngestionRate: 0,
      modelMemoryUsage: 0,
      systemLoad: 0
    };

    this.initializeAlertRules();
    this.startMetricsCollection();
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: "high-error-rate",
        name: "High Error Rate",
        condition: "error_rate > threshold",
        threshold: 5.0, // 5%
        severity: "error",
        cooldownMinutes: 15,
        enabled: true
      },
      {
        id: "high-latency",
        name: "High Prediction Latency", 
        condition: "average_latency > threshold",
        threshold: 5000, // 5 seconds
        severity: "warning",
        cooldownMinutes: 10,
        enabled: true
      },
      {
        id: "low-data-quality",
        name: "Low Data Quality",
        condition: "data_quality_score < threshold",
        threshold: 0.7, // 70%
        severity: "warning",
        cooldownMinutes: 30,
        enabled: true
      },
      {
        id: "model-drift",
        name: "Model Drift Detected",
        condition: "drift_score > threshold",
        threshold: 0.4,
        severity: "error",
        cooldownMinutes: 60,
        enabled: true
      },
      {
        id: "high-system-load",
        name: "High System Load",
        condition: "system_load > threshold",
        threshold: 80.0, // 80%
        severity: "warning",
        cooldownMinutes: 5,
        enabled: true
      },
      {
        id: "api-quota-low",
        name: "API Quota Running Low",
        condition: "api_calls_remaining < threshold",
        threshold: 100,
        severity: "warning",
        cooldownMinutes: 60,
        enabled: true
      }
    ];
  }

  /**
   * Start collecting system metrics
   */
  private startMetricsCollection(): void {
    // Update metrics every minute
    setInterval(() => {
      this.updateSystemMetrics();
      this.checkAlertRules();
    }, 60000);

    // Update real-time metrics every 10 seconds
    setInterval(() => {
      this.updateRealTimeMetrics();
    }, 10000);
  }

  /**
   * Log a monitoring event
   */
  logEvent(type: MonitoringEvent["type"], severity: MonitoringEvent["severity"], message: string, metadata: Record<string, any> = {}): void {
    const event: MonitoringEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      severity,
      message,
      metadata
    };

    this.events.push(event);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log to console for immediate visibility
    const logLevel = severity === "critical" || severity === "error" ? "error" : 
                    severity === "warning" ? "warn" : "info";
    console[logLevel](`[ML Monitor] ${message}`, metadata);

    // Store critical events persistently (in production, this would go to a database)
    if (severity === "critical" || severity === "error") {
      this.persistCriticalEvent(event);
    }
  }

  /**
   * Track a prediction request
   */
  trackPrediction(startTime: number, endTime: number, success: boolean, metadata: Record<string, any> = {}): void {
    const latency = endTime - startTime;
    
    // Update metrics
    this.updatePredictionMetrics(latency, success);

    // Log event
    this.logEvent("prediction", success ? "info" : "error", 
      `Prediction ${success ? "completed" : "failed"} in ${latency}ms`, 
      { ...metadata, latency, success });

    // Check for performance issues
    if (latency > 5000) {
      this.logEvent("performance", "warning", `Slow prediction detected: ${latency}ms`, metadata);
    }

    if (!success) {
      this.logEvent("performance", "error", "Prediction failed", metadata);
    }
  }

  /**
   * Update prediction-related metrics
   */
  private updatePredictionMetrics(latency: number, success: boolean): void {
    // Update predictions per hour (simplified)
    this.metrics.predictionsPerHour += 1;

    // Update average latency (exponential moving average)
    const alpha = 0.1;
    this.metrics.averageLatency = this.metrics.averageLatency === 0 ? 
      latency : 
      this.metrics.averageLatency * (1 - alpha) + latency * alpha;

    // Update error rate
    const currentErrors = this.events
      .filter(e => e.type === "prediction" && e.severity === "error" && 
              new Date(e.timestamp).getTime() > Date.now() - 3600000)
      .length;
    
    const totalPredictions = this.events
      .filter(e => e.type === "prediction" && 
              new Date(e.timestamp).getTime() > Date.now() - 3600000)
      .length;

    this.metrics.errorRate = totalPredictions > 0 ? (currentErrors / totalPredictions) * 100 : 0;
  }

  /**
   * Update system-level metrics
   */
  private updateSystemMetrics(): void {
    // Simulate system metrics (in production, these would be real measurements)
    this.metrics.systemLoad = 20 + Math.random() * 40; // 20-60%
    this.metrics.modelMemoryUsage = 50 + Math.random() * 30; // 50-80 MB
    this.metrics.dataIngestionRate = 10 + Math.random() * 20; // 10-30 records/min

    // Reset hourly counters
    const oneHourAgo = Date.now() - 3600000;
    const recentPredictions = this.events.filter(e => 
      e.type === "prediction" && new Date(e.timestamp).getTime() > oneHourAgo
    );
    this.metrics.predictionsPerHour = recentPredictions.length;
  }

  /**
   * Update real-time metrics
   */
  private updateRealTimeMetrics(): void {
    // Update API quota if available
    if (process.env.OPENAI_API_KEY) {
      // Simulate API quota tracking (in production, this would query actual usage)
      this.metrics.apiCallsRemaining = 800 + Math.floor(Math.random() * 200);
    }
  }

  /**
   * Check all alert rules and trigger alerts if needed
   */
  private checkAlertRules(): void {
    this.alertRules
      .filter(rule => rule.enabled)
      .forEach(rule => this.evaluateAlertRule(rule));
  }

  /**
   * Evaluate a specific alert rule
   */
  private evaluateAlertRule(rule: AlertRule): void {
    const lastAlertTime = this.lastAlertTimes.get(rule.id) || 0;
    const cooldownPeriod = rule.cooldownMinutes * 60 * 1000;
    
    // Check if still in cooldown period
    if (Date.now() - lastAlertTime < cooldownPeriod) {
      return;
    }

    let shouldAlert = false;
    let currentValue: number = 0;
    let context: Record<string, any> = {};

    // Evaluate condition
    switch (rule.id) {
      case "high-error-rate":
        currentValue = this.metrics.errorRate;
        shouldAlert = currentValue > rule.threshold;
        context = { errorRate: currentValue, threshold: rule.threshold };
        break;

      case "high-latency":
        currentValue = this.metrics.averageLatency;
        shouldAlert = currentValue > rule.threshold;
        context = { averageLatency: currentValue, threshold: rule.threshold };
        break;

      case "high-system-load":
        currentValue = this.metrics.systemLoad;
        shouldAlert = currentValue > rule.threshold;
        context = { systemLoad: currentValue, threshold: rule.threshold };
        break;

      case "api-quota-low":
        currentValue = this.metrics.apiCallsRemaining || 0;
        shouldAlert = currentValue < rule.threshold;
        context = { apiCallsRemaining: currentValue, threshold: rule.threshold };
        break;
    }

    if (shouldAlert) {
      this.triggerAlert(rule, currentValue, context);
      this.lastAlertTimes.set(rule.id, Date.now());
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, currentValue: number, context: Record<string, any>): void {
    const message = `Alert: ${rule.name} - Current value: ${currentValue}, Threshold: ${rule.threshold}`;
    
    this.logEvent("alert", rule.severity, message, {
      ruleId: rule.id,
      ruleName: rule.name,
      currentValue,
      threshold: rule.threshold,
      ...context
    });

    // In production, this would send notifications (email, Slack, etc.)
    console.warn(`🚨 ML MONITORING ALERT: ${message}`);
  }

  /**
   * Persist critical events for long-term analysis
   */
  private persistCriticalEvent(event: MonitoringEvent): void {
    // In production, this would save to a database or external monitoring service
    console.error("CRITICAL EVENT:", event);
  }

  /**
   * Get current system health status
   */
  getSystemHealth(): {
    status: "healthy" | "degraded" | "critical";
    metrics: SystemMetrics;
    recentAlerts: MonitoringEvent[];
    healthScore: number;
  } {
    const recentAlerts = this.events
      .filter(e => e.type === "alert" && new Date(e.timestamp).getTime() > Date.now() - 3600000)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const criticalAlerts = recentAlerts.filter(e => e.severity === "critical").length;
    const errorAlerts = recentAlerts.filter(e => e.severity === "error").length;
    const warningAlerts = recentAlerts.filter(e => e.severity === "warning").length;

    // Calculate health score (0-100)
    let healthScore = 100;
    healthScore -= criticalAlerts * 30;
    healthScore -= errorAlerts * 15;
    healthScore -= warningAlerts * 5;
    healthScore -= this.metrics.errorRate * 2;
    healthScore -= Math.max(0, (this.metrics.averageLatency - 1000) / 100);

    healthScore = Math.max(0, Math.min(100, healthScore));

    let status: "healthy" | "degraded" | "critical";
    if (criticalAlerts > 0 || healthScore < 30) status = "critical";
    else if (errorAlerts > 2 || warningAlerts > 5 || healthScore < 70) status = "degraded";
    else status = "healthy";

    return {
      status,
      metrics: this.metrics,
      recentAlerts,
      healthScore
    };
  }

  /**
   * Get monitoring dashboard data
   */
  getMonitoringDashboard(): {
    systemHealth: ReturnType<typeof this.getSystemHealth>;
    recentEvents: MonitoringEvent[];
    alertRules: AlertRule[];
    performanceChart: Array<{ timestamp: string; latency: number; errorRate: number }>;
  } {
    const systemHealth = this.getSystemHealth();
    
    const recentEvents = this.events
      .filter(e => new Date(e.timestamp).getTime() > Date.now() - 24 * 3600000)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);

    // Generate performance chart data (last 24 hours)
    const performanceChart: Array<{ timestamp: string; latency: number; errorRate: number }> = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = Date.now() - i * 3600000;
      const hourEnd = hourStart + 3600000;
      
      const hourEvents = this.events.filter(e => 
        e.type === "prediction" && 
        new Date(e.timestamp).getTime() >= hourStart && 
        new Date(e.timestamp).getTime() < hourEnd
      );

      const avgLatency = hourEvents.length > 0 ? 
        hourEvents.reduce((sum, e) => sum + (e.metadata.latency || 0), 0) / hourEvents.length : 0;
      
      const errorCount = hourEvents.filter(e => e.severity === "error").length;
      const errorRate = hourEvents.length > 0 ? (errorCount / hourEvents.length) * 100 : 0;

      performanceChart.push({
        timestamp: new Date(hourStart).toISOString(),
        latency: Math.round(avgLatency),
        errorRate: Math.round(errorRate * 100) / 100
      });
    }

    return {
      systemHealth,
      recentEvents,
      alertRules: this.alertRules,
      performanceChart
    };
  }

  /**
   * Update alert rule configuration
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    
    this.logEvent("alert", "info", `Alert rule updated: ${ruleId}`, { 
      ruleId, 
      updates 
    });

    return true;
  }
}

// Singleton instance
export const realTimeMonitoring = new RealTimeMonitoring();