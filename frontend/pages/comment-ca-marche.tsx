import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiUsers, FiSearch, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import Layout from '../components/layout/Layout';

const CommentCaMarche: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Comment ça marche | NionFar.sn</title>
        <meta name="description" content="Découvrez comment fonctionne NionFar, la plateforme qui connecte les freelances avec des clients cherchant des services de qualité." />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Comment fonctionne NionFar ?
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Une plateforme simple et efficace pour trouver des services de qualité ou proposer vos compétences
              </p>
            </motion.div>
          </div>
        </section>

        {/* Étapes principales */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Étape 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Trouvez le service idéal</h3>
                <p className="text-gray-600">
                  Parcourez notre catalogue de services ou utilisez notre moteur de recherche pour trouver exactement ce dont vous avez besoin.
                </p>
              </motion.div>

              {/* Étape 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiMessageSquare className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Échangez avec le freelance</h3>
                <p className="text-gray-600">
                  Discutez de votre projet, posez vos questions et assurez-vous que le freelance comprend bien vos besoins.
                </p>
              </motion.div>

              {/* Étape 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiDollarSign className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Commandez et payez en toute sécurité</h3>
                <p className="text-gray-600">
                  Effectuez votre commande et payez en toute sécurité. Vos fonds sont protégés jusqu'à la livraison finale.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Processus détaillé */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Un processus simple et sécurisé</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez en détail comment NionFar facilite vos transactions et protège vos intérêts
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Les avantages de NionFar</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Pourquoi choisir NionFar pour vos projets ?
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {advantage.icon}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                      <p className="text-gray-600">{advantage.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Prêt à commencer ?</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/explorer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
                >
                  Explorer les services
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  href="/devenir-freelance"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800"
                >
                  Devenir freelance
                  <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

const processSteps = [
  {
    title: "Créez votre compte",
    description: "Inscription rapide et gratuite. Choisissez entre un compte client ou freelance selon vos besoins."
  },
  {
    title: "Trouvez le service idéal",
    description: "Parcourez notre catalogue ou utilisez notre moteur de recherche pour trouver le service qui correspond à vos besoins."
  },
  {
    title: "Échangez avec le freelance",
    description: "Utilisez notre système de messagerie intégré pour discuter de votre projet et clarifier vos attentes."
  },
  {
    title: "Commandez et payez",
    description: "Effectuez votre commande et payez en toute sécurité. Vos fonds sont protégés jusqu'à la livraison finale."
  },
  {
    title: "Recevez votre livraison",
    description: "Le freelance vous livre le travail dans les délais convenus. Vous pouvez demander des modifications si nécessaire."
  },
  {
    title: "Validez et évaluez",
    description: "Une fois satisfait, validez la commande et laissez une évaluation. Le paiement est alors libéré au freelance."
  }
];

const advantages = [
  {
    title: "Sécurité des paiements",
    description: "Vos paiements sont protégés par notre système d'escrow. Les fonds ne sont libérés qu'après validation de la commande.",
    icon: <FiCheck className="w-6 h-6 text-primary-600" />
  },
  {
    title: "Freelances vérifiés",
    description: "Tous nos freelances sont vérifiés et évalués par la communauté. Vous pouvez consulter leurs avis et portfolios.",
    icon: <FiUsers className="w-6 h-6 text-primary-600" />
  },
  {
    title: "Support réactif",
    description: "Notre équipe de support est disponible 7j/7 pour vous accompagner et résoudre vos problèmes.",
    icon: <FiMessageSquare className="w-6 h-6 text-primary-600" />
  },
  {
    title: "Prix compétitifs",
    description: "Bénéficiez de tarifs avantageux grâce à la concurrence entre freelances et notre commission raisonnable.",
    icon: <FiDollarSign className="w-6 h-6 text-primary-600" />
  }
];

export default CommentCaMarche; 