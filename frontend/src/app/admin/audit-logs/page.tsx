'use client';

import { useAuditLogs } from '@/api/hooks';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useState } from 'react';
import { Activity } from 'lucide-react';

export default function AdminAuditLogs() {
  const { data, loading } = useAuditLogs();
  const [filter, setFilter] = useState('');

  const filteredLogs = data?.filter((log: any) => 
    !filter || log.action.toLowerCase().includes(filter.toLowerCase()) || 
    log.details?.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Security & Operational Logs</CardTitle>
          <input 
            type="text" 
            placeholder="Filter logs..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="p-2 border rounded w-64 text-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700 w-48">Timestamp</th>
                  <th className="px-4 py-3 font-medium text-gray-700 w-32">User</th>
                  <th className="px-4 py-3 font-medium text-gray-700 w-48">Action</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Details</th>
                  <th className="px-4 py-3 font-medium text-gray-700 w-24 text-right">IP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading logs...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No logs found matching filter.</td></tr>
                ) : (
                  filteredLogs.map((log: any) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{log.user?.loginId || 'System'}</Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-md">
                        {log.details || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs text-right whitespace-nowrap">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
