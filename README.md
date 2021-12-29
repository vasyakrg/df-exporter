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
```

## Example deploy
