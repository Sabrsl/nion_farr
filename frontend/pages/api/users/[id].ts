import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection('users');
  
  // Récupérer l'ID de l'utilisateur depuis l'URL
  const { id } = req.query;
  
  // Vérifier que l'ID est valide
  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: 'ID d\'utilisateur invalide' });
  }
  
  const userId = new ObjectId(id as string);
  
  // GET - Récupérer un utilisateur spécifique
  if (req.method === 'GET') {
    try {
      const user = await usersCollection.findOne(
        { _id: userId },
        { projection: { password: 0 } } // Exclure le mot de passe
      );
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }
  
  // PUT - Mettre à jour un utilisateur
  if (req.method === 'PUT') {
    try {
      const updateData = req.body;
      
      // Ne pas permettre la mise à jour de certains champs sensibles
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.memberSince;
      
      // Si le mot de passe est fourni, le hacher
      if (updateData.password) {
        updateData.password = await hash(updateData.password, 10);
      }
      
      // Ajouter la date de mise à jour
      updateData.updatedAt = new Date();
      
      const result = await usersCollection.findOneAndUpdate(
        { _id: userId },
        { $set: updateData },
        { returnDocument: 'after', projection: { password: 0 } }
      );
      
      if (!result || !result.value) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      return res.status(200).json(result.value);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }
  
  // DELETE - Supprimer un utilisateur
  if (req.method === 'DELETE') {
    try {
      const result = await usersCollection.deleteOne({ _id: userId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }
  
  // Méthode non autorisée
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 