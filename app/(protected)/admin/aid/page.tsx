import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AidReviewClient } from "./AidReviewClient";

export default async function AdminAidPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH_ADMIN") {
        redirect("/");
    }

    // Fetch pending requests
    const pendingRequests = await prisma.aidRequest.findMany({
        where: { status: "PENDING" },
        include: {
            user: {
                select: { name: true, email: true },
            },
            allocations: true,
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate available funds (simplified)
    const totalOfferings = await prisma.offering.aggregate({
        where: { purpose: "COMMUNITY_AID" },
        _sum: { amount: true },
    });

    const totalAllocated = await prisma.aidAllocation.aggregate({
        _sum: { amount: true },
    });

    const availableFunds = (totalOfferings._sum.amount || 0) - (totalAllocated._sum.amount || 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Aid Request Management</h1>
                    <p className="text-stone-600">Review and allocate community assistance funds.</p>
                </div>
                <div className="flex space-x-4">
                    <Link
                        href="/admin"
                        className="px-4 py-2 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50 text-sm font-medium"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-stone-200">
                        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Fund Status</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-stone-500 mb-1">Available Aid Funds</p>
                                <p className={`text-2xl font-bold ${availableFunds > 0 ? 'text-sage-600' : 'text-red-600'}`}>
                                    ${availableFunds.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-500 mb-1">Pending Requests</p>
                                <p className="text-xl font-semibold text-stone-800">{pendingRequests.length}</p>
                            </div>
                        </div>
                        {availableFunds <= 100 && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                                Warning: Aid funds are running low. Consider delaying non-urgent requests or organizing a specific offering.
                            </div>
                        )}
                    </div>

                    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                        <h4 className="text-sm font-medium text-stone-800 mb-2">Review Guidelines</h4>
                        <ul className="text-xs text-stone-600 space-y-2 pl-4 list-disc">
                            <li>Prioritize urgent (red tag) requests.</li>
                            <li>Verify user history for frequent requests.</li>
                            <li>For amounts &gt; $500, secondary admin approval is recommended offline.</li>
                            <li>Add notes for ALL rejections.</li>
                        </ul>
                    </div>
                </div>

                {/* Main Content - Request List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-stone-900">Pending Requests</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Needs Review
                            </span>
                        </div>

                        {pendingRequests.length === 0 ? (
                            <div className="p-8 text-center text-stone-500">
                                <svg className="mx-auto h-12 w-12 text-stone-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No pending aid requests.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-200">
                                {pendingRequests.map((request: any) => (
                                    <AidReviewClient
                                        key={request.id}
                                        request={request}
                                        availableFunds={availableFunds}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
