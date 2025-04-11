import React from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';
import PerformanceReport from '../components/PerformanceReport';
import Head from 'next/head';

const PerformanceReportPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Rapport de Performance | NionFar</title>
        <meta name="description" content="Analyse détaillée des performances de votre site" />
      </Head>
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="xl" mb={6}>Analyse des performances</Heading>
        <Box mb={8}>
          <PerformanceReport />
        </Box>
      </Container>
    </>
  );
};

export default PerformanceReportPage; 