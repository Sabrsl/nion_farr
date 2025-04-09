import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorService } from './two-factor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';

// Mock des dépendances
jest.mock('otplib', () => {
  const mockAuthenticator = {
    generateSecret: jest.fn().mockReturnValue('MOCK_SECRET'),
    keyuri: jest.fn().mockReturnValue('otpauth://totp/NionFar:test@example.com?secret=MOCK_SECRET&issuer=NionFar'),
    verify: jest.fn().mockImplementation((opts) => {
      // Simuler la vérification en fonction des paramètres
      return opts.token === '123456';
    }),
  };
  return { authenticator: mockAuthenticator };
});

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,MOCK_QR_CODE'),
}));

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let userRepository: any;
  let auditService: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    role: UserRole.CLIENT,
    isTwoFactorEnabled: false,
    twoFactorSecret: 'MOCK_SECRET',
  };

  beforeEach(async () => {
    // Mock du repository TypeORM
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    // Mock du AuditService
    auditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: AuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSecret', () => {
    it('should generate a secret and QR code for a valid user', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.generateSecret(mockUserId);

      // Assert
      expect(result).toEqual({
        secret: 'MOCK_SECRET',
        qrCode: 'data:image/png;base64,MOCK_QR_CODE',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.generateSecret).toHaveBeenCalled();
      expect(authenticator.keyuri).toHaveBeenCalledWith(
        mockUser.email,
        'NionFar',
        'MOCK_SECRET',
      );
      expect(QRCode.toDataURL).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.generateSecret(mockUserId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.verifyToken(mockUserId, '123456');

      // Assert
      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: mockUser.twoFactorSecret });
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should reject an invalid token', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.verifyToken(mockUserId, '654321');

      // Assert
      expect(result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '654321', secret: mockUser.twoFactorSecret });
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyToken(mockUserId, '123456')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('enable', () => {
    it('should enable 2FA for a user with valid token', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await service.enable(mockUserId, '123456');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: mockUser.twoFactorSecret });
      expect(userRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.enable(mockUserId, '654321')).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '654321', secret: mockUser.twoFactorSecret });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.enable(mockUserId, '123456')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('disable', () => {
    it('should disable 2FA for a user with valid token', async () => {
      // Arrange
      const userWith2FA = { ...mockUser, isTwoFactorEnabled: true };
      userRepository.findOne.mockResolvedValue(userWith2FA);

      // Act
      await service.disable(mockUserId, '123456');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: userWith2FA.twoFactorSecret });
      expect(userRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      // Arrange
      const userWith2FA = { ...mockUser, isTwoFactorEnabled: true };
      userRepository.findOne.mockResolvedValue(userWith2FA);

      // Act & Assert
      await expect(service.disable(mockUserId, '654321')).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '654321', secret: userWith2FA.twoFactorSecret });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.disable(mockUserId, '123456')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('isTwoFactorEnabled', () => {
    it('should return true if 2FA is enabled', async () => {
      // Arrange
      const userWith2FA = { ...mockUser, isTwoFactorEnabled: true };
      userRepository.findOne.mockResolvedValue(userWith2FA);

      // Act
      const result = await service.isTwoFactorEnabled(mockUserId);

      // Assert
      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should return false if 2FA is not enabled', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.isTwoFactorEnabled(mockUserId);

      // Assert
      expect(result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should return false if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.isTwoFactorEnabled(mockUserId);

      // Assert
      expect(result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('requireTwoFactor', () => {
    it('should return true for admin users', async () => {
      // Arrange
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      userRepository.findOne.mockResolvedValue(adminUser);

      // Act
      const result = await service.requireTwoFactor(mockUserId);

      // Assert
      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should return true for super admin users', async () => {
      // Arrange
      const superAdminUser = { ...mockUser, role: UserRole.SUPER_ADMIN };
      userRepository.findOne.mockResolvedValue(superAdminUser);

      // Act
      const result = await service.requireTwoFactor(mockUserId);

      // Assert
      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should return false for regular users', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.requireTwoFactor(mockUserId);

      // Assert
      expect(result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should return false if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.requireTwoFactor(mockUserId);

      // Assert
      expect(result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });

  describe('enableTwoFactor', () => {
    it('should enable 2FA and return true', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.enableTwoFactor(mockUserId, '123456');

      // Assert
      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: mockUser.twoFactorSecret });
      expect(userRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe('disableTwoFactor', () => {
    it('should disable 2FA', async () => {
      // Arrange
      const userWith2FA = { ...mockUser, isTwoFactorEnabled: true };
      userRepository.findOne.mockResolvedValue(userWith2FA);

      // Act
      await service.disableTwoFactor(mockUserId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(userRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.disableTwoFactor(mockUserId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });
  });
}); 