import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { inventoryApi } from '../../services/inventoryApi';
import * as XLSX from 'xlsx';

const Layout = styled.div`
  display: grid; 
  gap: 1.5rem; 
  grid-template-columns: 450px 1fr; 
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
`;

const Card = styled.div`
  background:#fff; border:1px solid #e2e8f0; border-radius:22px;
  padding:1.4rem 1.5rem 1.55rem; display:flex; flex-direction:column; gap:1rem;
  box-shadow:0 1px 3px rgba(0,0,0,0.1);
`;

const Page = styled.div`
  min-height:100vh; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding:2rem 1rem;
`;

const Title = styled.h1`
  color:#fff; text-align:center; margin-bottom:2rem; font-size:2rem; font-weight:700;
  text-shadow:0 2px 4px rgba(0,0,0,0.3);
`;

const SectionTitle = styled.h2`
  color:#1e293b; font-size:1.1rem; font-weight:600; margin:0;
`;

const Field = styled.div`
  display:flex; flex-direction:column; gap:.4rem;
  label{color:#4b5563; font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.025em;}
  input,select{border:1px solid #d1d5db; padding:.65rem .75rem; border-radius:8px; font-size:.8rem;}
  input:focus,select:focus{outline:none; border-color:#4f46e5; box-shadow:0 0 0 3px rgba(79,70,229,.1);}
`;

const Btn = styled.button`
  background:linear-gradient(135deg, #4f46e5, #7c3aed); color:#fff; border:none; 
  padding:.8rem 1.2rem; border-radius:8px; font-weight:600; cursor:pointer;
  transition:all .2s; font-size:.8rem;
  &:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(79,70,229,.3);}
  &:disabled{opacity:.6; cursor:not-allowed; transform:none;}
`;

const PrintBtn = styled(Btn)`
  background: linear-gradient(135deg, #059669, #10b981);
  &:hover{box-shadow:0 4px 12px rgba(5,150,105,.3);}
`;


const ExcelBtn = styled(Btn)`
  background: linear-gradient(135deg, #059669, #10b981);
  &:hover{box-shadow:0 4px 12px rgba(5,150,105,.3);}
`;


const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// Helper function to safely filter inventory data
const safeFilter = (data, predicate) => {
  return Array.isArray(data) ? data.filter(predicate) : [];
};


