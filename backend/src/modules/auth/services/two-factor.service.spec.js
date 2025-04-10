"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const two_factor_service_1 = require("./two-factor.service");
const typeorm_1 = require("@nestjs/typeorm");
const audit_service_1 = require("./audit.service");
const common_1 = require("@nestjs/common");
const otplib_1 = require("otplib");
const QRCode = __importStar(require("qrcode"));
const user_entity_1 = require("../../users/entities/user.entity");
const user_role_enum_1 = require("../../users/enums/user-role.enum");
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
    let service;
    let userRepository;
    let auditService;
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        role: user_role_enum_1.UserRole.CLIENT,
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                two_factor_service_1.TwoFactorService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: userRepository,
                },
                {
                    provide: audit_service_1.AuditService,
                    useValue: auditService,
                },
            ],
        }).compile();
        service = module.get(two_factor_service_1.TwoFactorService);
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
            expect(otplib_1.authenticator.generateSecret).toHaveBeenCalled();
            expect(otplib_1.authenticator.keyuri).toHaveBeenCalledWith(mockUser.email, 'NionFar', 'MOCK_SECRET');
            expect(QRCode.toDataURL).toHaveBeenCalled();
            expect(auditService.log).toHaveBeenCalled();
            expect(userRepository.save).toHaveBeenCalled();
        });
        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);
            // Act & Assert
            await expect(service.generateSecret(mockUserId)).rejects.toThrow(common_1.NotFoundException);
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
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: mockUser.twoFactorSecret });
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
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '654321', secret: mockUser.twoFactorSecret });
            expect(auditService.log).toHaveBeenCalled();
        });
        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);
            // Act & Assert
            await expect(service.verifyToken(mockUserId, '123456')).rejects.toThrow(common_1.NotFoundException);
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
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: mockUser.twoFactorSecret });
            expect(userRepository.save).toHaveBeenCalled();
            expect(auditService.log).toHaveBeenCalled();
        });
        it('should throw UnauthorizedException for invalid token', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);
            // Act & Assert
            await expect(service.enable(mockUserId, '654321')).rejects.toThrow(common_1.UnauthorizedException);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '654321', secret: mockUser.twoFactorSecret });
        });
        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);
            // Act & Assert
            await expect(service.enable(mockUserId, '123456')).rejects.toThrow(common_1.NotFoundException);
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
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: userWith2FA.twoFactorSecret });
            expect(userRepository.save).toHaveBeenCalled();
            expect(auditService.log).toHaveBeenCalled();
        });
        it('should throw UnauthorizedException for invalid token', async () => {
            // Arrange
            const userWith2FA = { ...mockUser, isTwoFactorEnabled: true };
            userRepository.findOne.mockResolvedValue(userWith2FA);
            // Act & Assert
            await expect(service.disable(mockUserId, '654321')).rejects.toThrow(common_1.UnauthorizedException);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '654321', secret: userWith2FA.twoFactorSecret });
        });
        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);
            // Act & Assert
            await expect(service.disable(mockUserId, '123456')).rejects.toThrow(common_1.NotFoundException);
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
            const adminUser = { ...mockUser, role: user_role_enum_1.UserRole.ADMIN };
            userRepository.findOne.mockResolvedValue(adminUser);
            // Act
            const result = await service.requireTwoFactor(mockUserId);
            // Assert
            expect(result).toBe(true);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
        });
        it('should return true for super admin users', async () => {
            // Arrange
            const superAdminUser = { ...mockUser, role: user_role_enum_1.UserRole.SUPER_ADMIN };
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
            expect(otplib_1.authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: mockUser.twoFactorSecret });
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
            await expect(service.disableTwoFactor(mockUserId)).rejects.toThrow(common_1.NotFoundException);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUserId } });
        });
    });
});
