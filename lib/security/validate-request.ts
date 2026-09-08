// lib/security/validate-request.ts
import { z } from 'zod';

const kycSchema = z.object({
  userId: z.string().uuid(),
  documentImage: z.string().min(100), // Base64 image
  selfieImage: z.string().min(100),
  userData: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    documentNumber: z.string().min(6),
    dateOfBirth: z.string(),
    country: z.string().length(2),
    documentType: z.enum(['CNI', 'PASSPORT']),
  }),
});

export async function validateRequest(request: Request) {
  try {
    const body = await request.json();
    const validation = kycSchema.safeParse(body);
    
    return {
      success: validation.success,
      data: validation.success ? validation.data : null,
      errors: validation.success ? null : validation.error,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error,
    };
  }
}