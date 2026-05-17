import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "../../prisma/prisma.client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  basePath: "/api/v1/auth",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Reset Password - UMKM App",
        html: `
          <h2>Reset Password</h2>
          <p>Halo ${user.name},</p>
          <p>Klik link berikut untuk mereset password Anda:</p>
          <a href="${url}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
            Reset Password
          </a>
          <p>Link berlaku selama 1 jam.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verifikasi Email - UMKM App",
        html: `
          <h2>Verifikasi Email Anda</h2>
          <p>Halo ${user.name},</p>
          <p>Klik link berikut untuk memverifikasi email Anda:</p>
          <a href="${url}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
            Verifikasi Email
          </a>
          <p>Link berlaku selama 24 jam.</p>
        `,
      });
    },
  },

  plugins: [
    organization({
      sendInvitationEmail: async (data) => {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: data.email,
          subject: `Undangan Bergabung - ${data.organization.name}`,
          html: `
            <h2>Anda Diundang!</h2>
            <p>Anda diundang untuk bergabung ke <strong>${data.organization.name}</strong> sebagai ${data.role}.</p>
            <a href="${process.env.BETTER_AUTH_URL}/auth/accept-invitation/${data.id}" 
               style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
              Terima Undangan
            </a>
            <p>Link berlaku selama 48 jam.</p>
          `,
        });
      },
    }),
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    disableCSRFCheck: true,
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3001"],
});

export type Auth = typeof auth;
