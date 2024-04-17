# Google Cloud Build Slack Notification

This Google Cloud Function is based on the [example](https://cloud.google.com/cloud-build/docs/configure-third-party-notifications) and sends a notification of build status to a Slack channel using incoming webhooks.

## Deploy

To deploy, run:

```
gcloud functions deploy subscribeSlack --gen2 --trigger-topic cloud-builds --runtime nodejs20 --set-env-vars "SLACK_WEBHOOK_URL=https://hooks.slack.com/…"
```