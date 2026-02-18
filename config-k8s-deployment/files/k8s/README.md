# Kubernetes Deployment Manifests

Production-ready Kubernetes manifests for deploying a containerized application with TLS ingress, autoscaling, and security best practices.

## What's Included

| File | Purpose |
|------|---------|
| `namespace.yaml` | Isolated namespace for all resources |
| `deployment.yaml` | Application pods with rolling updates, health probes, security context |
| `service.yaml` | ClusterIP Service routing traffic to pods |
| `ingress.yaml` | NGINX Ingress with cert-manager TLS and security headers |
| `configmap.yaml` | Non-sensitive environment variables |
| `hpa.yaml` | Autoscaler (2-10 replicas based on CPU/memory) |

## Quick Start

### 1. Replace Placeholders

Four placeholders need to be replaced across all manifests:

```bash
# Set your values
export APP_NAME="myapp"
export APP_NAMESPACE="myapp-prod"
export APP_IMAGE="ghcr.io/your-org/myapp"
export APP_DOMAIN="app.example.com"

# Replace in all YAML files
sed -i "s|APP_NAME|${APP_NAME}|g" k8s/*.yaml
sed -i "s|APP_NAMESPACE|${APP_NAMESPACE}|g" k8s/*.yaml
sed -i "s|APP_IMAGE|${APP_IMAGE}|g" k8s/*.yaml
sed -i "s|APP_DOMAIN|${APP_DOMAIN}|g" k8s/*.yaml
```

### 2. Create the Secret (not included for security)

```bash
kubectl create secret generic ${APP_NAME}-secrets \
  --namespace=${APP_NAMESPACE} \
  --from-literal=DATABASE_URL="postgres://user:pass@host:5432/db" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=API_KEY="your-api-key"
```

### 3. Create a ServiceAccount

```bash
kubectl create serviceaccount ${APP_NAME} --namespace=${APP_NAMESPACE}
```

### 4. Apply Manifests (order matters)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

Or apply everything at once (Kubernetes handles dependencies):

```bash
kubectl apply -f k8s/
```

### 5. Verify Deployment

```bash
# Check pod status
kubectl get pods -n ${APP_NAMESPACE} -l app.kubernetes.io/name=${APP_NAME}

# Watch rollout progress
kubectl rollout status deployment/${APP_NAME} -n ${APP_NAMESPACE}

# Check service endpoints
kubectl get endpoints -n ${APP_NAMESPACE} ${APP_NAME}

# Verify ingress and TLS certificate
kubectl get ingress -n ${APP_NAMESPACE}
kubectl get certificate -n ${APP_NAMESPACE}
```

## Common Operations

### Scale Manually

```bash
kubectl scale deployment/${APP_NAME} -n ${APP_NAMESPACE} --replicas=5
```

### Deploy a New Image Version

```bash
kubectl set image deployment/${APP_NAME} \
  ${APP_NAME}=${APP_IMAGE}:v1.2.3 \
  -n ${APP_NAMESPACE}
```

### Rollback to Previous Version

```bash
# View rollout history
kubectl rollout history deployment/${APP_NAME} -n ${APP_NAMESPACE}

# Rollback to previous revision
kubectl rollout undo deployment/${APP_NAME} -n ${APP_NAMESPACE}

# Rollback to a specific revision
kubectl rollout undo deployment/${APP_NAME} -n ${APP_NAMESPACE} --to-revision=3
```

### View Logs

```bash
# All pods
kubectl logs -l app.kubernetes.io/name=${APP_NAME} -n ${APP_NAMESPACE} --tail=100

# Specific pod
kubectl logs ${APP_NAME}-xxxxx-yyyyy -n ${APP_NAMESPACE} -f

# Previous container (after crash)
kubectl logs ${APP_NAME}-xxxxx-yyyyy -n ${APP_NAMESPACE} --previous
```

### Check HPA Status

```bash
kubectl get hpa -n ${APP_NAMESPACE}
kubectl describe hpa ${APP_NAME} -n ${APP_NAMESPACE}
```

### Update ConfigMap and Restart

```bash
# Edit the ConfigMap
kubectl edit configmap ${APP_NAME}-config -n ${APP_NAMESPACE}

# Restart pods to pick up changes (rolling restart, no downtime)
kubectl rollout restart deployment/${APP_NAME} -n ${APP_NAMESPACE}
```

## Prerequisites

- **nginx-ingress controller** — handles external traffic routing
- **cert-manager** — automates TLS certificate provisioning (with a `letsencrypt-prod` ClusterIssuer)
- **metrics-server** — provides CPU/memory metrics for the HPA

## Security Features

- Non-root container (UID 1000)
- Read-only root filesystem (writable `/tmp` via emptyDir)
- All Linux capabilities dropped
- No privilege escalation allowed
- ServiceAccount token not auto-mounted
- Security headers via Ingress annotations (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting on Ingress (10 req/s per IP)
