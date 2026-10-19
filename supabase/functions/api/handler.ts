import {
  parseCreateItem,
  toItem,
  type CompleteItemResult,
  type CreateItemInput,
  type ItemRow,
} from './items.ts';

interface ApiDependencies {
  allowedOrigins: string[];
  today: string;
  /** null은 인증 실패, 배열은 인증된 사용자의 항목이다. */
  listItems(token: string): Promise<ItemRow[] | null>;
  /** null은 인증 실패, duplicate는 같은 이름의 활성 항목이 이미 있음을 뜻한다. */
  createItem?(token: string, input: CreateItemInput): Promise<ItemRow | 'duplicate' | null>;
  completeItem?(
    token: string,
    itemId: string,
    today: string,
  ): Promise<CompleteItemResult | 'not-found' | null>;
}

function headers(req: Request, allowedOrigins: string[]): Headers {
  const result = new Headers({ 'Content-Type': 'application/json' });
  const origin = req.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    result.set('Access-Control-Allow-Origin', origin);
    result.set('Vary', 'Origin');
    result.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
    result.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  return result;
}

function json(req: Request, allowedOrigins: string[], data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: headers(req, allowedOrigins) });
}

function error(
  req: Request,
  origins: string[],
  status: number,
  code: string,
  message: string,
): Response {
  return json(req, origins, { error: { code, message } }, status);
}

export async function handleApiRequest(req: Request, deps: ApiDependencies): Promise<Response> {
  const path = new URL(req.url).pathname;
  const isItems = /\/v1\/items\/?$/.test(path);
  const completeMatch = path.match(/\/v1\/items\/([^/]+)\/complete\/?$/);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: headers(req, deps.allowedOrigins) });
  }
  if (!isItems && !completeMatch)
    return error(req, deps.allowedOrigins, 404, 'NotFoundException', '주소를 찾을 수 없습니다.');
  if (
    (isItems && req.method !== 'GET' && (req.method !== 'POST' || !deps.createItem)) ||
    (completeMatch && (req.method !== 'POST' || !deps.completeItem))
  ) {
    return error(
      req,
      deps.allowedOrigins,
      405,
      'MethodNotAllowedException',
      '아직 지원하지 않는 요청입니다.',
    );
  }

  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return error(req, deps.allowedOrigins, 401, 'UnauthorizedException', '인증이 필요합니다.');
  }

  try {
    if (completeMatch) {
      const itemId = completeMatch[1];
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
        return error(
          req,
          deps.allowedOrigins,
          400,
          'BadRequestException',
          '항목 ID가 올바르지 않습니다.',
        );
      }
      const result = await deps.completeItem!(authorization.slice(7), itemId, deps.today);
      if (!result) {
        return error(
          req,
          deps.allowedOrigins,
          401,
          'UnauthorizedException',
          '세션이 만료되었습니다. 다시 로그인해 주세요.',
        );
      }
      if (result === 'not-found') {
        return error(
          req,
          deps.allowedOrigins,
          404,
          'NotFoundException',
          '항목을 찾을 수 없습니다.',
        );
      }
      return json(req, deps.allowedOrigins, result, 201);
    }
    if (req.method === 'POST') {
      const input = parseCreateItem(await req.json().catch(() => null));
      if (!input) {
        return error(
          req,
          deps.allowedOrigins,
          400,
          'VALIDATION_FAILED',
          '요청 형식이 올바르지 않습니다.',
        );
      }
      if (input.firstDoneOn && input.firstDoneOn > deps.today) {
        return error(
          req,
          deps.allowedOrigins,
          400,
          'BadRequestException',
          '오늘 이후 날짜로는 기록할 수 없어요.',
        );
      }
      const result = await deps.createItem!(authorization.slice(7), input);
      if (!result) {
        return error(
          req,
          deps.allowedOrigins,
          401,
          'UnauthorizedException',
          '세션이 만료되었습니다. 다시 로그인해 주세요.',
        );
      }
      if (result === 'duplicate') {
        return error(
          req,
          deps.allowedOrigins,
          409,
          'ConflictException',
          '같은 이름의 항목이 이미 있어요.',
        );
      }
      return json(req, deps.allowedOrigins, toItem(result, deps.today), 201);
    }
    const rows = await deps.listItems(authorization.slice(7));
    if (!rows) {
      return error(
        req,
        deps.allowedOrigins,
        401,
        'UnauthorizedException',
        '세션이 만료되었습니다. 다시 로그인해 주세요.',
      );
    }
    return json(
      req,
      deps.allowedOrigins,
      rows.map((row) => toItem(row, deps.today)),
    );
  } catch (cause) {
    console.error(`${req.method} ${path} failed`, cause);
    return error(req, deps.allowedOrigins, 500, 'INTERNAL_ERROR', '일시적인 오류가 발생했습니다.');
  }
}
