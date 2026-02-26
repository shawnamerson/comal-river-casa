'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session } = useSession()

  // Profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Change password modal
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changePassword = trpc.admin.changePassword.useMutation({
    onSuccess: () => {
      setPwSuccess('Password changed successfully')
      setPwError('')
      setPwForm({ current: '', next: '', confirm: '' })
    },
    onError: (error) => {
      setPwError(error.message)
      setPwSuccess('')
    },
  })

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    changePassword.mutate({
      currentPassword: pwForm.current,
      newPassword: pwForm.next,
    })
  }

  function openChangePassword() {
    setDropdownOpen(false)
    setPwForm({ current: '', next: '', confirm: '' })
    setPwError('')
    setPwSuccess('')
    setShowPwModal(true)
  }

  // Fetch data
  const { data: stats } = trpc.admin.getStats.useQuery()
  const { data: bookings, refetch: refetchBookings } = trpc.admin.getUpcomingBookings.useQuery()

  // Mutations
  const updateStatus = trpc.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      refetchBookings()
      alert('Booking status updated successfully')
    },
    onError: (error) => {
      alert(`Error updating status: ${error.message}`)
    },
  })

  const handleCancelBooking = (bookingId: string) => {
    const reason = prompt('Enter cancellation reason:')
    if (reason !== null) {
      updateStatus.mutate({
        id: bookingId,
        status: 'CANCELLED',
        cancellationReason: reason || undefined,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : session?.user?.email?.[0].toUpperCase() ?? 'A'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage bookings and property availability</p>
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white border rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {session?.user?.email}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={openChangePassword}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Change Password
                  </button>
                  <hr />
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => router.push('/admin/bookings')} variant="outline">
              📋 Bookings
            </Button>
            <Button onClick={() => router.push('/admin/availability')} variant="outline">
              📅 Manage Availability
            </Button>
            <Button onClick={() => router.push('/admin/rates')} variant="outline">
              💰 Manage Rates
            </Button>
            <Button onClick={() => router.push('/admin/calendars')} variant="outline">
              🔄 Calendar Sync
            </Button>
            <Button onClick={() => router.push('/admin/reviews')} variant="outline">
              ⭐ Reviews
            </Button>
            <Button onClick={() => router.push('/admin/accounting')} variant="outline">
              📊 Accounting
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.upcomingBookings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.currentBookings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pendingBookings}
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/admin/accounting')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Net Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {!bookings || bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming bookings</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.guestName}</h3>
                        <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                        {booking.guestPhone && (
                          <p className="text-sm text-gray-600">{booking.guestPhone}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-3 text-sm">
                      <div>
                        <span className="text-gray-600">Check-in:</span>
                        <div className="font-semibold">
                          {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Check-out:</span>
                        <div className="font-semibold">
                          {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Guests:</span>
                        <div className="font-semibold">{booking.numberOfGuests}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Nights:</span>
                        <div className="font-semibold">{booking.numberOfNights}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-lg font-bold text-green-600">
                        ${booking.totalPrice}
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {(booking.status === 'PENDING' ||
                          booking.status === 'CONFIRMED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={updateStatus.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">Special Requests:</p>
                        <p className="text-sm">{booking.specialRequests}</p>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      Booking ID: {booking.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => setShowPwModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNext ? "text" : "password"}
                    required
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNext ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
              {pwSuccess && <p className="text-green-600 text-sm">{pwSuccess}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? 'Updating...' : 'Update Password'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPwModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
