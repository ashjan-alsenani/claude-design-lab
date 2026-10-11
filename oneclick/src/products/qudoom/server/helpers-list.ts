import "server-only";
import { qudoomStore } from "./store";

/** The planners a signed-in account helps with (active grants only), for "My products". */
export async function helperPlanners(userId: string): Promise<{ id: string; name: string }[]> {
  try {
    const st = qudoomStore();
    const rows = await st.helpersOfUser(userId);
    const out = await Promise.all(rows.map(async (h) => ({ id: h.id, name: (await st.owner(h.ownerId))?.projection.name ?? "" })));
    return out;
  } catch {
    return [];
  }
}
