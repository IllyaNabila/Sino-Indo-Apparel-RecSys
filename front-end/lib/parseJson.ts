// src/lib/parseJson.ts
import { InvalidJsonError } from "./errors";

export async function parseJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch (e) {
    throw new InvalidJsonError(e);
  }
}
