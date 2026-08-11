import { AttendanceAssimilationDashboard } from '@/components/ministry/AttendanceAssimilationDashboard';
import { ShieldCheck, UsersRound } from 'lucide-react';

export default function AdminAttendancePage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm"><UsersRound className="mr-2 h-4 w-4" /> Attendance & assimilation intelligence</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Count responsibly, then ask whether people are finding care, community, and clear next steps.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">This page intentionally uses aggregate numbers rather than individual attendance profiles. Its purpose is operational learning: staffing, welcome, response ownership, community connection, and ministry readiness.</p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-900"><ShieldCheck className="mb-3 h-5 w-5 text-cyan-700" /> Attendance is not a measure of spiritual worth. Individual care and discipleship decisions require consent, context, and human leadership.</div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AttendanceAssimilationDashboard />
        </div>
      </section>
    </main>
  );
}
