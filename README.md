# DF Exporter

## Monitoring disk size (mb) metrics for Prometheus format

Exelent for longhorn pvc

- port setting get from ENV: PORT (default: 8080)
- path setting get from ENV: MYPATH (default: '\')
- export metrics example:

```bash
# HELP df_exporter_disk_used_size Used disk size from path: /
# TYPE df_exporter_disk_used_size gauge
df_exporter_disk_used_size 199078380

# HELP df_exporter_disk_free_size Free disk size from path: /
# TYPE df_exporter_disk_free_size gauge
df_exporter_disk_free_size 40284116

# HELP df_exporter_disk_total_size Total disk size from path: /
# TYPE df_exporter_disk_total_size gauge
df_exporter_disk_total_size 239362496

# HELP df_exporter_disk_used_pencent Used disk size with pencent from path: /
# TYPE df_exporter_disk_used_pencent gauge
df_exporter_disk_used_pencent 3.715749798508085

# HELP df_exporter_disk_free_pencent Free disk size with pencent from path: /
# TYPE df_exporter_disk_free_pencent gauge
df_exporter_disk_free_pencent 96.17155564288939
```

## Example deploy

- prometheus scrape

```bash
- job_name: "df-monitor"
  honor_labels: true
  scheme: http

  kubernetes_sd_configs:
    - role: endpoints
  relabel_configs:
    - target_label: cluster
      replacement: mlm-hetzner-dev
    - source_labels: [__meta_kubernetes_endpoints_name]
      regex: (.*-df-exporter)
      action: keep
    - source_labels: [__address__, __meta_kubernetes_service_port]
      action: replace
      target_label: __address__
      regex: 9873
      replacement: $1:$2
    # add service namespace as label to the scrapped metrics
    - source_labels: [__meta_kubernetes_namespace]
      separator: ;
      regex: (.*)
      target_label: namespace
      replacement: $1
      action: replace
    # add service name as a label to the scrapped metrics
    - source_labels: [__meta_kubernetes_service_name]
      separator: ;
      regex: (.*)
      target_label: service
      replacement: $1
      action: replace
    # add stats service's labels to the scrapped metrics
    - action: labelmap
      regex: __meta_kubernetes_service_label_(.+)
```

- alertmanager

```bash
- name: DF-monitor
  rules:
    - alert: Df-Monitor-Alert
      annotations:
        description:
          The used storage of app {{$labels.app}} on NS {{$labels.namespace}} is at {{$value}}% capacity for
          more than 5 minutes. Cluster={{$labels.cluster}}
        summary: The used storage of disk is over 70% of the capacity.
      expr: (df_exporter_disk_used_size / df_exporter_disk_total_size) * 100 > 70
      for: 5m
      labels:
        severity: critical
```

- kubernetes deployment

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: grav
    mlmsoftMonitoring: "true"
  name: grav
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grav-app
  strategy:
    type: Recreate
  template:
    metadata:
       labels:
        app: grav-app
    spec:
      hostname: grav-pod
      terminationGracePeriodSeconds: 60
      restartPolicy: Always
      containers:
      - name: grav
      //-----------------//
      - name: grav-df-exporter
        image: vasyakrg/df-exporter:0.1
        imagePullPolicy: IfNotPresent
        ports:
        - name: grav-exporter
          containerPort: 9873
          protocol: TCP
        env:
        - name: "MYPATH"
          value: "/var/www/html"
        - name: "PORT"
          value: "9873"
        volumeMounts:
        - name: vol-grav
          mountPath: /var/www/html
      volumes:
        - name: vol-grav
          persistentVolumeClaim:
            claimName: grav-pvc
```

- kubernetes service

```bash
apiVersion: v1
kind: Service
metadata:
  name: grav-service-df-exporter
  labels:
    app: grav-app
  annotations:
    dfexporter/path: "/metrics"
    dfexporter/port: "9873"
spec:
  ports:
    - name: grav-exporter
      port: 9873
      targetPort: grav-exporter
  selector:
    app: grav-app
```
