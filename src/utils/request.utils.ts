import { DiscordError } from "../channel.model";

export function createHeaders(token: string) {
  return {
    Authorization: token,
    "Content-Type": "application/json",
  } as const;
}

export function isDiscordError<T>(value: T): value is T & DiscordError {
  return typeof value === "object" && "retryAfter" in (value ?? {});
}
