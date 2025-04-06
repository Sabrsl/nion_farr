import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection('users');

  // GET - Récupérer tous les utilisateurs
  if (req.method === 'GET') {
    try {
      const users = await usersCollection
        .find({})
        .project({ password: 0 }) // Exclure le mot de passe
        .toArray();
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  }
  
  // POST - Créer un nouvel utilisateur
  if (req.method === 'POST') {
    try {
      const { firstName, lastName, email, password, username, role = 'client', phone } = req.body;
      
      // Vérifier que les champs requis sont présents
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Informations incomplètes' });
      }
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Un utilisateur avec cette adresse email existe déjà' });
      }
      
      // Vérifier si le nom d'utilisateur existe déjà (s'il est fourni)
      if (username) {
        const existingUsername = await usersCollection.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
        }
      }
      
      // Hacher le mot de passe
      const hashedPassword = await hash(password, 10);
      
      // Préparer l'utilisateur à insérer
      const user = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        username,
        role,
        status: 'pending_verification',
        phone,
        isEmailVerified: false,
        isPhoneVerified: false,
        isIdentityVerified: false,
        memberSince: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Insérer l'utilisateur
      const result = await usersCollection.insertOne(user);
      
      // Retourner l'utilisateur créé sans le mot de passe
      const createdUser = { ...user, _id: result.insertedId, password: undefined };
      
      return res.status(201).json(createdUser);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
  }
  
  // Méthode non autorisée
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 