export function isPwaEnabled() {
  return process.env.NEXT_PUBLIC_PWA_ENABLED !== "false";
}
