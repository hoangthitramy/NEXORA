import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});
