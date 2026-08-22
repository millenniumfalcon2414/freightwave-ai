import { createServerFn } from "@tanstack/react-start";
import { db } from "../db/database";

export const getDatabaseSnapshotFn = createServerFn({ method: "GET" }).handler(async () => {
  return db.getState();
});
