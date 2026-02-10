# Deployment Guide

## Overview

This project uses a multi-stage CD (Continuous Deployment) pipeline with manual approval gates for production deployments.

## Deployment Pipeline

### Automatic Triggers

The CD pipeline triggers automatically when:
- ✅ CI pipeline completes successfully on `main` branch
- ✅ Code is merged to `main` via pull request
- ✅ Code is pushed directly to `main`

### Manual Triggers

You can also trigger deployments manually:
1. Go to GitHub Actions
2. Select "Backend CD" workflow
3. Click "Run workflow"
4. Choose environment: `staging` or `production`

## Pipeline Stages

### 1. Build Production Artifacts ⚙️

**What happens**:
- Checks out code
- Installs dependencies (`npm ci`)
- Builds production bundle (`npm run build`)
- Creates tarball with dist/, package.json, node_modules
- Uploads as GitHub artifact (retained for 30 days)

**Duration**: ~2-3 minutes

---

### 2. Deploy to Staging 🚀

**What happens**:
- Downloads build artifacts
- Extracts files
- Deploys to staging environment
- Runs health checks

**Environment**: `staging`
**URL**: https://staging-api.example.com (simulated)

**Duration**: ~1-2 minutes

---

### 3. Smoke Tests on Staging 🧪

**What happens**:
- Validates API endpoints
- Tests core functionality (calculateProjectHours)
- Checks database connectivity
- Validates performance metrics

**Tests**:
- ✅ API responds with 200 OK
- ✅ Business logic functions correctly
- ✅ Database queries execute
- ✅ Error handling works
- ✅ Response time < 100ms
- ✅ Memory usage acceptable

**Duration**: ~30 seconds

---

### 4. Production Approval Gate ⏸️

**What happens**:
- Pipeline pauses and waits for manual approval
- Reviewer checks staging validation results
- Reviewer approves or rejects production deployment

**Who can approve**: Repository maintainers with production environment access

**How to approve**:
1. Go to GitHub Actions
2. Find the workflow run
3. Click "Review deployments"
4. Select "production-approval"
5. Click "Approve and deploy"

**Duration**: Variable (human decision time)

---

### 5. Deploy to Production 🌍

**What happens** (after approval):
- Downloads build artifacts
- Backs up current production version
- Deploys using Blue-Green strategy:
  - Deploys to "green" environment
  - Runs health checks on green
  - Switches traffic from blue to green
  - Keeps blue as rollback target
- Runs production health checks

**Environment**: `production`
**URL**: https://api.example.com (simulated)

**Duration**: ~2-3 minutes

---

### 6. Health Check & Notification ✅

**What happens**:
- Validates production deployment
- Checks API health
- Verifies database connectivity
- Sends success notification

**If health check fails**:
- Automatic rollback triggered
- Traffic switched back to blue (previous version)
- Production remains stable

---

## Deployment Strategies

### Blue-Green Deployment

**How it works**:
1. **Blue**: Current production version (live)
2. **Green**: New version deployed in parallel
3. Health checks run on green
4. If healthy: traffic switches to green (green becomes live)
5. If unhealthy: green is destroyed, blue stays live
6. Blue kept as rollback target for 24 hours

**Benefits**:
- ✅ Zero downtime deployments
- ✅ Instant rollback capability
- ✅ Safe production updates

---

## Rollback Procedure

### Automatic Rollback

Triggers automatically if:
- ❌ Production health check fails
- ❌ Deployment script errors

**Process**:
1. Traffic switches back to blue (previous version)
2. Green environment is destroyed
3. Production is stable on previous version
4. Team is notified to investigate failure

### Manual Rollback

If issues are detected post-deployment:

```bash
# Go to GitHub Actions
# Find the "Backend CD" workflow
# Click "Re-run jobs"
# Select "rollback-on-failure" job
```

Or use workflow dispatch with previous commit SHA.

---

## Environments

### Staging

**Purpose**: Pre-production validation
**URL**: https://staging-api.example.com
**Database**: Staging database (test data)
**Auto-deploy**: Yes (on every CI pass)
**Approval required**: No

### Production

**Purpose**: Live user-facing environment
**URL**: https://api.example.com
**Database**: Production database (real data)
**Auto-deploy**: No (requires manual approval)
**Approval required**: Yes

---

## Environment Variables

### Staging

```
NODE_ENV=production
DATABASE_URL=<staging-database-url>
API_URL=https://staging-api.example.com
LOG_LEVEL=debug
```

