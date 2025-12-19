
import { InfluxDB } from '@influxdata/influxdb-client'

const token = 'YOUR_TOKEN'
const org = 'my-org'
const bucket = 'metrics'

const client = new InfluxDB({ url: 'http://localhost:8086', token })
const writeApi = client.getWriteApi(org, bucket)

writeApi.writePoint({
  measurement: 'temperature',
  tags: { location: 'BLR' },
  fields: { value: 29.2 }
})

writeApi.close()
