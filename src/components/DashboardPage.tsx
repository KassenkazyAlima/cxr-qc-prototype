import React from "react";
import { CheckCircle, AlertTriangle, AlertCircle, Search } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface DashboardPageProps {
  onViewImage: (patientId: string) => void;
}

const mockData = [
  {
    patientId: 'PT-2025-001',
    viewType: 'PA',
    device: 'GE Discovery XR656',
    qcStatus: 'PASS',
    date: '2025-11-02',
  },
  {
    patientId: 'PT-2025-002',
    viewType: 'Lateral',
    device: 'Siemens Multix',
    qcStatus: 'FIX',
    date: '2025-11-02',
  },
  {
    patientId: 'PT-2025-003',
    viewType: 'PA',
    device: 'Philips DigitalDiagnost',
    qcStatus: 'FLAG',
    date: '2025-11-01',
  },
  {
    patientId: 'PT-2025-004',
    viewType: 'PA',
    device: 'GE Discovery XR656',
    qcStatus: 'PASS',
    date: '2025-11-01',
  },
  {
    patientId: 'PT-2025-005',
    viewType: 'Lateral',
    device: 'Siemens Multix',
    qcStatus: 'PASS',
    date: '2025-11-01',
  },
  {
    patientId: 'PT-2025-006',
    viewType: 'PA',
    device: 'GE Discovery XR656',
    qcStatus: 'FIX',
    date: '2025-10-31',
  },
  {
    patientId: 'PT-2025-007',
    viewType: 'PA',
    device: 'Philips DigitalDiagnost',
    qcStatus: 'PASS',
    date: '2025-10-31',
  },
  {
    patientId: 'PT-2025-008',
    viewType: 'Lateral',
    device: 'Siemens Multix',
    qcStatus: 'FLAG',
    date: '2025-10-31',
  },
];

export function DashboardPage({ onViewImage }: DashboardPageProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            PASS
          </Badge>
        );
      case 'FIX':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            FIX
          </Badge>
        );
      case 'FLAG':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            FLAG
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900 mb-2">Patient X-ray Records</h1>
          <p className="text-gray-600">Review and manage chest X-ray quality control</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Records</p>
            <p className="text-2xl text-gray-900">248</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
            <p className="text-2xl text-green-600">87.5%</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Fix Required</p>
            <p className="text-2xl text-yellow-600">8.1%</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Flagged</p>
            <p className="text-2xl text-red-600">4.4%</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by Patient ID, Device, or Status..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>View Type</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>QC Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((record) => (
                <TableRow key={record.patientId}>
                  <TableCell>{record.patientId}</TableCell>
                  <TableCell>{record.viewType}</TableCell>
                  <TableCell>{record.device}</TableCell>
                  <TableCell>{getStatusBadge(record.qcStatus)}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewImage(record.patientId)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
