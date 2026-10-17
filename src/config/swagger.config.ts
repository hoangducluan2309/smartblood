import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

// Đường dẫn file đặc tả OpenAPI YAML
const openApiPath = path.resolve(process.cwd(), 'docs', 'openapi.yaml');

// Đọc và chuyển đổi nội dung YAML thành JavaScript Object
let swaggerDocument: Record<string, unknown> = {};

try {
  const fileContents = fs.readFileSync(openApiPath, 'utf8');
  swaggerDocument = load(fileContents) as Record<string, unknown>;
  console.log('[Swagger]: Đã tải thành công tài liệu đặc tả OpenAPI 3.0.3 từ docs/openapi.yaml');
} catch (error) {
  console.error('[Swagger Error]: Không thể đọc file docs/openapi.yaml:', error);
}

/**
 * Hàm cấu hình và mount Swagger UI vào Express App
 * @param app Express Application instance
 */
export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Hệ thống Điều phối Hiến máu - API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  console.log('[Swagger]: Giao diện API Docs khả dụng tại: http://localhost:5000/api-docs');
}

export { swaggerDocument };
