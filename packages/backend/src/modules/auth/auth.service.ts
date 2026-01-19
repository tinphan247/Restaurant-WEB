import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Generate a secure random token for email verification
   */
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Calculate token expiration (24 hours from now)
   */
  private getTokenExpiration(): Date {
    const expirationHours = this.configService.get<number>(
      'EMAIL_VERIFICATION_EXPIRES_IN',
      24,
    );
    return new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  }

  /**
   * Register a new user with email verification
   */
  async signup(data: { name: string; email: string; password: string }) {
    // Check if user already exists
    const existingUser = await this.userService.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpires = this.getTokenExpiration();

    // Create user (not verified)
    const user = await this.userService.create({
      ...data,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      // Send verification email
      const verificationLink = this.generateVerificationLink(verificationToken);
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationLink,
      );

      this.logger.log(
        `Signup successful for ${user.email}. Verification email sent.`,
      );

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      // If email sending fails, delete the user
      await this.userService.delete(user.id);
      this.logger.error(`Failed to send verification email for ${user.email}`, error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    // Find user with this token
    const user = await this.userService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token is still valid
    if (
      user.verificationTokenExpires &&
      new Date(user.verificationTokenExpires) < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark user as verified and clear the token
    await this.userService.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined,
    });

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${user.email}`, error);
    }

    this.logger.log(`Email verified successfully for ${user.email}`);

    return {
      message: 'Email verified successfully! Your account is now active.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: true,
      },
    };
  }

  /**
   * Login with email verification check
   */
  async login(data: { email: string; password: string }) {
    const user = await this.userService.findOneByEmail(data.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Check your inbox for the verification link.',
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Legacy register method (for backward compatibility)
   */
  async register(data: { name: string; email: string; password: string }) {
    return this.signup(data);
  }

  /**
   * Generate verification link
   */
  private generateVerificationLink(token: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    return `${frontendUrl}/api/auth/verify-email?token=${token}`;
  }

  /**
   * Generate reset password link
   */
  private generateResetPasswordLink(token: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    return `${frontendUrl}/reset-password?token=${token}`;
  }

  /**
   * Get reset password token expiration (15 minutes from now)
   */
  private getResetPasswordTokenExpiration(): Date {
    const expirationMinutes = this.configService.get<number>(
      'RESET_PASSWORD_EXPIRES_IN',
      15,
    );
    return new Date(Date.now() + expirationMinutes * 60 * 1000);
  }

  /**
   * Request password reset - sends reset email
   * Does not reveal whether email exists (for security)
   */
  async forgotPassword(email: string) {
    // Find user by email, but don't throw error if not found
    // This is for security - don't reveal if email exists
    const user = await this.userService.findOneByEmail(email);

    // Always return success message to prevent email enumeration attacks
    if (!user) {
      this.logger.warn(`Forgot password request for non-existent email: ${email}`);
      return {
        message: 'If an account exists with this email, a password reset link will be sent shortly.',
      };
    }

    try {
      // Generate reset token
      const resetPasswordToken = this.generateVerificationToken();
      const resetPasswordTokenExpires = this.getResetPasswordTokenExpiration();

      // Save token to database
      await this.userService.update(user.id, {
        resetPasswordToken,
        resetPasswordTokenExpires,
      });

      // Generate reset link
      const resetLink = this.generateResetPasswordLink(resetPasswordToken);

      // Send reset password email
      await this.emailService.sendResetPasswordEmail(
        user.email,
        user.name,
        resetLink,
      );

      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${email}:`, error);
      // Don't throw error - maintain security by not revealing email existence
    }

    // Return generic success message
    return {
      message: 'If an account exists with this email, a password reset link will be sent shortly.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }

    // Find user with this reset token
    const user = await this.userService.findByResetPasswordToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is still valid
    if (
      user.resetPasswordTokenExpires &&
      new Date(user.resetPasswordTokenExpires) < new Date()
    ) {
      throw new BadRequestException('Reset token has expired. Please request a new password reset.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.userService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordTokenExpires: undefined,
    });

    this.logger.log(`Password reset successfully for ${user.email}`);

    return {
      message: 'Password reset successfully! You can now log in with your new password.',
    };
  }
}