const ManagerReports = () => {
  const [filters, setFilters] = useState({ month: '2025-10' }); // Removed scope
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);

  const fetchInventoryForReport = async () => {
    try {
      const rawData = await inventoryApi.list();
      console.log('Fetched inventory data:', rawData); // Debug log
      
      // Extract items array from API response - handle both direct array and {items: array} format
      let data = [];
      if (Array.isArray(rawData)) {
        data = rawData;
      } else if (rawData && Array.isArray(rawData.items)) {
        data = rawData.items;
      } else {
        console.warn('Unexpected API response format:', rawData);
        data = [];
      }
      
      setInventoryData(data);
      return data;
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setInventoryData([]);
      return [];
    }
  };

  useEffect(() => {
    fetchInventoryForReport();
  }, []);

  const run = async () => {
    setLoading(true);
    try {
      // Fetch raw inventory first
      const data = await fetchInventoryForReport();
      // Apply month filter locally if date fields exist
      const month = filters.month; // YYYY-MM
      let filtered = data;
      if (month) {
        const [y,m] = month.split('-').map(Number);
        const start = new Date(Date.UTC(y, m-1, 1));
        const end = new Date(Date.UTC(y, m, 1));
        filtered = data.filter(it => {
          const created = it.createdAt ? new Date(it.createdAt) : null;
            const updated = it.updatedAt ? new Date(it.updatedAt) : null;
            return (created && created >= start && created < end) || (updated && updated >= start && updated < end);
        });
      }
      // Derive summary off filtered
      const totalItems = filtered.length;
      const equipmentCount = safeFilter(filtered, i=>i.category==='equipment').length;
      const suppliesCount = safeFilter(filtered, i=>i.category==='supplies').length;
      const availableCount = safeFilter(filtered, i=>i.status==='available').length;
      const inUseCount = safeFilter(filtered, i=>i.status==='in_use').length;
      const lowStockCount = safeFilter(filtered, i=>i.status==='out_of_stock').length;
      const forRepairCount = safeFilter(filtered, i=>i.status==='for_repair').length;
      setReport({
        success:true,
        summary:{ 'Total Items': totalItems, 'Equipment': equipmentCount, 'Supplies': suppliesCount, 'Available': availableCount, 'In Use': inUseCount, 'Out of Stock': lowStockCount, 'For Repair': forRepairCount, 'Availability Rate': totalItems? `${((availableCount/totalItems)*100).toFixed(1)}%`:'0%' },
        scope:'department', dataSource:'live-filtered', itemsIncluded: totalItems, createdAt:new Date().toISOString(), inventoryData: filtered
      });
      // Fetch monthly analytics from backend
      if (month) {
        try {
          const res = await fetch(`/api/inventory/analytics/monthly?month=${month}`);
          if (res.ok) {
            const json = await res.json();
            setMonthlyAnalytics(json.analytics);
          } else {
            setMonthlyAnalytics(null);
          }
        } catch { setMonthlyAnalytics(null); }
      } else { setMonthlyAnalytics(null); }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally { setLoading(false); }
  };

  const generatePrintableReport = async () => {
    setPrintLoading(true);
    try {
      // Refresh data before generating report
      await fetchInventoryForReport();
      
      // Create the printable report
      const printWindow = window.open('', '_blank');
      const reportContent = createPrintableReportHTML();
      
      printWindow.document.write(reportContent);
      printWindow.document.close();
      
      // Focus and print
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
    } catch (error) {
      console.error('Error generating printable report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setPrintLoading(false);
    }
  };

  const createPrintableReportHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Calculate analytics - ensure inventoryData is an array
  const safeInventoryData = Array.isArray(inventoryData) ? inventoryData : [];
    const totalItems = safeInventoryData.length;
    const equipmentCount = safeFilter(safeInventoryData, item => item.category === 'equipment').length;
    const suppliesCount = safeFilter(safeInventoryData, item => item.category === 'supplies').length;
    const availableCount = safeFilter(safeInventoryData, item => item.status === 'available').length;
    const inUseCount = safeFilter(safeInventoryData, item => item.status === 'in_use').length;
    const lowStockCount = safeFilter(safeInventoryData, item => item.status === 'out_of_stock').length;
    const forRepairCount = safeFilter(safeInventoryData, item => item.status === 'for_repair').length;
    
    // Group items by category for better organization
    const equipmentItems = safeFilter(safeInventoryData, item => item.category === 'equipment');
    const suppliesItems = safeFilter(safeInventoryData, item => item.category === 'supplies');

    // Helper function to create visual chart
    const createStatusChart = () => {
      const total = availableCount + inUseCount + lowStockCount + forRepairCount;
      if (total === 0) return '';
      
      const availablePercent = (availableCount / total * 100).toFixed(1);
      const inUsePercent = (inUseCount / total * 100).toFixed(1);
      const lowStockPercent = (lowStockCount / total * 100).toFixed(1);
      const repairPercent = (forRepairCount / total * 100).toFixed(1);
      
      return `
        <div class="chart-container">
          <h3>Status Distribution</h3>
          <div class="chart-bar">
            <div class="bar-segment available" style="width: ${availablePercent}%" title="Available: ${availablePercent}%"></div>
            <div class="bar-segment in-use" style="width: ${inUsePercent}%" title="In Use: ${inUsePercent}%"></div>
            <div class="bar-segment low-stock" style="width: ${lowStockPercent}%" title="Out of Stock: ${lowStockPercent}%"></div>
            <div class="bar-segment repair" style="width: ${repairPercent}%" title="For Repair: ${repairPercent}%"></div>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-color available"></span>Available (${availablePercent}%)</span>
            <span class="legend-item"><span class="legend-color in-use"></span>In Use (${inUsePercent}%)</span>
            <span class="legend-item"><span class="legend-color low-stock"></span>Out of Stock (${lowStockPercent}%)</span>
            <span class="legend-item"><span class="legend-color repair"></span>For Repair (${repairPercent}%)</span>
          </div>
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>InvAI Inventory Report - ${currentDate}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
            .header { margin-bottom: 20px; }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            color: #1a202c;
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
            background: #ffffff;
          }
          /* Force color backgrounds to render in printed PDF */
          *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .analytics-card, .chart-bar, .bar-segment, .legend-color, .status-badge, .executive-summary, .inventory-table th {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Fallback solid colors for gradients (some PDF print drivers ignore gradients) */
          .bar-segment.available { background-color:#10b981; }
          .bar-segment.in-use { background-color:#3b82f6; }
          .bar-segment.low-stock { background-color:#ef4444; }
          .bar-segment.repair { background-color:#f59e0b; }
          .legend-color.available { background-color:#10b981; }
          .legend-color.in-use { background-color:#3b82f6; }
          .legend-color.low-stock { background-color:#ef4444; }
          .legend-color.repair { background-color:#f59e0b; }
          .status-available { background-color:#dcfce7 !important; }
          .status-in_use { background-color:#dbeafe !important; }
          .status-out_of_stock { background-color:#fee2e2 !important; }
          .status-for_repair { background-color:#fef3c7 !important; }
          .summary-table-wrapper { margin: 10px 0 40px; }
          .summary-table { width:100%; border-collapse:collapse; font-size:14px; }
          .summary-table td { padding:10px 14px; border:1px solid #e2e8f0; }
          .summary-table td.label { background:#f1f5f9; font-weight:600; width:200px; }
          
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 4px solid #4f46e5;
            padding-bottom: 25px;
            margin-bottom: 40px;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          }
          
          .header-info h1 {
            color: #4f46e5;
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          
          .header-info .subtitle {
            color: #64748b;
            margin: 0;
            font-size: 18px;
            font-weight: 500;
          }
          
          .header-right {
            text-align: right;
            color: #64748b;
            font-size: 14px;
          }
          
          .header-right .date {
            font-size: 16px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 4px;
          }
          
          .executive-summary {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 40px;
            border: 1px solid #e2e8f0;
          }
          
          .executive-summary h2 {
            color: #1e293b;
            margin: 0 0 20px 0;
            font-size: 24px;
            font-weight: 600;
          }
          
          .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 25px;
            margin: 30px 0;
          }
          
          .analytics-card {
            background: white;
            padding: 25px;
            border-radius: 16px;
            text-align: center;
            border: 2px solid #f1f5f9;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .analytics-card .value {
            font-size: 36px;
            font-weight: 800;
            margin: 15px 0;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .analytics-card .label {
            color: #64748b;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 600;
          }
          
          .analytics-card .description {
            color: #94a3b8;
            font-size: 13px;
            margin-top: 8px;
            font-style: italic;
          }
          
          .chart-container {
            background: white;
            padding: 25px;
            border-radius: 16px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
          }
          
          .chart-container h3 {
            margin: 0 0 20px 0;
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
          }
          
          .chart-bar {
            height: 40px;
            background: #f8fafc;
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            border: 2px solid #e2e8f0;
          }
          
          .bar-segment {
            height: 100%;
          }
          
          .bar-segment.available { background: linear-gradient(135deg, #10b981, #059669); }
          .bar-segment.in-use { background: linear-gradient(135deg, #3b82f6, #2563eb); }
          .bar-segment.low-stock { background: linear-gradient(135deg, #ef4444, #dc2626); }
          .bar-segment.repair { background: linear-gradient(135deg, #f59e0b, #d97706); }
          
          .chart-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
            justify-content: center;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
          }
          
          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid rgba(0,0,0,0.1);
          }
          
          .legend-color.available { background: linear-gradient(135deg, #10b981, #059669); }
          .legend-color.in-use { background: linear-gradient(135deg, #3b82f6, #2563eb); }
          .legend-color.low-stock { background: linear-gradient(135deg, #ef4444, #dc2626); }
          .legend-color.repair { background: linear-gradient(135deg, #f59e0b, #d97706); }
          
          .section {
            margin: 50px 0;
          }
          
          .section h2 {
            color: #1e293b;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 12px;
            margin-bottom: 30px;
            font-size: 24px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .section-icon {
            font-size: 28px;
          }
          
          .inventory-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }
          
          .inventory-table th {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 18px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .inventory-table td {
            padding: 15px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
          }
          
          .inventory-table tr:hover {
            background: #f8fafc;
          }
          
          .inventory-table tr:last-child td {
            border-bottom: none;
          }
          
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-available { background: #dcfce7; color: #166534; }
          .status-in_use { background: #dbeafe; color: #1e40af; }
          .status-out_of_stock { background: #fee2e2; color: #991b1b; }
          .status-for_repair { background: #fef3c7; color: #92400e; }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          
          .footer .signature {
            margin-top: 40px;
            text-align: right;
          }
          
          .footer .signature-line {
            border-top: 2px solid #1e293b;
            width: 200px;
            margin: 20px 0 5px auto;
          }
          /* === Compact sizing overrides for smaller PDF output === */
          body { font-size: 12px; }
          .analytics-card .value { font-size: 24px; }
          .analytics-card .label { font-size: 10px; }
          .analytics-card .description { font-size: 10px; }
          .executive-summary h2 { font-size: 20px; }
          .section h2 { font-size: 18px; }
          table { font-size: 11px; }
          .inventory-table th { padding: 10px 10px; font-size: 10px; }
          .inventory-table td { padding: 8px 10px; font-size: 11px; }
          .status-badge { font-size: 9px; padding: 4px 8px; }
          .summary-table td { padding: 6px 8px; font-size: 11px; }
          .summary-table td.label { width: 160px; }
          .chart-bar { height: 26px; }
          .legend-item { font-size: 11px; }
          .legend-color { width: 12px; height: 12px; }
          .recommendations p { margin: 4px 0; font-size: 11px; }
          .recommendations { font-size: 11px; padding: 18px 20px; }
          .footer { font-size: 11px; }
          .signature-line { width: 180px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="/src/assets/InvAi_logo.png" alt="InvAI Logo" class="logo" />
            <div class="header-info">
              <h1>InvAI Inventory Report</h1>
              <p class="subtitle">Department Inventory Analysis</p>
            </div>
          </div>
          <div class="header-right">
            <div class="date">${currentDate}</div>
            <div>Generated at ${currentTime}</div>
            <div>Report Type: Comprehensive</div>
          </div>
        </div>

        <div class="executive-summary">
          <h2>📊 Executive Summary</h2>
          <p>This report provides a comprehensive overview of the department's inventory status as of ${currentDate}. 
          The analysis includes ${totalItems} total items across equipment and supplies categories, 
          with detailed status breakdowns and actionable insights for inventory management.</p>
          
          ${createStatusChart()}
        </div>

        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="value">${totalItems}</div>
            <div class="label">Total Items</div>
            <div class="description">Complete inventory count</div>
          </div>
          <div class="analytics-card">
            <div class="value">${availableCount}</div>
            <div class="label">Available</div>
            <div class="description">Ready for deployment</div>
          </div>
          <div class="analytics-card">
            <div class="value">${inUseCount}</div>
            <div class="label">In Use</div>
            <div class="description">Currently deployed</div>
          </div>
          <div class="analytics-card">
            <div class="value">${lowStockCount}</div>
            <div class="label">Out of Stock</div>
            <div class="description">Requires restocking</div>
          </div>
          <div class="analytics-card">
            <div class="value">${forRepairCount}</div>
            <div class="label">For Repair</div>
            <div class="description">Maintenance required</div>
          </div>
          <div class="analytics-card">
            <div class="value">${((availableCount / totalItems) * 100).toFixed(1)}%</div>
            <div class="label">Availability Rate</div>
            <div class="description">Operational readiness</div>
          </div>
        </div>

        <!-- Explicit Summary Table (ensures metrics show in PDF even if cards split across pages) -->
        <div class="summary-table-wrapper">
          <table class="summary-table">
            <tbody>
              <tr><td class="label">Total Items</td><td>${totalItems}</td></tr>
              <tr><td class="label">Available</td><td>${availableCount}</td></tr>
              <tr><td class="label">In Use</td><td>${inUseCount}</td></tr>
              <tr><td class="label">Out of Stock</td><td>${lowStockCount}</td></tr>
              <tr><td class="label">For Repair</td><td>${forRepairCount}</td></tr>
              <tr><td class="label">Availability Rate</td><td>${totalItems ? ((availableCount / totalItems)*100).toFixed(1) : '0.0'}%</td></tr>
            </tbody>
          </table>
        </div>

        ${equipmentItems.length > 0 ? `
        <div class="page-break"></div>
        <div class="section">
          <h2><span class="section-icon">🔧</span>Equipment Inventory</h2>
          <p><strong>Total Equipment Items:</strong> ${equipmentCount}</p>
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${equipmentItems.map(item => {
                const rawStatus = (item && (item.status || item.inventory_status || item.current_status)) || '';
                const normalized = rawStatus.toString().trim().toLowerCase();
                const displayMap = {
                  available: 'Available',
                  'in_use': 'In Use',
                  'in use': 'In Use',
                  inuse: 'In Use',
                  out: 'Out of Stock',
                  'out_of_stock': 'Out of Stock',
                  'out of stock': 'Out of Stock',
                  depleted: 'Out of Stock',
                  repair: 'For Repair',
                  'for_repair': 'For Repair',
                  'for repair': 'For Repair',
                  maintenance: 'For Repair'
                };
                const safeDisplay = displayMap[normalized] || (rawStatus ? rawStatus.replace(/_/g,' ') : 'Unknown');
                const className = normalized || 'unknown';
                return `
                <tr>
                  <td><strong>${item?.name || 'N/A'}</strong></td>
                  <td>${item?.description || 'No description'}</td>
                  <td><span class="status-badge status-${className}">${safeDisplay}</span></td>
                  <td>${item?.quantity ?? 0}</td>
                  <td>${item?.location || 'Not specified'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${suppliesItems.length > 0 ? `
        <div class="page-break"></div>
        <div class="section">
          <h2><span class="section-icon">📦</span>Supplies Inventory</h2>
          <p><strong>Total Supply Items:</strong> ${suppliesCount}</p>
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${suppliesItems.map(item => {
                const rawStatus = (item && (item.status || item.inventory_status || item.current_status)) || '';
                const normalized = rawStatus.toString().trim().toLowerCase();
                const displayMap = {
                  available: 'Available',
                  'in_use': 'In Use',
                  'in use': 'In Use',
                  inuse: 'In Use',
                  out: 'Out of Stock',
                  'out_of_stock': 'Out of Stock',
                  'out of stock': 'Out of Stock',
                  depleted: 'Out of Stock',
                  repair: 'For Repair',
                  'for_repair': 'For Repair',
                  'for repair': 'For Repair',
                  maintenance: 'For Repair'
                };
                const safeDisplay = displayMap[normalized] || (rawStatus ? rawStatus.replace(/_/g,' ') : 'Unknown');
                const className = normalized || 'unknown';
                return `
                <tr>
                  <td><strong>${item?.name || 'N/A'}</strong></td>
                  <td>${item?.description || 'No description'}</td>
                  <td><span class="status-badge status-${className}">${safeDisplay}</span></td>
                  <td>${item?.quantity ?? 0}</td>
                  <td>${item?.location || 'Not specified'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="page-break"></div>
        <div class="section">
          <h2><span class="section-icon">📈</span>Recommendations</h2>
          <div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
            ${lowStockCount > 0 ? `<p>• <strong>Immediate Action Required:</strong> ${lowStockCount} items are out of stock and need restocking.</p>` : ''}
            ${forRepairCount > 0 ? `<p>• <strong>Maintenance Schedule:</strong> ${forRepairCount} items require repair or maintenance.</p>` : ''}
            ${((availableCount / totalItems) * 100) < 70 ? `<p>• <strong>Availability Concern:</strong> Current availability rate is ${((availableCount / totalItems) * 100).toFixed(1)}%. Consider increasing inventory levels.</p>` : ''}
            <p>• <strong>Utilization Rate:</strong> ${((inUseCount / totalItems) * 100).toFixed(1)}% of inventory is currently in use.</p>
            <p>• <strong>Next Review:</strong> Recommended monthly review for optimal inventory management.</p>
          </div>
        </div>

        <div class="footer">
          <p>This report was automatically generated by InvAI Inventory Management System</p>
          <p>For questions or additional analysis, contact the Inventory Management Team</p>
          
          <div class="signature">
            <div class="signature-line"></div>
            <div>Authorized Signature</div>
            <div style="margin-top: 5px; font-size: 12px; color: #94a3b8;">Department Manager</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const exportToExcel = async () => {
    try {
      const rawData = await fetchInventoryForReport();
      
      // Extract items array - fetchInventoryForReport already handles the format conversion
  const safeInventoryData = Array.isArray(rawData) ? rawData : [];
      
      // Prepare data for Excel
      const workbook = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['InvAI Inventory Report'],
        ['Generated:', new Date().toLocaleDateString()],
        ['Department Analysis'],
        [''],
        ['Summary Statistics'],
        ['Total Items', safeInventoryData.length],
        ['Equipment', safeFilter(safeInventoryData, item => item.category === 'equipment').length],
        ['Supplies', safeFilter(safeInventoryData, item => item.category === 'supplies').length],
        ['Available', safeFilter(safeInventoryData, item => item.status === 'available').length],
        ['In Use', safeFilter(safeInventoryData, item => item.status === 'in_use').length],
        ['Out of Stock', safeFilter(safeInventoryData, item => item.status === 'out_of_stock').length],
        ['For Repair', safeFilter(safeInventoryData, item => item.status === 'for_repair').length],
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Equipment Sheet
      const equipmentItems = safeFilter(safeInventoryData, item => item.category === 'equipment');
      if (equipmentItems.length > 0) {
        const equipmentData = [
          ['Equipment Inventory'],
          ['Name', 'Description', 'Status', 'Quantity', 'Location'],
          ...equipmentItems.map(item => [
            item.name || 'N/A',
            item.description || 'No description',
            item.status?.replace('_', ' ') || 'Unknown',
            item.quantity || 0,
            item.location || 'Not specified'
          ])
        ];
        
        const equipmentSheet = XLSX.utils.aoa_to_sheet(equipmentData);
        XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipment');
      }
      
      // Supplies Sheet
      const suppliesItems = safeFilter(safeInventoryData, item => item.category === 'supplies');
      if (suppliesItems.length > 0) {
        const suppliesData = [
          ['Supplies Inventory'],
          ['Name', 'Description', 'Status', 'Quantity', 'Location'],
          ...suppliesItems.map(item => [
            item.name || 'N/A',
            item.description || 'No description',
            item.status?.replace('_', ' ') || 'Unknown',
            item.quantity || 0,
            item.location || 'Not specified'
          ])
        ];
        
        const suppliesSheet = XLSX.utils.aoa_to_sheet(suppliesData);
        XLSX.utils.book_append_sheet(workbook, suppliesSheet, 'Supplies');
      }
      
      // All Items Sheet
      const allItemsData = [
        ['Complete Inventory'],
        ['Name', 'Description', 'Category', 'Status', 'Quantity', 'Location'],
        ...safeInventoryData.map(item => [
          item.name || 'N/A',
          item.description || 'No description',
          item.category || 'Unknown',
          item.status?.replace('_', ' ') || 'Unknown',
          item.quantity || 0,
          item.location || 'Not specified'
        ])
      ];
      
      const allItemsSheet = XLSX.utils.aoa_to_sheet(allItemsData);
      XLSX.utils.book_append_sheet(workbook, allItemsSheet, 'All Items');
      
      // Generate and download
      const fileName = `InvAI_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error generating Excel report. Please try again.');
    }
  };


  return (
    <Page>
      <Title>Reports</Title>
      <Layout>
        <Card>
          <SectionTitle>Generate Report</SectionTitle>
          <Field>
            <label>Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}
            />
          </Field>
          <Btn onClick={run} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Btn>
          
          {/* New Printable Report Button */}
          <PrintBtn onClick={generatePrintableReport} disabled={printLoading}>
            {printLoading ? (
              <>⏳ Generating...</>
            ) : (
              <>🖨️ Printable Report</>
            )}
          </PrintBtn>

          {/* Export Buttons (PDF & CSV removed) */}
          <ButtonGroup>
            <ExcelBtn onClick={exportToExcel}>📊 Export Excel</ExcelBtn>
          </ButtonGroup>

          {/* Data Status Indicator */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '.6rem',
            borderRadius: '8px',
            marginTop: '1rem',
            fontSize: '.6rem'
          }}>
            <strong>📊 Current Data:</strong> {inventoryData.length} items loaded | 
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </Card>

        <Card>
          <SectionTitle>Summary</SectionTitle>
          {!report && !loading && <p style={{ fontSize: '.65rem', color: '#64748b' }}>No report generated yet.</p>}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.65rem' }}>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid #e2e8f0', borderTop: '2px solid #4834d4',
                borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
              Generating report...
            </div>
          )}
          {report && (
            <>
              <div style={{ fontSize: '.7rem', color: '#4b5563' }}>
                {report.success ? (
                  Object.entries(report.summary).map(([key, value]) => (
                    <div key={key} style={{ display:'flex', justifyContent:'space-between', padding: '.4rem 0', borderBottom:'1px solid #f3f4f6' }}>
                      <span style={{ fontWeight: 500 }}>{key}:</span>
                      <span style={{ color:'#1f2937', fontWeight:600 }}>{value}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color:'#dc2626', fontWeight:500 }}>Error generating report: {report.error}</div>
                )}
              </div>
              {monthlyAnalytics && (
                <div style={{ marginTop:'0.75rem', background:'#fff7ed', border:'1px solid #fed7aa', padding:'.55rem .6rem', borderRadius:'8px', fontSize:'.55rem', lineHeight:1.4 }}>
                  <div style={{ fontSize:'.6rem', fontWeight:700, color:'#9a3412', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:'.3rem' }}>Monthly Analytics ({filters.month})</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:'.4rem' }}>
                    <div><strong>New Items:</strong> {monthlyAnalytics.newItems}</div>
                    <div><strong>Status Changes:</strong> {monthlyAnalytics.statusChanges}</div>
                    <div><strong>Out of Stock:</strong> {monthlyAnalytics.outOfStockEvents}</div>
                    <div><strong>Repairs Started:</strong> {monthlyAnalytics.repairsStarted}</div>
                    <div><strong>Repairs Done:</strong> {monthlyAnalytics.repairsCompleted}</div>
                    <div><strong>To In Use:</strong> {monthlyAnalytics.inUseTransitions}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </Layout>
    </Page>
  );
};

export default ManagerReports;