### Production

```
NODE_ENV=production
DATABASE_URL=<production-database-url>
API_URL=https://api.example.com
LOG_LEVEL=info
SENTRY_DSN=<sentry-dsn>
```

**Note**: Environment variables are managed via GitHub Secrets

---

## Monitoring

### What to Monitor Post-Deployment

**Immediately (0-5 minutes)**:
- ✅ Health check endpoints responding
- ✅ Error rate < 1%
- ✅ Response time < 100ms
- ✅ No critical errors in logs

**Short-term (5-30 minutes)**:
- ✅ User traffic patterns normal
- ✅ Database query performance
- ✅ Memory/CPU usage stable
- ✅ No increase in error rates

**Long-term (1+ hours)**:
- ✅ Feature functionality correct
- ✅ No regression issues
- ✅ Performance metrics stable

---

## Deployment Checklist

### Pre-Deployment

- [ ] All CI tests pass on main
- [ ] Code review approved
- [ ] No known critical bugs
- [ ] Database migrations tested (if any)
- [ ] Environment variables configured

### During Deployment

- [ ] Staging deployment successful
- [ ] Smoke tests pass
- [ ] Performance validated
- [ ] Manual approval provided
- [ ] Production health checks pass

### Post-Deployment

- [ ] Monitor error rates (5 minutes)
- [ ] Check application logs
- [ ] Verify core features work
- [ ] User traffic is normal
- [ ] No performance degradation

---

## Troubleshooting

### Pipeline Stuck at Approval

**Problem**: CD pipeline waiting at production approval gate

**Solution**:
1. Check staging validation results
2. If staging passed, approve deployment
3. If staging failed, investigate and fix

### Deployment Failed

**Problem**: Deployment step failed with error

**Solution**:
1. Check workflow logs for error details
2. Common issues:
   - Missing environment variables
   - Network connectivity
   - Insufficient permissions
3. Fix issue and re-run workflow

### Health Check Failed

**Problem**: Production health check failed, rollback triggered

**Solution**:
1. Check what specific health check failed
2. Investigate logs for root cause
3. Fix issue in code
4. Push fix, wait for CI, redeploy

---

## Integration with DeployWorker Agent

**Note**: This CD pipeline is designed to integrate with the DeployWorker agent from the multi-agent system.

**Current state**: Simulated deployments (echo commands)

**Production state**: Replace simulation steps with actual deployment scripts:
- SSH into servers
- Run deployment scripts
- Update load balancers
- Execute health checks on real endpoints

**DeployWorker integration**:
```yaml
- name: Deploy with DeployWorker
  run: |
    # Invoke DeployWorker agent
    # Pass: artifact path, environment, version, strategy
    # DeployWorker executes actual deployment
    # Reports: success/failure, health check results
```

---

## Emergency Procedures

### Complete Outage

If production is completely down:

1. **Immediate**: Rollback to last known good version
2. **Communicate**: Notify team and stakeholders
3. **Investigate**: Root cause analysis
4. **Fix**: Apply hotfix if needed
5. **Deploy**: Fast-track through pipeline
6. **Post-mortem**: Document incident and prevention

### Partial Outage

If some features are broken:

1. **Assess**: Severity and impact
2. **Decision**:
   - Minor issue: Fix and deploy normally
   - Major issue: Rollback and fix
3. **Monitor**: Ensure rollback resolves issue
4. **Fix**: Address root cause
5. **Redeploy**: Through normal pipeline

---

## Best Practices

### 1. Always Deploy to Staging First ✅
Never skip staging, even for "small" changes

### 2. Monitor Post-Deployment ✅
Watch metrics for at least 5 minutes after production deploy

### 3. Keep Rollback Ready ✅
Blue-Green strategy ensures instant rollback

### 4. Use Feature Flags 💡
For risky features, use flags to enable gradually

### 5. Deploy During Low Traffic 💡
Schedule major deployments during off-peak hours

### 6. Communicate Deployments 💡
Notify team before production deployments

---

## Deployment Schedule

### Recommended

- **Staging**: Automatic, anytime
- **Production**: Manual approval, weekdays 10am-4pm (local time)
- **Hotfixes**: As needed, with extra caution

### Avoid

- ❌ Friday afternoon deployments
- ❌ Deployments before holidays
- ❌ Deployments during peak traffic
- ❌ Multiple deployments in one day (unless urgent)

---

**Last Updated**: 2026-02-10
**Pipeline Version**: 1.0.0
