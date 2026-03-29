'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'

export default function LeadsPage() {
  const { data: leads, refetch } = trpc.admin.getLeads.useQuery()

  const deleteLead = trpc.admin.deleteLead.useMutation({
    onSuccess: () => refetch(),
  })

  const handleExportCsv = () => {
    if (!leads || leads.length === 0) return
    const header = 'Email,Source,Date'
    const rows = leads.map(
      (l) => `${l.email},${l.source},${format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm')}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Email Leads</h1>
          <p className="text-gray-600 mt-2">
            {leads ? `${leads.length} lead${leads.length !== 1 ? 's' : ''} captured` : 'Loading...'}
          </p>
        </div>
        <Button
          onClick={handleExportCsv}
          variant="outline"
          disabled={!leads || leads.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {leads && leads.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Source</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{lead.email}</td>
                      <td className="py-3">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy h:mm a')}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            if (confirm(`Delete lead ${lead.email}?`)) {
                              deleteLead.mutate({ id: lead.id })
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : leads && leads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No leads captured yet. They&apos;ll appear here when visitors submit their email on the guidebook page.</p>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}
