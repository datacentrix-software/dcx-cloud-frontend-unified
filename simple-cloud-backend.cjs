const express = require('express');
const cors = require('cors');
const app = express();
const port = 8003;

// CORS configuration
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/cloud/test', (req, res) => {
  res.json({ message: 'Cloud endpoints working!', timestamp: new Date() });
});

// VM Telemetry endpoint
app.get('/api/cloud/vmTelemetry', (req, res) => {
  const { vmId } = req.query;
  res.json({
    vm_name: 'web-server-01',
    cpu_usage_percent: 25.5,
    memory_usage_percent: 60.2,
    disk_usage_percent: 45.8,
    health_score: 85
  });
});

// VM CPU/RAM Window endpoint
app.get('/api/cloud/vmCpuRamWindow', (req, res) => {
  const { vmId } = req.query;
  // Generate sample time-series data
  const data = [];
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString();
    data.push({
      timestamp,
      avg_cpu_usage_percent: Math.random() * 50 + 20,
      avg_memory_usage_percent: Math.random() * 40 + 40
    });
  }
  res.json(data);
});

// VM Network Window endpoint
app.get('/api/cloud/vmNetworkWindow', (req, res) => {
  const { vmId } = req.query;
  // Generate sample network data
  const data = [];
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString();
    data.push({
      timestamp,
      avg_net_usage_kbps: Math.random() * 1000 + 500,
      avg_net_received_kbps: Math.random() * 500 + 200,
      avg_net_transmit_kbps: Math.random() * 500 + 200
    });
  }
  res.json(data);
});

// VM Disk Window endpoint
app.get('/api/cloud/vmDiskWindow', (req, res) => {
  const { vmId } = req.query;
  // Generate sample disk data
  const data = [];
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString();
    data.push({
      timestamp,
      avg_disk_usage_percent: Math.random() * 30 + 40,
      avg_diskspace_used: Math.random() * 50 + 50,
      avg_diskspace_provisioned: 100
    });
  }
  res.json(data);
});

// VM Health Window endpoint
app.get('/api/cloud/vmHealthWindow', (req, res) => {
  const { vmId } = req.query;
  res.json([{
    health_score: 85,
    workload_score: 78,
    efficiency_score: 92,
    status: 'healthy'
  }]);
});

// VM Alert Window endpoint
app.get('/api/cloud/vmAlertWindow', (req, res) => {
  const { vmId } = req.query;
  res.json({
    identity_instance_uuid: vmId,
    bucket: 'alerts',
    avg_info: '2',
    avg_warning: '1',
    avg_immediate: '0',
    avg_critical: '0'
  });
});

app.listen(port, () => {
  console.log(`Cloud backend listening on port ${port}`);
  console.log(`Test endpoint: http://localhost:${port}/api/cloud/test`);
});