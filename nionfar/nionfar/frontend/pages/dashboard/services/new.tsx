import { NextPage } from 'next';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
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
  FiAlertTriangle
} from 'react-icons/fi/index.js';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Dropzone } from '../../../components/ui/Dropzone';
import { Switch } from '@headlessui/react';
import { RadioGroup } from '@headlessui/react';
import { Combobox } from '@headlessui/react';
import { Stepper } from '../../../components/ui/Stepper';
import { categories } from '../../../data/mockData';
import { Category } from '../../../types';
import { ServicePreview } from '../../../components/dashboard/services/ServicePreview';
import serviceValidationService from '../../../services/serviceValidationService';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import useSWR from 'swr';

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

const CreateServicePage: NextPage = () => {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { user } = useAuth();
  const [validationErrors, setValidationErrors] = useState<{field: string, message: string}[]>([]);
  const [requiresModeration, setRequiresModeration] = useState(false);
  const [moderationReasons, setModerationReasons] = useState<string[]>([]);
  
  // Récupérer la liste des services existants pour la validation
  const { data: existingServices } = useSWR('/api/services', async () => {
    // Simulation de données pour la démonstration
    // En production, remplacer par un appel API réel
    await new Promise(resolve => setTimeout(resolve, 500));
    return []; // Remplacer par les données réelles en production
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty, isValid } } = useForm<FormValues>({
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

  // Filtrer les catégories pour la recherche
  const filteredCategories = categoryQuery === ''
    ? categories
    : categories.filter((category: Category) =>
        category.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(categoryQuery.toLowerCase().replace(/\s+/g, ''))
      );

  // Gérer l'ajout de tags
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setValue('tags', [...tags, tagInput]);
      setTagInput('');
    }
  };

  // Gérer la suppression de tags
  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  // Gérer l'upload d'images
  const handleImageDrop = useCallback((acceptedFiles: File[]) => {
    // Créer des URLs pour l'aperçu
    const urls = acceptedFiles.map(file => URL.createObjectURL(file));
    setImageUrls(prevUrls => [...prevUrls, ...urls]);
    setImageFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    setValue('images', [...watchedImages, ...acceptedFiles]);
  }, [setValue, watchedImages]);

  // Supprimer une image
  const handleRemoveImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newImageUrls = [...imageUrls];
    
    // Libérer l'URL pour éviter les fuites de mémoire
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImageFiles.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImageUrls(newImageUrls);
    setValue('images', newImageFiles);
  };

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (data: FormValues) => {
    try {
      setSaveStatus('saving');
      setValidationErrors([]);
      
      // Vérifier si l'utilisateur est connecté
      if (!user) {
        toast.error('Vous devez être connecté pour créer un service');
        setSaveStatus('error');
        return;
      }
      
      // Valider le service
      const validationResult = await serviceValidationService.validateService(
        {
          id: '',
          title: data.title,
          description: data.description,
          price: data.price,
          isActive: data.isActive,
          provider: user,
          createdAt: new Date().toISOString(),
          slug: '',
          deliveryTime: data.deliveryTime,
        },
        existingServices || [],
        user,
        false // Nouvelle création
      );
      
      // Gérer les erreurs de validation
      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
        validationResult.errors.forEach(error => {
          toast.error(error.message);
        });
        setSaveStatus('error');
        return;
      }
      
      // Vérifier si le service nécessite une modération
      if (validationResult.requiresModeration) {
        setRequiresModeration(true);
        setModerationReasons(validationResult.moderationReasons);
        toast.warning('Votre service nécessite une modération manuelle et sera examiné par notre équipe avant publication.');
      }
      
      // Simuler l'envoi des données au serveur
      console.log('Envoi des données:', data);
      
      // Créer le service - simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSaveStatus('success');
      
      // Rediriger vers la liste des services après 1 seconde
      setTimeout(() => {
        router.push('/dashboard/services');
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de la création du service:', error);
      setSaveStatus('error');
      toast.error('Une erreur est survenue lors de la création du service');
    }
  };

  // Étapes du formulaire
  const steps = [
    { id: 'info', name: 'Informations de base', icon: FiImage },
    { id: 'details', name: 'Description & Détails', icon: FiTag },
    { id: 'pricing', name: 'Tarification', icon: FiDollarSign },
    { id: 'preview', name: 'Aperçu & Publication', icon: FiEye }
  ];

  // Utilisez cette fonction pour la section de l'éditeur
  const renderEditor = (field: any) => {
    return (
      <div>
        <textarea
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
          rows={10}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          placeholder="Décrivez en détail ce que vous offrez, vos compétences, votre processus de travail, etc."
        />
      </div>
    );
  };

  // Remplacer l'utilisation du composant Dropzone par une solution plus simple
  const renderDropzone = () => {
    return (
      <div className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'}`}>
        <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
          <FiUploadCloud className="w-10 h-10 text-gray-400" />
          <div className="text-sm text-gray-500">
            <p className="font-medium">Cliquez pour sélectionner des images</p>
            <p>PNG, JPG, WEBP jusqu'à 5Mo (max 5 images)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                handleImageDrop(files);
              }
            }}
          />
        </label>
      </div>
    );
  };

  // Vérifier si le titre contient des informations de contact
  const checkDirectContact = async (description: string) => {
    if (!description) return;
    
    const result = await serviceValidationService.validateNoDirectContact(description);
    if (!result.isValid) {
      toast.error(result.message);
    }
  };
  
  // Fonction pour afficher une erreur de validation spécifique
  const getValidationError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  // Ajouter une vérification en temps réel de la description
  useEffect(() => {
    const description = watch('description');
    const subscription = watch((value, { name }) => {
      if (name === 'description' && value.description) {
        checkDirectContact(value.description);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);

  // Dans le composant - ajouter un composant d'affichage pour la modération
  const renderModerationWarning = () => {
    if (!requiresModeration) return null;
    
    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Ce service nécessite une modération manuelle
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Votre service sera examiné par notre équipe avant d'être publié. Cela peut prendre jusqu'à 24 heures.
              </p>
              {moderationReasons.length > 0 && (
                <ul className="list-disc pl-5 mt-2">
                  {moderationReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Contenu des étapes
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
              {/* Titre du service */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du service <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ex: Création de logo professionnel pour votre entreprise"
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("title", { required: "Le titre est obligatoire", minLength: { value: 10, message: "Le titre doit contenir au moins 10 caractères" } })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Un titre accrocheur et précis augmente vos chances d'être trouvé.
                </p>
              </div>

              {/* Catégorie - adapté responsive */}
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
                            className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border ${errors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm sm:text-base`}
                            displayValue={(categoryId: string) => 
                              categories.find((category: Category) => category.id === categoryId)?.name || ""
                            }
                            onChange={(event) => setCategoryQuery(event.target.value)}
                            placeholder="Sélectionnez une catégorie"
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg
                              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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

              {/* Résumé du service - adapté responsive */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                  Résumé <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="summary"
                  rows={3}
                  placeholder="Décrivez votre service en quelques phrases"
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border ${errors.summary ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  {...register("summary", { required: "Le résumé est obligatoire", maxLength: { value: 250, message: "Le résumé ne doit pas dépasser 250 caractères" } })}
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

              {/* Images du service - adapté responsive */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images du service <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="images"
                  control={control}
                  rules={{ 
                    required: "Au moins une image est requise",
                    validate: {
                      minImages: (files) => files.length > 0 || "Veuillez ajouter au moins une image",
                      maxImages: (files) => files.length <= 5 || "Maximum 5 images autorisées"
                    }
                  }}
                  render={({ field }) => renderDropzone()}
                />
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
                )}

                {/* Prévisualisation des images - adapté responsive */}
                {imageUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Images ({imageUrls.length}/5)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-1 sm:p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                              Principale
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              {/* Description complète */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ 
                    required: "La description est obligatoire",
                    minLength: { value: 100, message: "La description doit contenir au moins 100 caractères" }
                  }}
                  render={({ field }) => renderEditor(field)}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Décrivez en détail ce que vous offrez, vos compétences, votre processus de travail, etc.
                </p>
              </div>

              {/* Tags - adapté responsive */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (mots-clés)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ajouter un tag (appuyez sur Entrée)"
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-l-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 sm:px-4 sm:py-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-colors"
                  >
                    <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Les tags aident à mieux référencer votre service (max. 10 tags)
                </p>

                {/* Affichage des tags - adapté responsive */}
                {tags && tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-indigo-100 text-indigo-800"
                      >
                        <span className="mr-1">{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Délai de livraison - adapté responsive */}
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Délai de livraison (en jours) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="deliveryTime"
                  control={control}
                  rules={{ required: "Le délai est obligatoire" }}
                  render={({ field }) => (
                    <RadioGroup value={field.value} onChange={field.onChange}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {[1, 2, 3, 5, 7, 14, 21, 30, 45, 60].map((days) => (
                          <RadioGroup.Option
                            key={days}
                            value={days}
                            className={({ active, checked }) =>
                              `relative flex cursor-pointer rounded-lg px-2 sm:px-5 py-2 sm:py-3 shadow-sm focus:outline-none
                              ${
                                checked 
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                              }`
                            }
                          >
                            {({ active, checked }) => (
                              <div className="flex w-full items-center justify-center">
                                <div className="text-xs sm:text-sm font-medium">
                                  {days} {days === 1 ? 'jour' : 'jours'}
                                </div>
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Nombre de révisions - adapté responsive */}
              <div>
                <label htmlFor="revisions" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de révisions <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="revisions"
                  control={control}
                  rules={{ required: "Le nombre de révisions est obligatoire" }}
                  render={({ field }) => (
                    <RadioGroup value={field.value} onChange={field.onChange}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'illimitées'].map((revision) => (
                          <RadioGroup.Option
                            key={revision.toString()}
                            value={revision === 'illimitées' ? 999 : revision}
                            className={({ active, checked }) =>
                              `relative flex cursor-pointer rounded-lg px-2 sm:px-5 py-2 sm:py-3 shadow-sm focus:outline-none
                              ${
                                checked 
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                              }`
                            }
                          >
                            {({ active, checked }) => (
                              <div className="flex w-full items-center justify-center">
                                <div className="text-xs sm:text-sm font-medium">
                                  {revision === 'illimitées' ? 'Illimitées' : revision}
                                </div>
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                />
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
              {/* Options de tarification */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900">Modèle de tarification</h3>
                  <Controller
                    name="hasPackages"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onChange={onChange}
                        className={`${
                          value ? 'bg-indigo-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-lg border ${hasPackages ? 'border-gray-300 bg-gray-100 opacity-50' : 'border-indigo-300 bg-indigo-50'} p-4`}>
                    <h4 className="text-sm font-medium mb-2">Prix unique</h4>
                    <p className="text-xs text-gray-500 mb-3">Proposez un service avec un prix fixe et une seule offre.</p>
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700">5 000 FCFA</span>
                    </div>
                  </div>
                  <div className={`rounded-lg border ${hasPackages ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-gray-100 opacity-50'} p-4`}>
                    <h4 className="text-sm font-medium mb-2">Forfaits (packages)</h4>
                    <p className="text-xs text-gray-500 mb-3">Proposez différents niveaux de service avec des options et prix variables.</p>
                    <div className="flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700">Basique / Standard / Premium</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarification unique */}
              {!hasPackages && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      min={500}
                      step={500}
                      className="block w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                      placeholder="0"
                      {...register("price", { 
                        required: "Le prix est obligatoire",
                        min: { value: 500, message: "Le prix minimum est de 500 FCFA" }
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">FCFA</span>
                    </div>
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              )}

              {/* Tarification par packages */}
              {hasPackages && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Package Basic */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-base font-medium text-gray-900">Basique</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Titre du package */}
                        <div>
                          <label htmlFor="packageBasicTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            Titre
                          </label>
                          <input
                            id="packageBasicTitle"
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.basic.title")}
                          />
                        </div>

                        {/* Description du package */}
                        <div>
                          <label htmlFor="packageBasicDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="packageBasicDescription"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.basic.description")}
                          ></textarea>
                        </div>

                        {/* Prix du package */}
                        <div>
                          <label htmlFor="packageBasicPrice" className="block text-sm font-medium text-gray-700 mb-1">
                            Prix
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type="number"
                              id="packageBasicPrice"
                              min={500}
                              step={500}
                              className="block w-full pl-3 pr-12 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                              {...register("packageOptions.basic.price")}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">FCFA</span>
                            </div>
                          </div>
                        </div>

                        {/* Délai de livraison */}
                        <div>
                          <label htmlFor="packageBasicDeliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Délai (jours)
                          </label>
                          <input
                            type="number"
                            id="packageBasicDeliveryTime"
                            min={1}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.basic.deliveryTime")}
                          />
                        </div>

                        {/* Nombre de révisions */}
                        <div>
                          <label htmlFor="packageBasicRevisions" className="block text-sm font-medium text-gray-700 mb-1">
                            Révisions
                          </label>
                          <input
                            type="number"
                            id="packageBasicRevisions"
                            min={0}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.basic.revisions")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Package Standard */}
                    <div className="bg-white rounded-xl border border-indigo-300 shadow-md overflow-hidden relative">
                      <div className="absolute top-0 inset-x-0">
                        <div className="h-1 w-full bg-indigo-600"></div>
                      </div>
                      <div className="p-4 bg-indigo-50 border-b border-indigo-200">
                        <h3 className="text-base font-medium text-indigo-900">Standard</h3>
                        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                          Recommandé
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Titre du package */}
                        <div>
                          <label htmlFor="packageStandardTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            Titre
                          </label>
                          <input
                            id="packageStandardTitle"
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.standard.title")}
                          />
                        </div>

                        {/* Description du package */}
                        <div>
                          <label htmlFor="packageStandardDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="packageStandardDescription"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.standard.description")}
                          ></textarea>
                        </div>

                        {/* Prix du package */}
                        <div>
                          <label htmlFor="packageStandardPrice" className="block text-sm font-medium text-gray-700 mb-1">
                            Prix
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type="number"
                              id="packageStandardPrice"
                              min={500}
                              step={500}
                              className="block w-full pl-3 pr-12 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                              {...register("packageOptions.standard.price")}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">FCFA</span>
                            </div>
                          </div>
                        </div>

                        {/* Délai de livraison */}
                        <div>
                          <label htmlFor="packageStandardDeliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Délai (jours)
                          </label>
                          <input
                            type="number"
                            id="packageStandardDeliveryTime"
                            min={1}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.standard.deliveryTime")}
                          />
                        </div>

                        {/* Nombre de révisions */}
                        <div>
                          <label htmlFor="packageStandardRevisions" className="block text-sm font-medium text-gray-700 mb-1">
                            Révisions
                          </label>
                          <input
                            type="number"
                            id="packageStandardRevisions"
                            min={0}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.standard.revisions")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Package Premium */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-base font-medium text-gray-900">Premium</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Titre du package */}
                        <div>
                          <label htmlFor="packagePremiumTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            Titre
                          </label>
                          <input
                            id="packagePremiumTitle"
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.premium.title")}
                          />
                        </div>

                        {/* Description du package */}
                        <div>
                          <label htmlFor="packagePremiumDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="packagePremiumDescription"
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.premium.description")}
                          ></textarea>
                        </div>

                        {/* Prix du package */}
                        <div>
                          <label htmlFor="packagePremiumPrice" className="block text-sm font-medium text-gray-700 mb-1">
                            Prix
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type="number"
                              id="packagePremiumPrice"
                              min={500}
                              step={500}
                              className="block w-full pl-3 pr-12 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                              {...register("packageOptions.premium.price")}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">FCFA</span>
                            </div>
                          </div>
                        </div>

                        {/* Délai de livraison */}
                        <div>
                          <label htmlFor="packagePremiumDeliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Délai (jours)
                          </label>
                          <input
                            type="number"
                            id="packagePremiumDeliveryTime"
                            min={1}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.premium.deliveryTime")}
                          />
                        </div>

                        {/* Nombre de révisions */}
                        <div>
                          <label htmlFor="packagePremiumRevisions" className="block text-sm font-medium text-gray-700 mb-1">
                            Révisions
                          </label>
                          <input
                            type="number"
                            id="packagePremiumRevisions"
                            min={0}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors text-sm"
                            {...register("packageOptions.premium.revisions")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Publication */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Disponibilité du service</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Activez ou désactivez la visibilité de votre service
                    </p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onChange={onChange}
                        className={`${
                          value ? 'bg-green-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    )}
                  />
                </div>
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
              {/* Prévisualisation */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  {previewMode ? (
                    <>
                      <FiX className="mr-2 h-4 w-4" />
                      Fermer l'aperçu
                    </>
                  ) : (
                    <>
                      <FiEye className="mr-2 h-4 w-4" />
                      Voir l'aperçu
                    </>
                  )}
                </button>
              </div>

              {previewMode ? (
                <ServicePreview
                  formData={watch()}
                  imageUrls={imageUrls}
                  selectedCategory={selectedCategory}
                />
              ) : (
                <>
                  {/* Résumé des informations */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-base font-medium text-gray-900">Résumé du service</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Titre</h4>
                          <p className="text-sm text-gray-900">{watch('title') || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Catégorie</h4>
                          <p className="text-sm text-gray-900">{selectedCategory?.name || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Prix</h4>
                          <p className="text-sm text-gray-900">
                            {hasPackages 
                              ? `Packages: ${watch('packageOptions.basic.price')} / ${watch('packageOptions.standard.price')} / ${watch('packageOptions.premium.price')} FCFA`
                              : `${watch('price')} FCFA`
                            }
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Délai de livraison</h4>
                          <p className="text-sm text-gray-900">
                            {hasPackages 
                              ? `Varie selon le package (${watch('packageOptions.basic.deliveryTime')} - ${watch('packageOptions.premium.deliveryTime')} jours)`
                              : `${watch('deliveryTime')} jours`
                            }
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Révisions</h4>
                          <p className="text-sm text-gray-900">
                            {hasPackages 
                              ? `Varie selon le package (${watch('packageOptions.basic.revisions')} - ${watch('packageOptions.premium.revisions') === 999 ? 'illimitées' : watch('packageOptions.premium.revisions')})`
                              : `${watch('revisions') === 999 ? 'Illimitées' : watch('revisions')}`
                            }
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Statut</h4>
                          <p className="text-sm text-gray-900">
                            {watch('isActive') 
                              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                  Actif
                                </span>
                              : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactif
                                </span>
                            }
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Résumé</h4>
                        <p className="text-sm text-gray-900">{watch('summary') || 'Non renseigné'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Tags</h4>
                        {tags && tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Aucun tag ajouté</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Images</h4>
                        {imageUrls.length > 0 ? (
                          <div className="flex overflow-x-auto py-2 gap-2">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="flex-shrink-0 relative">
                                <div className="h-20 w-20 rounded-md overflow-hidden">
                                  <img 
                                    src={url} 
                                    alt={`Preview ${index + 1}`} 
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                {index === 0 && (
                                  <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-br-md">
                                    Principal
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Aucune image ajoutée</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vérification finale */}
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiAlertCircle className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Avant de publier</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Vérifiez que toutes les informations sont correctes</li>
                            <li>Assurez-vous que vos images sont de bonne qualité</li>
                            <li>Vérifiez votre orthographe et la clarté de vos descriptions</li>
                            <li>Confirmez que vos tarifs sont bien définis</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bouton de soumission */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className={`
                    inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm
                    ${isValid
                      ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    }
                  `}
                  disabled={!isValid || saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <FiCheckCircle className="mr-2 h-5 w-5" />
                      Service créé avec succès
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 h-5 w-5" />
                      Créer le service
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="finalize"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Finaliser et publier</h2>
              
              {renderModerationWarning()}
              
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Veuillez corriger les erreurs suivantes
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Prévisualisation du service */}
              <div className="mb-6">
                <ServicePreview
                  formData={watch()}
                  imageUrls={imageUrls}
                  selectedCategory={selectedCategory}
                />
              </div>
              
              {/* Publication */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Activer le service</h3>
                    <p className="text-sm text-gray-500">
                      Les services actifs sont visibles par tous les utilisateurs
                    </p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        className={`${
                          field.value ? 'bg-indigo-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span className="sr-only">Activer le service</span>
                        <span
                          className={`${
                            field.value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </Switch>
                    )}
                  />
                </div>
                
                {/* Bouton de soumission */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className={`
                      inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm
                      ${isValid
                        ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                      }
                    `}
                    disabled={!isValid || saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </>
                    ) : saveStatus === 'success' ? (
                      <>
                        <FiCheckCircle className="mr-2 h-5 w-5" />
                        Service créé avec succès
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-5 w-5" />
                        Créer le service
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Créer un service | NionFar.sn">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50/50">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-3 sm:mr-4 p-1.5 sm:p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Créer un service</h1>
            </div>
            <div>
              <Link href="/dashboard/services" className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Annuler
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Form stepper - hidden on small mobile screens */}
        <div className="hidden sm:block mb-6 sm:mb-8">
          <Stepper 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={(index) => setCurrentStep(index)}
          />
        </div>

        {/* Mobile stepper alternative */}
        <div className="sm:hidden mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-indigo-600">Étape {currentStep + 1}/{steps.length}</span>
            <span className="ml-2 text-sm text-gray-500">{steps[currentStep].name}</span>
          </div>
          <div className="flex space-x-1">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`}
                onClick={() => setCurrentStep(idx)}
              ></div>
            ))}
          </div>
        </div>

        {/* Form container */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            {/* Navigation buttons */}
            {currentStep !== steps.length - 1 && (
              <div className="mt-6 sm:mt-8 flex justify-between sm:justify-end">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="mr-2 sm:mr-3 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiChevronLeft className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Précédent
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Suivant
                  <FiChevronRight className="-mr-1 ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}
            
            {/* Submit button for last step */}
            {currentStep === steps.length - 1 && (
              <div className="mt-6 sm:mt-8">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={!isValid || saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 h-5 w-5" />
                      Publier le service
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateServicePage;