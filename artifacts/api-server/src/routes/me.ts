import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userProfiles, userRoles } from "@workspace/db";
import { GetMeResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth, clerkClient } from "@clerk/express";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;

  let [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId));

  if (!profile) {
    let email: string | null = null;
    let fullName: string | null = null;
    try {
      const auth = getAuth(req);
      const sessionClaims = auth?.sessionClaims as
        | { email?: string; name?: string; first_name?: string; last_name?: string }
        | undefined;
      email = sessionClaims?.email ?? null;
      fullName =
        sessionClaims?.name ??
        ([sessionClaims?.first_name, sessionClaims?.last_name]
          .filter(Boolean)
          .join(" ") || null);

      if (!email) {
        const u = await clerkClient.users.getUser(userId);
        email = u.emailAddresses?.[0]?.emailAddress ?? null;
        fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || null;
      }
    } catch (err) {
      req.log.warn({ err }, "Failed to fetch Clerk user");
    }

    [profile] = await db
      .insert(userProfiles)
      .values({ id: userId, email, fullName })
      .onConflictDoNothing()
      .returning();

    if (!profile) {
      [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId));
    }
  }

  const roles = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  res.json(
    GetMeResponse.parse({
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      roles: roles.map((r) => r.role),
      storeId: profile.storeId,
      warehouseId: profile.warehouseId,
    }),
  );
});

export default router;
