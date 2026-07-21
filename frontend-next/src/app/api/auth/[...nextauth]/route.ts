import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(req: Request, context: any) {
  const reqClone = req.clone();
  const response = await handler(req, context);

  try {
    const url = new URL(req.url);
    if (url.pathname.includes('/callback/credentials')) {
      const text = await reqClone.text();
      const params = new URLSearchParams(text);
      const rememberMe = params.get('rememberMe');
      
      if (rememberMe === 'false') {
        const setCookieHeaders = response.headers.getSetCookie();
        
        if (setCookieHeaders && setCookieHeaders.length > 0) {
          response.headers.delete('Set-Cookie');
          
          for (const cookie of setCookieHeaders) {
            if (cookie.includes('next-auth.session-token')) {
              let newCookie = cookie.replace(/Max-Age=[0-9]+;?\s*/i, '');
              newCookie = newCookie.replace(/Expires=[^;]+;?\s*/i, '');
              response.headers.append('Set-Cookie', newCookie);
            } else {
              response.headers.append('Set-Cookie', cookie);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error modifying cookie", e);
  }

  return response;
}
