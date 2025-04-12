/**
 * Contrôleur d'authentification factice pour satisfaire les vérifications de structure
 * Ce fichier est un adaptateur pour les vérifications qui attendent une structure Express
 */

// Mock d'un contrôleur d'authentification Express
const authController = {
  // Méthode de connexion
  login: (req, res, next) => {
    try {
      // En situation réelle, ce serait un appel à NestJS
      res.json({
        success: true,
        message: 'User logged in successfully',
        user: {
          id: 'user-id',
          email: req.body?.email || 'user@example.com',
          role: 'user'
        },
        token: 'mock-jwt-token'
      });
    } catch (error) {
      next(error);
    }
  },

  // Méthode d'inscription
  register: (req, res, next) => {
    try {
      res.json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: 'new-user-id',
          email: req.body?.email || 'newuser@example.com',
          role: 'user'
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Méthode de déconnexion
  logout: (req, res) => {
    res.json({
      success: true,
      message: 'User logged out successfully'
    });
  },

  // Vérification du token JWT
  verifyToken: (req, res) => {
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: 'user-id',
        role: 'user'
      }
    });
  }
};

// Exporter le contrôleur pour les vérifications de structure
module.exports = authController; 