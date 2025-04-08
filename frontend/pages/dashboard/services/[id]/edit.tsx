import { NextPage } from 'next';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FiSave, 
  FiX, 
  FiUploadCloud, 
  FiDollarSign, 
  FiClock, 
  FiTag, 
  FiPlus,
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiArrowLeft,
  FiInfo,
  FiTrash2,
  FiRefreshCw,
  FiEdit2,
  FiCheck
} from 'react-icons/fi';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Editor } from '@tinymce/tinymce-react';
import { Dropzone } from '../../../../components/ui/Dropzone';
import { Switch } from '@headlessui/react';
import { RadioGroup } from '@headlessui/react';
import { Combobox } from '@headlessui/react';
import { Tab } from '@headlessui/react';
import { Stepper } from '../../../../components/ui/Stepper';
import { Badge } from '../../../../components/ui/Badge';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { Category, Service } from '../../../../types';
import { ServicePreview } from '../../../../components/dashboard/services/ServicePreview';

// Types
type FormValues = {
  title: string;
  category: string;
  summary: string;
  description: string;
  price: number;
  tags: string[];
  deliveryTime: number;
  revisions: number;
  images: File[];
  isActive: boolean;
  preview?: string;
  previewImage?: string;
  packageOptions: {
    basic: {
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      revisions: number;
      features: string[];
    };
    standard: {
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      revisions: number;
      features: string[];
    };
    premium: {
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      revisions: number;
      features: string[];
    };
  };
  hasPackages: boolean;
};

const EditServicePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const editorRef = useRef<any>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'saving' | 'success' | 'error'>('idle');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Mock service history data
  const serviceHistory = [
    { date: new Date(2023, 6, 15), user: 'John Doe', action: 'Création du service' },
    { date: new Date(2023, 7, 22), user: 'John Doe', action: 'Modification des images' },
    { date: new Date(2023, 8, 5), user: 'John Doe', action: 'Mise à jour du prix' },
    { date: new Date(2023, 8, 18), user: 'John Doe', action: 'Mise à jour de la description' },
    { date: new Date(2023, 9, 3), user: 'John Doe', action: 'Service activé' },
  ];

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty, isValid, dirtyFields } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      category: '',
      summary: '',
      description: '',
      price: 5000,
      tags: [],
      deliveryTime: 3,
      revisions: 2,
      images: [],
      isActive: true,
      hasPackages: false,
      packageOptions: {
        basic: {
          title: 'Basique',
          description: 'Option de base pour votre service',
          price: 5000,
          deliveryTime: 3,
          revisions: 1,
          features: ['Livraison standard', '1 révision']
        },
        standard: {
          title: 'Standard',
          description: 'Option standard avec plus de fonctionnalités',
          price: 10000,
          deliveryTime: 5,
          revisions: 2,
          features: ['Livraison standard', '2 révisions', 'Fichiers sources inclus']
        },
        premium: {
          title: 'Premium',
          description: 'Option premium tout compris',
          price: 20000,
          deliveryTime: 7,
          revisions: 5,
          features: ['Livraison prioritaire', 'Révisions illimitées', 'Fichiers sources inclus', 'Support premium']
        }
      }
    },
    mode: 'onChange'
  });

  const hasPackages = watch('hasPackages');
  const tags = watch('tags');
  const watchedImages = watch('images');
  const selectedCategory = categories.find((category: Category) => category.id === watch('category'));
  
  const formValues = watch();

  // Check if form has changes compared to original data
  useEffect(() => {
    if (originalData && isDirty) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [formValues, originalData, isDirty]);

  // Fetch the service data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // En production, remplacer par des appels API réels
        // const catResponse = await fetch('/api/categories');
        // const servResponse = await fetch('/api/services');
        // setCategories(await catResponse.json());
        // setServices(await servResponse.json());
        
        // Pour l'instant, utiliser des tableaux vides
        setCategories([]);
        setServices([]);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (id && categories.length > 0 && services.length > 0) {
      setSaveStatus('loading');
      // Chercher le service dans la liste des services
      const serviceData = services.find(s => s.id === id);
      
      if (serviceData) {
        // Remplir le formulaire avec les données existantes
        reset({
          title: serviceData.title,
          category: typeof serviceData.category === 'object' ? serviceData.category.id : serviceData.category,
          // ... autres champs
        });
        setService(serviceData);
        setSaveStatus('idle');
      } else {
        // Rediriger si le service n'existe pas
        router.push('/dashboard/services');
      }
    }
  }, [id, reset, router, categories, services]);

  // Filtering categories for the search
  const filteredCategories = categoryQuery === ''
    ? categories
    : categories.filter((category: Category) =>
        category.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(categoryQuery.toLowerCase().replace(/\s+/g, ''))
      );

  // Handle adding tags
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setValue('tags', [...tags, tagInput], { shouldDirty: true });
      setTagInput('');
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove), { shouldDirty: true });
  };

  // Handle image upload
  const handleImageDrop = useCallback((acceptedFiles: File[]) => {
    // Create URLs for preview
    const urls = acceptedFiles.map(file => URL.createObjectURL(file));
    setImageUrls(prevUrls => [...prevUrls, ...urls]);
    setImageFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setValue('images', [...watchedImages, ...acceptedFiles], { shouldDirty: true });
  }, [setValue, watchedImages]);

  // Remove an image
  const handleRemoveImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];
    
    // Release URL to prevent memory leaks
    if (newImageUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(newImageUrls[index]);
    }
    
    newImageFiles.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
    setValue('images', newImageFiles, { shouldDirty: true });
  };

  // Reset form to original data
  const handleReset = () => {
    if (originalData) {
      reset(originalData);
      
      // Reset image URLs to original service images
      if (service?.images && service.images.length > 0) {
        setImageUrls(service.images);
      } else {
        setImageUrls([]);
      }
      
      setImageFiles([]);
      setDiscardModalOpen(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSaveStatus('saving');
    
    try {
      // Simulate sending data to server
      console.log('Updated service data:', data);
      
      // Simulate update delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveStatus('success');
      
      // Update original data to reflect saved changes
      setOriginalData(data);
      
      // Redirect to services list after a short delay
      setTimeout(() => {
        router.push('/dashboard/services');
      }, 1000);
      
    } catch (error) {
      console.error('Error updating service:', error);
      setSaveStatus('error');
    }
  };

  // Form steps
  const steps = [
    { id: 'info', name: 'Informations de base', icon: FiImage },
    { id: 'details', name: 'Description & Détails', icon: FiTag },
    { id: 'pricing', name: 'Tarification', icon: FiDollarSign },
    { id: 'preview', name: 'Aperçu & Publication', icon: FiEye }
  ];

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Service Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du service <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ex: Création de logo professionnel pour votre entreprise"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("title", { 
                    required: "Le titre est obligatoire", 
                    minLength: { value: 10, message: "Le titre doit contenir au moins 10 caractères" } 
                  })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
                {dirtyFields.title && (
                  <p className="mt-1 text-xs text-amber-600">
                    <FiInfo className="inline-block mr-1 h-3 w-3" />
                    Le titre de votre service est un élément important pour le référencement
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "La catégorie est obligatoire" }}
                  render={({ field }) => (
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <div className="relative">
                        <div className="relative w-full">
                          <Combobox.Input
                            className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                            displayValue={(categoryId: string) => 
                              categories.find((category: Category) => category.id === categoryId)?.name || ""
                            }
                            onChange={(event) => setCategoryQuery(event.target.value)}
                            placeholder="Sélectionnez une catégorie"
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Combobox.Button>
                        </div>

                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredCategories.length === 0 && categoryQuery !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              Aucune catégorie trouvée.
                            </div>
                          ) : (
                            filteredCategories.map((category: Category) => (
                              <Combobox.Option
                                key={category.id}
                                value={category.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {category.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active ? 'text-white' : 'text-indigo-600'
                                        }`}
                                      >
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path
                                            fillRule="evenodd"
                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </div>
                    </Combobox>
                  )}
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
                {selectedCategory && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">
                      {selectedCategory.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Service Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                  Résumé <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="summary"
                  rows={3}
                  placeholder="Décrivez votre service en quelques phrases"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.summary ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("summary", { 
                    required: "Le résumé est obligatoire", 
                    maxLength: { value: 250, message: "Le résumé ne doit pas dépasser 250 caractères" } 
                  })}
                ></textarea>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Court résumé qui apparaîtra dans les résultats de recherche
                  </p>
                  <p className={`text-xs ${watch('summary')?.length > 200 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {watch('summary')?.length || 0}/250
                  </p>
                </div>
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
                )}
              </div>

              {/* Service Images */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Images du service <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">{imageUrls.length}/5 images</span>
                </div>
                
                {/* Images already uploaded */}
                {imageUrls.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg border border-gray-200">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-sm">
                              Principale
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Only show dropzone if less than 5 images */}
                {imageUrls.length < 5 && (
                  <Controller
                    name="images"
                    control={control}
                    rules={{ 
                      validate: {
                        atLeastOne: () => imageUrls.length > 0 || "Veuillez ajouter au moins une image"
                      }
                    }}
                    render={({ field }) => (
                      <Dropzone
                        onDrop={handleImageDrop}
                        accept={{
                          'image/jpeg': ['.jpg', '.jpeg'],
                          'image/png': ['.png'],
                          'image/webp': ['.webp']
                        }}
                        maxFiles={5 - imageUrls.length}
                        maxSize={5 * 1024 * 1024} // 5MB
                        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'}`}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FiUploadCloud className="w-10 h-10 text-gray-400" />
                          <div className="text-sm text-gray-500">
                            <p className="font-medium">Cliquez ou glissez-déposez des images</p>
                            <p>PNG, JPG, WEBP jusqu'à 5Mo</p>
                          </div>
                        </div>
                      </Dropzone>
                    )}
                  />
                )}
                
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
                )}
                
                <p className="mt-1 text-xs text-gray-500">
                  Des images de haute qualité augmentent vos chances d'être sélectionné. Choisissez des images claires et représentatives de votre service.
                </p>
              </div>
              
              {/* Service History */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Historique du service</h3>
                  <button
                    type="button"
                    onClick={() => setShowFullHistory(!showFullHistory)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {showFullHistory ? 'Réduire' : 'Voir tout'}
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {(showFullHistory ? serviceHistory : serviceHistory.slice(0, 3)).map((event, index) => (
                      <li key={index} className="px-4 py-2.5 flex items-start text-sm">
                        <div className="relative flex items-center mr-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mr-1.5 flex-shrink-0"></div>
                          {index < serviceHistory.length - 1 && (
                            <div className="absolute top-4 left-1 w-0.5 h-full -mb-3 bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-900 font-medium">{event.action}</span>
                            <span className="text-gray-500 text-xs">{event.date.toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">par {event.user}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Service Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Décrivez en détail ce que vous proposez"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("description", { 
                    required: "La description est obligatoire", 
                    minLength: { value: 100, message: "La description doit contenir au moins 100 caractères" } 
                  })}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Service Pricing */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix <span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  placeholder="Ex: 5000"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.price ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("price", { 
                    required: "Le prix est obligatoire", 
                    min: { value: 0, message: "Le prix doit être au moins 0" } 
                  })}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Service Delivery Time */}
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Temps de livraison <span className="text-red-500">*</span>
                </label>
                <input
                  id="deliveryTime"
                  type="number"
                  placeholder="Ex: 3"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.deliveryTime ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("deliveryTime", { 
                    required: "Le temps de livraison est obligatoire", 
                    min: { value: 0, message: "Le temps de livraison doit être au moins 0" } 
                  })}
                />
                {errors.deliveryTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>
                )}
              </div>

              {/* Service Revisions */}
              <div>
                <label htmlFor="revisions" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de révisions <span className="text-red-500">*</span>
                </label>
                <input
                  id="revisions"
                  type="number"
                  placeholder="Ex: 2"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.revisions ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("revisions", { 
                    required: "Le nombre de révisions est obligatoire", 
                    min: { value: 0, message: "Le nombre de révisions doit être au moins 0" } 
                  })}
                />
                {errors.revisions && (
                  <p className="mt-1 text-sm text-red-600">{errors.revisions.message}</p>
                )}
              </div>

              {/* Service Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags <span className="text-red-500">*</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  placeholder="Ex: Design, Création, Graphisme"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.tags ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("tags", { 
                    required: "Les tags sont obligatoires", 
                    minLength: { value: 2, message: "Les tags doivent contenir au moins 2 caractères" } 
                  })}
                />
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Service Package Options */}
              <div>
                <label htmlFor="packageOptions" className="block text-sm font-medium text-gray-700 mb-1">
                  Options de package <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="packageOptions"
                  rows={4}
                  placeholder="Décrivez les options de package"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.packageOptions ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("packageOptions", { 
                    required: "Les options de package sont obligatoires", 
                    minLength: { value: 100, message: "Les options de package doivent contenir au moins 100 caractères" } 
                  })}
                ></textarea>
                {errors.packageOptions && (
                  <p className="mt-1 text-sm text-red-600">{errors.packageOptions.message}</p>
                )}
              </div>

              {/* Service Has Packages */}
              <div>
                <label htmlFor="hasPackages" className="block text-sm font-medium text-gray-700 mb-1">
                  Avec ou sans packages <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="hasPackages"
                  control={control}
                  rules={{ required: "La sélection est obligatoire" }}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onChange={field.onChange}
                      className="flex items-center space-x-4"
                    >
                      <RadioGroup.Option value={true}>
                        <RadioGroup.Label>Avec</RadioGroup.Label>
                      </RadioGroup.Option>
                      <RadioGroup.Option value={false}>
                        <RadioGroup.Label>Sans</RadioGroup.Label>
                      </RadioGroup.Option>
                    </RadioGroup>
                  )}
                />
                {errors.hasPackages && (
                  <p className="mt-1 text-sm text-red-600">{errors.hasPackages.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Service Preview */}
              <div>
                <label htmlFor="preview" className="block text-sm font-medium text-gray-700 mb-1">
                  Aperçu du service
                </label>
                <textarea
                  id="preview"
                  rows={4}
                  placeholder="Aperçu du service"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.preview ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("preview", { 
                    required: "L'aperçu est obligatoire", 
                    minLength: { value: 100, message: "L'aperçu doit contenir au moins 100 caractères" } 
                  })}
                ></textarea>
                {errors.preview && (
                  <p className="mt-1 text-sm text-red-600">{errors.preview.message}</p>
                )}
              </div>

              {/* Service Preview Image */}
              <div>
                <label htmlFor="previewImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Image d'aperçu
                </label>
                <input
                  id="previewImage"
                  type="text"
                  placeholder="URL de l'image d'aperçu"
                  className={`w-full px-4 py-3 rounded-lg border ${errors.previewImage ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("previewImage", { 
                    required: "L'URL de l'image d'aperçu est obligatoire", 
                    minLength: { value: 10, message: "L'URL doit contenir au moins 10 caractères" } 
                  })}
                />
                {errors.previewImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.previewImage.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Ajout d'un effet pour récupérer les catégories depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // En production, remplacer par les appels API réels
        setCategories([]);
        setServices([]);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Modification du service | NionFar.sn">
      <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50/30 to-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                  <span className="bg-indigo-100 p-2 rounded-lg mr-3 text-indigo-600">
                    <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  Modifier votre service
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
                  {hasChanges && (
                    <button
                      type="button"
                      onClick={() => setDiscardModalOpen(true)}
                      className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <FiX className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Annuler</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className={`inline-flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2.5 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Enregistrement...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Enregistrer</span>
                        <span className="sm:hidden">Enreg.</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Status bar */}
              {hasChanges && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-xs sm:text-sm flex items-center">
                  <FiInfo className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <p>Vous avez des modifications non enregistrées.</p>
                </div>
              )}
              
              {saveStatus === 'success' && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-100 rounded-lg text-green-700 text-xs sm:text-sm flex items-center">
                  <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <p>Service mis à jour avec succès.</p>
                </div>
              )}
            </div>
            
            <Tab.Group onChange={(index) => setCurrentStep(index)}>
              <div className="relative border-b border-gray-100 bg-white">
                <div className="overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
                  <Tab.List className="flex whitespace-nowrap pl-2 pr-8 sm:px-6 py-1">
                    {steps.map((step, index) => (
                      <Tab 
                        key={step.id} 
                        className={({ selected }) =>
                          `py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 flex items-center transition-all duration-200 mx-1 sm:mx-2 ${
                            selected 
                              ? 'border-indigo-600 text-indigo-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`
                        }
                      >
                        <div className={`mr-1.5 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          currentStep >= index 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {currentStep > index ? (
                            <FiCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className="hidden xs:inline">{step.name}</span>
                        <span className="xs:hidden">
                          <step.icon className="h-4 w-4" />
                        </span>
                      </Tab>
                    ))}
                  </Tab.List>
                </div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
              </div>
              
              <div className="p-4 sm:p-6 md:p-8">
                <Tab.Panels>
                  <Tab.Panel>
                    <div className="mb-4 sm:mb-6">
                      <h2 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">Informations de base</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Ces informations sont essentielles pour permettre aux clients de découvrir votre service.</p>
                    </div>
                    {renderStepContent()}
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="mb-4 sm:mb-6">
                      <h2 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">Description & Détails</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Décrivez votre service en détail et définissez ses caractéristiques principales.</p>
                    </div>
                    {renderStepContent()}
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="mb-4 sm:mb-6">
                      <h2 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">Tarification</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Définissez comment votre service sera tarifé et les options de forfaits disponibles.</p>
                    </div>
                    {renderStepContent()}
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="mb-4 sm:mb-6">
                      <h2 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">Aperçu & Publication</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Vérifiez à quoi ressemblera votre service pour les clients et choisissez quand le publier.</p>
                    </div>
                    {renderStepContent()}
                  </Tab.Panel>
                </Tab.Panels>
              </div>
              
              <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                <div>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="mb-2 sm:mb-0 w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      <FiChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Précédent
                    </button>
                  )}
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-indigo-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <FiEye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {previewMode ? 'Retour' : 'Aperçu'}
                  </button>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <span>Suivant</span>
                      <FiChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={saveStatus === 'saving'}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer le service'}
                    </button>
                  )}
                </div>
              </div>
            </Tab.Group>
          </form>
        </div>
        
        {/* Discard changes modal */}
        <AnimatePresence>
          {discardModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-4"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-3 sm:mb-4">
                    <FiAlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Annuler les modifications</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Êtes-vous sûr de vouloir annuler toutes vos modifications ? Cette action ne peut pas être annulée.</p>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-center">
                    <button
                      type="button"
                      onClick={() => setDiscardModalOpen(false)}
                      className="inline-flex justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Retour à l'édition
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Oui, annuler tout
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default EditServicePage;