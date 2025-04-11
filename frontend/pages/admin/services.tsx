import React, { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi/index.js';
import { FiEye } from 'react-icons/fi/index.js';
import { FiTrash2 } from 'react-icons/fi/index.js';
import { FiSearch } from 'react-icons/fi/index.js';
import { FiFilter } from 'react-icons/fi/index.js';
import { HiOutlineOfficeBuilding } from 'react-icons/hi/index.js';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai/index.js';
import { BsStarFill } from 'react-icons/bs/index.js';
import Link from 'next/link';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Service } from '../../types';

// Helper function to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(price);
};

// Mock data for example
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Website Development',
    description: 'Professional website development service',
    price: 50000,
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 25,
    category: { id: 'web', name: 'Web Development' },
    provider: {
      id: 'p1',
      name: 'John Doe',
      avatar: '/images/avatar-1.jpg'
    },
    createdAt: '2023-10-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Logo Design',
    description: 'Custom logo design for your brand',
    price: 25000,
    isActive: true,
    isFeatured: false,
    rating: 4.5,
    totalReviews: 18,
    category: { id: 'design', name: 'Graphic Design' },
    provider: {
      id: 'p2',
      name: 'Jane Smith',
      avatar: '/images/avatar-2.jpg'
    },
    createdAt: '2023-10-12T14:20:00Z'
  },
  {
    id: '3',
    title: 'Social Media Management',
    description: 'Complete social media management service',
    price: 35000,
    isActive: false,
    isFeatured: false,
    rating: 4.2,
    totalReviews: 12,
    category: { id: 'marketing', name: 'Digital Marketing' },
    provider: {
      id: 'p3',
      name: 'Mike Johnson',
      avatar: '/images/avatar-3.jpg'
    },
    createdAt: '2023-10-08T09:15:00Z'
  },
  {
    id: '4',
    title: 'Content Writing',
    description: 'Professional content writing for websites and blogs',
    price: 20000,
    isActive: true,
    isFeatured: true,
    rating: 4.6,
    totalReviews: 22,
    category: { id: 'writing', name: 'Content Writing' },
    provider: {
      id: 'p4',
      name: 'Emily Davis',
      avatar: '/images/avatar-4.jpg'
    },
    createdAt: '2023-10-05T11:45:00Z'
  },
  {
    id: '5',
    title: 'Mobile App Development',
    description: 'Custom mobile app development for iOS and Android',
    price: 100000,
    isActive: true,
    isFeatured: false,
    rating: 4.9,
    totalReviews: 30,
    category: { id: 'mobile', name: 'Mobile Development' },
    provider: {
      id: 'p5',
      name: 'David Wilson',
      avatar: '/images/avatar-5.jpg'
    },
    createdAt: '2023-09-28T16:30:00Z'
  }
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const itemsPerPage = 10;
  
  // Simulation of data fetching
  useEffect(() => {
    const fetchData = () => {
      // Filter data based on search, category, and status
      let filteredServices = [...mockServices];
      
      if (searchTerm) {
        filteredServices = filteredServices.filter(service => 
          service.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory) {
        filteredServices = filteredServices.filter(service => 
          service.category && typeof service.category !== 'string' && 
          service.category.id === selectedCategory
        );
      }
      
      if (selectedStatus) {
        if (selectedStatus === 'active') {
          filteredServices = filteredServices.filter(service => service.isActive);
        } else if (selectedStatus === 'inactive') {
          filteredServices = filteredServices.filter(service => !service.isActive);
        } else if (selectedStatus === 'featured') {
          filteredServices = filteredServices.filter(service => service.isFeatured);
        }
      }
      
      // Calculate total pages
      setTotalPages(Math.ceil(filteredServices.length / itemsPerPage));
      
      // Paginate results
      const start = (currentPage - 1) * itemsPerPage;
      const paginatedServices = filteredServices.slice(start, start + itemsPerPage);
      
      setServices(paginatedServices);
      setIsLoading(false);
    };

    fetchData();
  }, [searchTerm, selectedCategory, selectedStatus, currentPage]);
  
  // Unique categories for filter
  const categories = Array.from(
    new Set(
      mockServices
        .filter(service => service.category && typeof service.category !== 'string')
        .map(service => {
          if (typeof service.category !== 'string') {
            return { id: service.category?.id, name: service.category?.name };
          }
          return null;
        })
        .filter(Boolean)
    )
  );
  
  // Stats calculations
  const totalServices = mockServices.length;
  const activeServices = mockServices.filter(service => service.isActive).length;
  const featuredServices = mockServices.filter(service => service.isFeatured).length;
  const inactiveServices = mockServices.filter(service => !service.isActive).length;

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      // In a real app, you would call an API here
      setServices(prevServices => prevServices.filter(service => service.id !== id));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Services Administration</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Services Administration</h1>
          <Link href="/admin/services/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Add New Service
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <HiOutlineOfficeBuilding className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Total Services</h3>
                <p className="text-2xl font-semibold">{totalServices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <AiOutlineCheckCircle className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Active Services</h3>
                <p className="text-2xl font-semibold">{activeServices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <BsStarFill className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Featured Services</h3>
                <p className="text-2xl font-semibold">{featuredServices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <AiOutlineCloseCircle className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Inactive Services</h3>
                <p className="text-2xl font-semibold">{inactiveServices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-48">
                <div className="relative">
                  <select
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              
              <div className="w-48">
                <div className="relative">
                  <select
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                  </select>
                  <FiFilter className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.length > 0 ? (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={service.image || '/images/placeholder.jpg'}
                              alt={service.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{service.title}</div>
                            <div className="text-sm text-gray-500">
                              {service.rating} ★ ({service.totalReviews} reviews)
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={service.provider?.avatar || '/images/avatar-placeholder.jpg'}
                              alt={service.provider?.name}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{service.provider?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {typeof service.category !== 'string' ? service.category?.name : service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(service.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.createdAt ? formatDate(service.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {service.isFeatured && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/services/${service.id}`} className="text-blue-600 hover:text-blue-900">
                            <FiEye size={18} />
                          </Link>
                          <Link href={`/admin/services/edit/${service.id}`} className="text-green-600 hover:text-green-900">
                            <FiEdit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No services found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{Math.min(((currentPage - 1) * itemsPerPage) + 1, services.length)}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, services.length)}</span> of{' '}
                    <span className="font-medium">{services.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
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

export default AdminServicesPage; 