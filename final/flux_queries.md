
# Flux Query Examples

## Basic Query
```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
```

## Aggregation
```flux
|> aggregateWindow(every: 5m, fn: mean)
```

## Downsampling Task
```flux
option task = {name: "downsample", every: 1h}

from(bucket: "raw")
  |> range(start: -task.every)
  |> aggregateWindow(every: 5m, fn: mean)
  |> to(bucket: "downsampled")
```
