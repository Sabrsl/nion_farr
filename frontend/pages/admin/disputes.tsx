import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock,
  FiMessageSquare
} from 'react-icons/fi/index.js';
import AdminLayout from '@/components/layouts/AdminLayout';

// Types for our disputes
interface Dispute {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'pending';
  createdAt: string;
  updatedAt: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  priority: 'low' | 'medium' | 'high';
}

const AdminDisputesPage = () => {
  // State management
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch disputes (mock data)
  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      
      // Mock data for disputes
      const mockDisputes: Dispute[] = [
        {
          id: '1',
          title: 'Late delivery dispute',
          description: 'The freelancer delivered the project 5 days after the deadline',
          status: 'open',
          createdAt: '2023-06-15T10:30:00',
          updatedAt: '2023-06-15T10:30:00',
          serviceId: 's1',
          serviceName: 'Logo Design',
          clientId: 'c1',
          clientName: 'John Smith',
          freelancerId: 'f1',
          freelancerName: 'Alice Designer',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Quality issues',
          description: 'Delivered work does not match the agreed quality standards',
          status: 'pending',
          createdAt: '2023-06-12T14:20:00',
          updatedAt: '2023-06-14T09:15:00',
          serviceId: 's2',
          serviceName: 'Website Development',
          clientId: 'c2',
          clientName: 'Emily Johnson',
          freelancerId: 'f2',
          freelancerName: 'Bob Developer',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Payment issue',
          description: 'Client claims they were overcharged for revisions',
          status: 'resolved',
          createdAt: '2023-06-10T08:45:00',
          updatedAt: '2023-06-13T16:30:00',
          serviceId: 's3',
          serviceName: 'Content Writing',
          clientId: 'c3',
          clientName: 'Michael Brown',
          freelancerId: 'f3',
          freelancerName: 'Carol Writer',
          priority: 'low'
        },
        {
          id: '4',
          title: 'Scope creep complaint',
          description: 'Freelancer claims client keeps adding requirements not in original agreement',
          status: 'open',
          createdAt: '2023-06-08T11:20:00',
          updatedAt: '2023-06-11T13:10:00',
          serviceId: 's4',
          serviceName: 'Mobile App Development',
          clientId: 'c4',
          clientName: 'David Wilson',
          freelancerId: 'f4',
          freelancerName: 'Eve Programmer',
          priority: 'high'
        },
        {
          id: '5',
          title: 'Communication breakdown',
          description: 'Both parties report lack of communication',
          status: 'pending',
          createdAt: '2023-06-07T16:15:00',
          updatedAt: '2023-06-09T10:45:00',
          serviceId: 's5',
          serviceName: 'Social Media Management',
          clientId: 'c5',
          clientName: 'Sarah Jones',
          freelancerId: 'f5',
          freelancerName: 'Frank Marketer',
          priority: 'medium'
        }
      ];

      // Filter disputes based on search, status, and priority
      let filteredDisputes = [...mockDisputes];
      
      if (searchTerm) {
        filteredDisputes = filteredDisputes.filter(
          dispute => 
            dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            dispute.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dispute.freelancerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedStatus !== 'all') {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.status === selectedStatus
        );
      }
      
      if (selectedPriority !== 'all') {
        filteredDisputes = filteredDisputes.filter(
          dispute => dispute.priority === selectedPriority
        );
      }

      setDisputes(filteredDisputes);
      setTotalPages(Math.ceil(filteredDisputes.length / 5));
      setLoading(false);
    };

    fetchDisputes();
  }, [searchTerm, selectedStatus, selectedPriority]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Counts for statistics
  const openDisputesCount = disputes.filter(d => d.status === 'open').length;
  const pendingDisputesCount = disputes.filter(d => d.status === 'pending').length;
  const resolvedDisputesCount = disputes.filter(d => d.status === 'resolved').length;

  // Handle status change of a dispute
  const handleStatusChange = (disputeId: string, newStatus: 'open' | 'resolved' | 'pending') => {
    setDisputes(prevDisputes => 
      prevDisputes.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: newStatus, updatedAt: new Date().toISOString() }
          : dispute
      )
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dispute Management</h1>
          <p className="text-gray-600">Manage and resolve client and freelancer disputes</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <FiAlertTriangle className="text-red-500 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Open Disputes</h2>
                <p className="text-2xl font-bold text-gray-800">{openDisputesCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiClock className="text-yellow-500 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Pending Resolution</h2>
                <p className="text-2xl font-bold text-gray-800">{pendingDisputesCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="text-green-500 text-xl" />
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">Resolved Disputes</h2>
                <p className="text-2xl font-bold text-gray-800">{resolvedDisputesCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search disputes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No disputes found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispute Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disputes
                    .slice((currentPage - 1) * 5, currentPage * 5)
                    .map((dispute) => (
                    <tr key={dispute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{dispute.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{dispute.description}</div>
                          <div className="text-xs text-gray-400">
                            Opened: {formatDate(dispute.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dispute.serviceName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div><span className="font-medium">Client:</span> {dispute.clientName}</div>
                          <div><span className="font-medium">Freelancer:</span> {dispute.freelancerName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          dispute.status === 'open' 
                            ? 'bg-red-100 text-red-800' 
                            : dispute.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          dispute.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : dispute.priority === 'medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => alert(`View details for dispute ${dispute.id}`)}
                          >
                            View
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleStatusChange(dispute.id, 'resolved')}
                            disabled={dispute.status === 'resolved'}
                          >
                            Resolve
                          </button>
                          <button
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                            onClick={() => alert(`Contact parties for dispute ${dispute.id}`)}
                          >
                            <FiMessageSquare className="mr-1" />
                            Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && disputes.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 5 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 5, disputes.length)}
                    </span>{' '}
                    of <span className="font-medium">{disputes.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === page
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDisputesPage; 