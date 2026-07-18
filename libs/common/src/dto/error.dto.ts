// ─── libs/common/src/dto/error.dto.ts ───────────────────────────────────────
export class ErrorResponseDto {
  statusCode: number;
  message: string;
  error?: string;
  traceId?: string;
  timestamp: string;

  constructor(statusCode: number, message: string, error?: string, traceId?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.traceId = traceId;
    this.timestamp = new Date().toISOString();
  }
}
