/** Edge uses explicit construction, not Nest's HTTP server or dependency container. */
export const Injectable =
  () =>
  <T>(target: T): T =>
    target;
export const Cron = (_expression: string) => () => undefined;
export const CronExpression = { EVERY_HOUR: '0 * * * *' };
export class HttpException extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
  getStatus() {
    return this.status;
  }
}
export class BadRequestException extends HttpException {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400);
  }
}
export class NotFoundException extends HttpException {
  constructor(message = '찾을 수 없습니다.') {
    super(message, 404);
  }
}
export class ConflictException extends HttpException {
  constructor(message = '이미 존재합니다.') {
    super(message, 409);
  }
}
export class UnauthorizedException extends HttpException {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
  }
}
export class Logger {
  constructor(_name?: string) {}
  log(_message: string) {}
  warn(_message: string) {}
  error(_message: string) {}
}
