import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;

    const authServiceMock = {
        register: jest.fn(),
    };

    beforeEach(async () => {
        authServiceMock.register.mockReset();

        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: authServiceMock }],
        }).compile();

        controller = module.get(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call authService.register', async () => {
        authServiceMock.register.mockResolvedValue({
            id: 'uuid-1',
            email: 'test@test.com',
            role: 'USER',
            createdAt: new Date(),
        });

        const result = await controller.register({
            email: 'test@test.com',
            password: '123456',
        });

        expect(authServiceMock.register).toHaveBeenCalledTimes(1);
        expect(authServiceMock.register).toHaveBeenCalledWith({
            email: 'test@test.com',
            password: '123456',
        });

        expect(result).toHaveProperty('id');
        expect(result.email).toBe('test@test.com');
    });
});
