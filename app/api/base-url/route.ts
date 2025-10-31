import { NextResponse } from "next/server";
import os from "os";

// Utility to choose a likely LAN IPv4 address if the host is localhost
function getLanIPv4(): string | null {
  const nets = os.networkInterfaces();
  if (!nets) return null;
  const isPrivate = (ip: string) => {
    // 10.0.0.0/8
    if (ip.startsWith("10.")) return true;
    // 172.16.0.0/12 -> 172.16. - 172.31.
    const m = ip.match(/^172\.(\d{1,2})\./);
    if (m) {
      const n = Number(m[1]);
      if (n >= 16 && n <= 31) return true;
    }
    // 192.168.0.0/16
    if (ip.startsWith("192.168.")) return true;
    return false;
  };

  for (const name of Object.keys(nets)) {
    const addrs = nets[name] || [];
    for (const addr of addrs) {
      if (addr?.family === "IPv4" && !addr.internal && isPrivate(addr.address)) {
        return addr.address;
      }
    }
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const headers = new Headers(req.headers);
    const forwardedProto = headers.get("x-forwarded-proto") || "http";
    const forwardedHost = headers.get("x-forwarded-host");
    const host = headers.get("host");

    const hostToUse = forwardedHost || host || "localhost:3000";
    const protoToUse = forwardedProto.includes("http") ? forwardedProto : "http";

    const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(hostToUse);

    // If we are not on localhost, prefer the request host directly
    if (!isLocal) {
      const baseUrl = `${protoToUse}://${hostToUse}`;
      return NextResponse.json({ baseUrl });
    }

    // Try env override first
    const envBase = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
    if (envBase) {
      return NextResponse.json({ baseUrl: envBase });
    }

    // Derive port from host header if present, otherwise fallback
    const portMatch = hostToUse.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : process.env.PORT || "3000";

    const lanIp = getLanIPv4();
    if (lanIp) {
      const baseUrl = `${protoToUse}://${lanIp}:${port}`;
      return NextResponse.json({ baseUrl });
    }

    // Fallback to localhost if no LAN IP could be determined
    const baseUrl = `${protoToUse}://localhost:${port}`;
    return NextResponse.json({ baseUrl });
  } catch {
    // As a last resort
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.json({ baseUrl });
  }
}
