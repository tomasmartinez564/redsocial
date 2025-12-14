// src/services/storage.js
import { supabase } from "./supabase";


// Sube un archivo al bucket especificado.

export async function uploadFile(filepath, file, bucket = "avatars") {
  const { data, error } = await supabase.storage.from(bucket).upload(filepath, file);

  if (error) {
    console.error("[storage.js uploadFile] Error al subir archivo: ", error);
    throw new Error(error.message);
  }

  return data;
}


// Elimina un archivo del bucket (si existe filepath).
export async function deleteFile(filepath, bucket = "avatars") {
  if (!filepath) return;

  const { error } = await supabase.storage.from(bucket).remove([filepath]);

  if (error) {
    console.error("[storage.js deleteFile] Error al eliminar archivo: ", error);
    throw new Error(error.message);
  }
}


// Obtiene la URL pública para un archivo del bucket.

export function getFileURL(filepath, bucket = "avatars") {
  if (!filepath) return null;

  const { data, error } = supabase.storage.from(bucket).getPublicUrl(filepath);

  if (error) {
    console.error("[storage.js getFileURL] Error al obtener URL pública: ", error);
    throw new Error(error.message);
  }

  return data.publicUrl;
}
