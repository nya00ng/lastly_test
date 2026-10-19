import { toItem, type ItemRow } from './items.ts';

interface ApiDependencies {
  allowedOrigins: string[];
  today: string;
  /** null은 인증 실패, 배열은 인증된 사용자의 항목이다. */
  listItems(token: string): Promise<ItemRow[] | null>;
}

function headers(req: Request, allowedOrigins: string[]): Headers {
  const result = new Headers({ 'Content-Type': 'application/json' });
  const origin = req.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    result.set('Access-Control-Allow-Origin', origin);
    result.set('Vary', 'Origin');
    result.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
    result.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  }
  return result;
}

function json(req: Request, allowedOrigins: string[], data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: headers(req, allowedOrigins) });
}

function error(req: Request, origins: string[], status: number, code: string, message: string): Response {
  return json(req, origins, { error: { code, message } }, status);
}

export async function handleApiRequest(req: Request, deps: ApiDependencies): Promise<Response> {
  const path = new URL(req.url).pathname;
  const isItems = /\/v1\/items\/?$/.test(path);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: headers(req, deps.allowedOrigins) });
  }
  if (!isItems) return error(req, deps.allowedOrigins, 404, 'NotFoundException', '주소를 찾을 수 없습니다.');
  if (req.method !== 'GET') {
    return error(req, deps.allowedOrigins, 405, 'MethodNotAllowedException', '아직 지원하지 않는 요청입니다.');
  }

  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return error(req, deps.allowedOrigins, 401, 'UnauthorizedException', '인증이 필요합니다.');
  }

  try {
    const rows = await deps.listItems(authorization.slice(7));
    if (!rows) {
      return error(req, deps.allowedOrigins, 401, 'UnauthorizedException', '세션이 만료되었습니다. 다시 로그인해 주세요.');
    }
    return json(req, deps.allowedOrigins, rows.map((row) => toItem(row, deps.today)));
  } catch (cause) {
    console.error('GET /v1/items failed', cause);
    return error(req, deps.allowedOrigins, 500, 'INTERNAL_ERROR', '일시적인 오류가 발생했습니다.');
  }
}
