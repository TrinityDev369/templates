# Monitoring Stack

Grafana dashboards, Prometheus configuration, alert rules, and a Docker Compose stack for local and production monitoring.

## Quick Start

```bash
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

| Service        | URL                       | Credentials   |
|----------------|---------------------------|---------------|
| Grafana        | http://localhost:3001      | admin / admin |
| Prometheus     | http://localhost:9090      | -             |
| Node Exporter  | http://localhost:9100      | -             |

Dashboards are automatically provisioned on first boot. Open Grafana and navigate to **Dashboards** to see:

- **Application Overview** -- HTTP request rates, error rates, latency percentiles, system gauges, business KPIs
- **Node Exporter** -- Host-level CPU, memory, disk, and network metrics

## Adding Custom Metrics to Your App

Expose a `/metrics` endpoint from your application using a Prometheus client library.

### Node.js (prom-client)

```js
import { collectDefaultMetrics, Registry, Counter, Histogram } from "prom-client";

const register = new Registry();
collectDefaultMetrics({ register });

// Custom counters and histograms
const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "status", "path"],
  registers: [register],
});

const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "status", "path"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Express middleware example
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, path: req.route?.path || req.path });
  res.on("finish", () => {
    httpRequests.inc({ method: req.method, status: res.statusCode, path: req.route?.path || req.path });
    end({ status: res.statusCode });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

### Python (prometheus-client)

```python
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["method"])

# Flask example
@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}
```

Once your app exposes metrics, update `prometheus/prometheus.yml` to add your service as a scrape target. The default config already scrapes `host.docker.internal:3000/metrics`.

## Alert Configuration

Alert rules are defined in `prometheus/alerts.yml`. The following alerts are pre-configured:

| Alert                | Condition                                | Severity |
|----------------------|------------------------------------------|----------|
| HighErrorRate        | > 5% HTTP 5xx responses for 5 minutes   | critical |
| HighLatency          | p95 > 1 second for 5 minutes            | warning  |
| PodCrashLooping      | > 3 restarts in 15 minutes              | critical |
| HighMemoryUsage      | > 85% memory used for 5 minutes         | warning  |
| HighCPUUsage         | > 80% CPU used for 5 minutes            | warning  |
| DiskSpaceRunningLow  | < 15% disk space free for 5 minutes     | warning  |

### Connecting Alertmanager

1. Deploy Alertmanager alongside Prometheus
2. Uncomment the `alertmanagers` target in `prometheus/prometheus.yml`
3. Configure notification channels (Slack, PagerDuty, email) in Alertmanager's config

## Dashboard Customization

### Importing Additional Dashboards

1. Find dashboards at [grafana.com/grafana/dashboards](https://grafana.com/grafana/dashboards/)
2. Download the JSON file
3. Place it in `grafana/dashboards/`
4. Restart Grafana or reload dashboards via the API:
   ```bash
   curl -X POST http://admin:admin@localhost:3001/api/admin/provisioning/dashboards/reload
   ```

### Editing Dashboards

1. Edit the dashboard in the Grafana UI
2. Export the updated JSON: Dashboard settings > JSON Model > Copy
3. Save to `grafana/dashboards/` to persist changes across restarts

### Template Variables

Both dashboards use template variables for flexible filtering:

- **Application Overview**: `$datasource`, `$namespace`, `$app`, `$interval`
- **Node Exporter**: `$datasource`, `$instance`

## Provisioning

The Grafana provisioning config is expected at `grafana/provisioning/`. Create it with:

```bash
mkdir -p grafana/provisioning/datasources grafana/provisioning/dashboards
```

**grafana/provisioning/datasources/prometheus.yml:**
```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

**grafana/provisioning/dashboards/default.yml:**
```yaml
apiVersion: 1
providers:
  - name: Default
    orgId: 1
    folder: ""
    type: file
    disableDeletion: false
    editable: true
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: false
```

## Production Notes

- Change the default Grafana admin password immediately
- Set `GF_SECURITY_ADMIN_PASSWORD` via environment variable or secret
- Configure persistent storage for Prometheus data
- Adjust `--storage.tsdb.retention.time` based on your storage capacity
- Consider using a reverse proxy (nginx, Traefik) with TLS in front of Grafana
- For high-availability, look into Thanos or Cortex for Prometheus federation
