import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, Organization } from '@containerly/db';
import { LoginDto, SignupDto, AuthResponse, UserRole } from '@containerly/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // Create organization
    const organization = this.organizationRepository.create({
      name: signupDto.organizationName,
    });
    const savedOrganization = await this.organizationRepository.save(organization);

    // Create user with ORG_ADMIN role
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = this.userRepository.create({
      email: signupDto.email,
      password: hashedPassword,
      orgId: savedOrganization.id,
      role: UserRole.ORG_ADMIN,
    });

    const savedUser = await this.userRepository.save(user);
    const token = this.jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
      orgId: savedUser.orgId,
      role: savedUser.role,
    });

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        orgId: savedUser.orgId,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      organization: {
        id: savedOrganization.id,
        name: savedOrganization.name,
        createdAt: savedOrganization.createdAt,
        updatedAt: savedOrganization.updatedAt,
      },
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        createdAt: user.organization.createdAt,
        updatedAt: user.organization.updatedAt,
      },
      token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });
  }
}

