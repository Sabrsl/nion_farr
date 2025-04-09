import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

// Page de redirection pour les URLs de service au singulier
const ServiceRedirect = () => {
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (slug) {
      router.replace(`/services/${slug}`);
    }
  }, [slug, router]);

  return null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params || {};
  
  if (typeof slug !== 'string') {
    return {
      redirect: {
        destination: '/services',
        permanent: false,
      },
    };
  }

  // Redirection permanente pour les moteurs de recherche
  return {
    redirect: {
      destination: `/services/${slug}`,
      permanent: true, // Permanent (301) pour les moteurs de recherche
    },
  };
};

export default ServiceRedirect; 