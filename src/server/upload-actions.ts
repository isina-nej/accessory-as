"use server";

import { uploadProductImage as uploadInner } from "@/server/admin-upload";

export async function uploadAction(form: FormData) {
  return uploadInner(form);
}
