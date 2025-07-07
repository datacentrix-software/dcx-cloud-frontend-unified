/**
 * Cloud Telemetry Endpoints for DCX Cloud Backend
 * 
 * These endpoints should be moved to the dcx-cloud-backend-unified repository
 * Location: src/routes/cloud/telemetry.ts
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { protect } from '../middleware/authHandler';
import prismaBronze from '../utils/prisma/prismaBronze';

// Types for telemetry data
interface MetricAggregationResponse {
  org_name: string;
  "Memory GB": number;
  "CPU Cores": number;
  "Disk Capacity TB": number;
}

interface VMTelemetryData {
  vm_name: string;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  health_score: number;
}

/**
 * @route   GET /api/cloud/metricAggregation
 * @desc    Get aggregated metrics for an organization
 * @access  Private
 * @param   customer - Organization name (e.g., "Adcock")
 */
export const getMetricAggregation = asyncHandler(async (req: Request, res: Response) => {
  const { customer } = req.query;
  
  if (!customer || typeof customer !== 'string') {
    return res.status(400).json({ error: 'Customer parameter is required' });
  }

  try {
    // Based on the investigation report SQL query
    const metrics = await prismaBronze.$queryRaw<MetricAggregationResponse[]>`
      WITH last_run AS (
        SELECT run_id, start_time, end_time
        FROM vcenter_vm_data_audit
        WHERE status = 'SUCCESS'
        AND start_time >= DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY run_id DESC
        LIMIT 1
      )
      SELECT
        vo.org_name,
        ROUND(SUM(vs.memory_size_mib) / 1024, 2) AS "Memory GB",
        SUM(vs.cpu_count) AS "CPU Cores",
        ROUND(COALESCE(SUM(ds.total_disk_capacity), 0) / 1024 / 1024 / 1024 / 1024, 2) AS "Disk Capacity TB"
      FROM vcenter_vm_data_vms vs
      JOIN vcenter_resource_pools_organizations vrpo ON vs.resource_pool_name = vrpo.resource_pool_name
      JOIN vcenter_orgs vo ON vrpo.org_id = vo.id
      LEFT JOIN vcenter_vm_data_disks ds ON vs.identity_instance_uuid = ds.identity_instance_uuid
      WHERE LOWER(vo.org_name) LIKE LOWER(${`%${customer}%`})
      GROUP BY vo.org_name;
    `;

    if (metrics.length === 0) {
      return res.status(404).json({ error: 'No metrics found for organization' });
    }

    res.json(metrics[0]);
  } catch (error) {
    console.error('Error fetching metric aggregation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/currentBill
 * @desc    Get current VM list and billing data
 * @access  Private
 * @param   customer - Organization name
 */
export const getCurrentBill = asyncHandler(async (req: Request, res: Response) => {
  const { customer } = req.query;
  
  if (!customer || typeof customer !== 'string') {
    return res.status(400).json({ error: 'Customer parameter is required' });
  }

  try {
    const vmList = await prismaBronze.$queryRaw`
      SELECT 
        vs.vm_name,
        vs.identity_instance_uuid,
        vs.cpu_count,
        ROUND(vs.memory_size_mib / 1024, 2) as memory_gb,
        vs.power_state,
        vs.guest_os_full_name,
        vo.org_name
      FROM vcenter_vm_data_vms vs
      JOIN vcenter_resource_pools_organizations vrpo ON vs.resource_pool_name = vrpo.resource_pool_name
      JOIN vcenter_orgs vo ON vrpo.org_id = vo.id
      WHERE LOWER(vo.org_name) LIKE LOWER(${`%${customer}%`})
      AND vs.is_current = true
      ORDER BY vs.vm_name;
    `;

    res.json(vmList);
  } catch (error) {
    console.error('Error fetching current bill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/vmTelemetry
 * @desc    Get telemetry data for a specific VM
 * @access  Private
 * @param   vmId - VM instance UUID
 */
export const getVMTelemetry = asyncHandler(async (req: Request, res: Response) => {
  const { vmId } = req.query;
  
  if (!vmId || typeof vmId !== 'string') {
    return res.status(400).json({ error: 'VM ID parameter is required' });
  }

  try {
    const telemetry = await prismaBronze.$queryRaw<VMTelemetryData[]>`
      SELECT 
        vs.vm_name,
        COALESCE(cpu.avg_cpu_usage_percent, 0) as cpu_usage_percent,
        COALESCE(cpu.avg_memory_usage_percent, 0) as memory_usage_percent,
        COALESCE(disk.avg_disk_usage_percent, 0) as disk_usage_percent,
        COALESCE(health.health_score, 0) as health_score
      FROM vcenter_vm_data_vms vs
      LEFT JOIN vm_cpu_memory_3day_30min_avg cpu ON vs.identity_instance_uuid = cpu.identity_instance_uuid
      LEFT JOIN vm_disk_3day_30min_avg disk ON vs.identity_instance_uuid = disk.identity_instance_uuid  
      LEFT JOIN vm_health_3day_summary health ON vs.identity_instance_uuid = health.identity_instance_uuid
      WHERE vs.identity_instance_uuid = ${vmId}
      AND vs.is_current = true
      LIMIT 1;
    `;

    if (telemetry.length === 0) {
      return res.status(404).json({ error: 'VM not found' });
    }

    res.json(telemetry[0]);
  } catch (error) {
    console.error('Error fetching VM telemetry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/vmCpuRamWindow
 * @desc    Get CPU and RAM usage over time for a VM
 * @access  Private
 * @param   vmId - VM instance UUID
 * @param   hours - Time window in hours (default: 24)
 */
export const getVMCpuRamWindow = asyncHandler(async (req: Request, res: Response) => {
  const { vmId, hours = '24' } = req.query;
  
  if (!vmId || typeof vmId !== 'string') {
    return res.status(400).json({ error: 'VM ID parameter is required' });
  }

  try {
    const windowData = await prismaBronze.$queryRaw`
      SELECT 
        timestamp,
        avg_cpu_usage_percent,
        avg_memory_usage_percent,
        max_cpu_usage_percent,
        max_memory_usage_percent
      FROM vm_cpu_memory_3day_30min_avg
      WHERE identity_instance_uuid = ${vmId}
      AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
      LIMIT 100;
    `;

    res.json(windowData);
  } catch (error) {
    console.error('Error fetching VM CPU/RAM window:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/vmHealthWindow
 * @desc    Get health metrics over time for a VM
 * @access  Private
 * @param   vmId - VM instance UUID
 */
export const getVMHealthWindow = asyncHandler(async (req: Request, res: Response) => {
  const { vmId } = req.query;
  
  if (!vmId || typeof vmId !== 'string') {
    return res.status(400).json({ error: 'VM ID parameter is required' });
  }

  try {
    const healthData = await prismaBronze.$queryRaw`
      SELECT 
        timestamp,
        health_score,
        workload_score,
        efficiency_score,
        status
      FROM vm_health_3day_summary
      WHERE identity_instance_uuid = ${vmId}
      ORDER BY timestamp DESC
      LIMIT 50;
    `;

    res.json(healthData);
  } catch (error) {
    console.error('Error fetching VM health window:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/vmDiskWindow
 * @desc    Get disk usage over time for a VM
 * @access  Private
 * @param   vmId - VM instance UUID
 * @param   hours - Time window in hours (default: 24)
 */
export const getVMDiskWindow = asyncHandler(async (req: Request, res: Response) => {
  const { vmId, hours = '24' } = req.query;
  
  if (!vmId || typeof vmId !== 'string') {
    return res.status(400).json({ error: 'VM ID parameter is required' });
  }

  try {
    const diskData = await prismaBronze.$queryRaw`
      SELECT 
        timestamp,
        avg_disk_usage_percent,
        max_disk_usage_percent,
        disk_read_iops,
        disk_write_iops
      FROM vm_disk_3day_30min_avg
      WHERE identity_instance_uuid = ${vmId}
      AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
      LIMIT 100;
    `;

    res.json(diskData);
  } catch (error) {
    console.error('Error fetching VM disk window:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/vmNetworkWindow
 * @desc    Get network usage over time for a VM
 * @access  Private
 * @param   vmId - VM instance UUID
 * @param   hours - Time window in hours (default: 24)
 */
export const getVMNetworkWindow = asyncHandler(async (req: Request, res: Response) => {
  const { vmId, hours = '24' } = req.query;
  
  if (!vmId || typeof vmId !== 'string') {
    return res.status(400).json({ error: 'VM ID parameter is required' });
  }

  try {
    const networkData = await prismaBronze.$queryRaw`
      SELECT 
        timestamp,
        network_rx_rate_kbps,
        network_tx_rate_kbps,
        network_rx_packets,
        network_tx_packets
      FROM vm_network_3day_30min_avg
      WHERE identity_instance_uuid = ${vmId}
      AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
      LIMIT 100;
    `;

    res.json(networkData);
  } catch (error) {
    console.error('Error fetching VM network window:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /api/cloud/afgriPastBills
 * @desc    Get historical billing data for an organization
 * @access  Private
 * @param   customer - Organization name
 * @param   months - Number of months to look back (default: 12)
 */
export const getAfgriPastBills = asyncHandler(async (req: Request, res: Response) => {
  const { customer, months = '12' } = req.query;
  
  if (!customer || typeof customer !== 'string') {
    return res.status(400).json({ error: 'Customer parameter is required' });
  }

  try {
    const pastBills = await prismaBronze.$queryRaw`
      SELECT 
        DATE_TRUNC('month', vda.start_time) as billing_month,
        vo.org_name,
        COUNT(vs.identity_instance_uuid) as vm_count,
        SUM(vs.cpu_count) as total_cpu_cores,
        ROUND(SUM(vs.memory_size_mib) / 1024, 2) as total_memory_gb,
        ROUND(SUM(ds.total_disk_capacity) / 1024 / 1024 / 1024 / 1024, 2) as total_disk_tb
      FROM vcenter_vm_data_audit vda
      JOIN vcenter_vm_data_vms vs ON vda.run_id = vs.run_id
      JOIN vcenter_resource_pools_organizations vrpo ON vs.resource_pool_name = vrpo.resource_pool_name
      JOIN vcenter_orgs vo ON vrpo.org_id = vo.id
      LEFT JOIN vcenter_vm_data_disks ds ON vs.identity_instance_uuid = ds.identity_instance_uuid
      WHERE LOWER(vo.org_name) LIKE LOWER(${`%${customer}%`})
      AND vda.status = 'SUCCESS'
      AND vda.start_time >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', vda.start_time), vo.org_name
      ORDER BY billing_month DESC;
    `;

    res.json(pastBills);
  } catch (error) {
    console.error('Error fetching past bills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Router setup (to be added to backend)
export const setupCloudTelemetryRoutes = (router: any) => {
  // Apply authentication middleware to all routes
  router.use('/api/cloud', protect);
  
  // Telemetry endpoints
  router.get('/api/cloud/metricAggregation', getMetricAggregation);
  router.get('/api/cloud/currentBill', getCurrentBill);
  router.get('/api/cloud/vmTelemetry', getVMTelemetry);
  router.get('/api/cloud/vmCpuRamWindow', getVMCpuRamWindow);
  router.get('/api/cloud/vmHealthWindow', getVMHealthWindow);
  router.get('/api/cloud/vmDiskWindow', getVMDiskWindow);
  router.get('/api/cloud/vmNetworkWindow', getVMNetworkWindow);
  router.get('/api/cloud/afgriPastBills', getAfgriPastBills);
};