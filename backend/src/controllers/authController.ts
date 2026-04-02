import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import emailService from '../services/emailService';
import * as fs from 'fs';
import * as path from 'path';
import { getJwtSecret } from '../utils/jwt';

const ERROR_LOG = path.resolve(__dirname, '../../logs/errors.log');
function logErrorToFile(tag: string, err: any) {
  try {
    const msg = `[${new Date().toISOString()}] ${tag} - ${err && err.stack ? err.stack : String(err)}\n`;
    fs.mkdirSync(path.dirname(ERROR_LOG), { recursive: true });
    fs.appendFileSync(ERROR_LOG, msg);
  } catch (e) {
    console.error('Failed to write error log', e);
  }
}

// توليد JWT Token
const generateToken = (id: number): string => {
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  // استخدم as any لتجاوز مشكلة النوع في jwt.sign
  return jwt.sign({ id }, getJwtSecret(), { expiresIn } as any);
};

// تسجيل مستخدم جديد
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // التحقق من الحقول المطلوبة
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'صيغة البريد الإلكتروني غير صحيحة',
      });
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone: phone || null }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'البريد الإلكتروني مسجل مسبقاً'
          : 'رقم الهاتف مسجل مسبقاً',
      });
    }

    // إنشاء توكن التفعيل
    const verificationToken = generateToken(Date.now());

    // في development، جعل الحساب مُفعّل مباشرة للاختبار السهل
    const env = process.env.NODE_ENV || 'development';
    const isVerified = env === 'development' ? true : false;

    // إنشاء المستخدم مع جميع الحقول المطلوبة
    const user = await User.create({
      email,
      password,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      language: 'ar', // القيمة الافتراضية
      isVerified: isVerified, // مفعّل في development
      verificationToken: verificationToken,
    } as any); // استخدم as any للتغلب على مشكلة TypeScript

    // توليد التوكن للمصادقة
    const token = generateToken(user.id);

    // إرسال بريد الترحيب والتأكيد
    try {
      // استخدم sendNotificationEmail كبديل حتى تضيف sendWelcomeEmail
      await emailService.sendNotificationEmail(
        user.email,
        'مرحباً بك في دليل دمشق السياحي',
        'شكراً لتسجيلك في دليل دمشق السياحي. يرجى تفعيل حسابك للنقر على الرابط.',
        `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
      );
    } catch (emailError) {
      console.error('فشل إرسال البريد الترحيبي:', emailError);
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        language: user.language,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      message: 'تم إنشاء الحساب بنجاح، يرجى تفعيل بريدك الإلكتروني',
    });
  } catch (error: any) {
    console.error('Register error:', error);
    logErrorToFile('register', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الحساب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// تسجيل الدخول
export const login = async (req: Request, res: Response) => {
  const { email, password, phone } = req.body || {};
  
  try {
    if ((!email && !phone) || !password) {
      return res.status(400).json({ success: false, message: 'email/phone and password required' });
    }

    const user: any = await (User as any).findOne({ $or: [ { email }, { phone } ] }) as any;
    if (!user) {
      return res.status(401).json({ success: false, message: 'invalid credentials' });
    }

    const isMatch = await (user as any).comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user.id);
    
    return res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        _id: user._id,
        email: user.email, 
        firstName: user.firstName,
        role: user.role 
      } 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'login error', error: error && error.message });
  }
};

// تفعيل الحساب
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'توكن التفعيل مطلوب',
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'توكن التفعيل غير صالح أو منتهي',
      });
    }

    // تفعيل الحساب - استخدم undefined بدلاً من null
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'تم تفعيل حسابك بنجاح',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تفعيل الحساب',
    });
  }
};

// إعادة إرسال بريد التفعيل
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'الحساب مفعل بالفعل',
      });
    }

    // إنشاء توكن جديد
    const verificationToken = generateToken(Date.now());
    user.verificationToken = verificationToken;
    await user.save();

    // إرسال البريد باستخدام sendNotificationEmail
    await emailService.sendNotificationEmail(
      user.email,
      'تفعيل حسابك في دليل دمشق السياحي',
      'لتفعيل حسابك، يرجى النقر على الرابط أدناه:',
      `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
    );

    res.json({
      success: true,
      message: 'تم إرسال بريد التفعيل بنجاح',
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال بريد التفعيل',
    });
  }
};

// نسيان كلمة المرور
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // لإخفاء وجود المستخدم، نعيد نفس الرسالة
      return res.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رابط إعادة التعيين',
      });
    }

    // إنشاء توكن إعادة التعيين
    const resetToken = generateToken(user.id);
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق
    
    // استخدم as any للتعامل مع null
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // إرسال البريد
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء معالجة الطلب',
    });
  }
};

// إعادة تعيين كلمة المرور
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'التوكن وكلمة المرور الجديدة مطلوبان',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'توكن إعادة التعيين غير صالح أو منتهي',
      });
    }

    // تحديث كلمة المرور
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث كلمة المرور',
    });
  }
};

// الحصول على بيانات المستخدم الحالي
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المستخدم',
    });
  }
};

// تحديث الملف الشخصي
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { firstName, lastName, phone, language, avatarUrl } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    // التحقق من رقم الهاتف إذا تم تحديثه
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: userId },
      });
      
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'رقم الهاتف مسجل مسبقاً',
        });
      }
    }

    // تحديث البيانات باستخدام null للقيم الفارغة
    const updateData: any = {
      firstName: firstName !== undefined ? (firstName || null) : user.firstName,
      lastName: lastName !== undefined ? (lastName || null) : user.lastName,
      phone: phone !== undefined ? (phone || null) : user.phone,
      language: language !== undefined ? language : user.language,
      avatarUrl: avatarUrl !== undefined ? (avatarUrl || null) : user.avatarUrl,
    };

    Object.assign(user, updateData);
    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        language: user.language,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملف الشخصي',
    });
  }
};

// تغيير كلمة المرور
export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبتان',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    // التحقق من كلمة المرور الحالية
    const isMatch = await (user as any).comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة',
      });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير كلمة المرور',
    });
  }
};

// تسجيل الخروج
export const logout = async (req: any, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الخروج',
    });
  }
};

// تحديث الصورة الشخصية
export const updateAvatar = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'رابط الصورة مطلوب',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    user.avatarUrl = avatarUrl || null;
    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث الصورة الشخصية بنجاح',
      avatarUrl: user.avatarUrl,
    });
  } catch (error: any) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الصورة الشخصية',
    });
  }
};
