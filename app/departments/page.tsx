import { MinistryDepartmentsBoard } from '@/components/ministry/MinistryDepartmentsBoard';

export default function DepartmentsPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <MinistryDepartmentsBoard />
      </div>
    </main>
  );
}
