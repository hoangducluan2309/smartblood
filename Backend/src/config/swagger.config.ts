import fs from 'fs';
import path from 'path';
import { load } from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tìm kiếm file đặc tả OpenAPI ở các vị trí khả dĩ
const possiblePaths = [
  path.resolve(process.cwd(), 'docs', 'openapi.yaml'),
  path.resolve(__dirname, '../../docs', 'openapi.yaml'),
  path.resolve(process.cwd(), 'Backend', 'docs', 'openapi.yaml'),
];

let openApiPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];

// Đọc và chuyển đổi nội dung YAML thành JavaScript Object
let swaggerDocument: Record<string, unknown> = {};

try {
  const fileContents = fs.readFileSync(openApiPath, 'utf8');
  swaggerDocument = load(fileContents) as Record<string, unknown>;
  console.log(`[Swagger]: Đã tải thành công tài liệu đặc tả OpenAPI từ ${openApiPath}`);
} catch (error) {
  console.error('[Swagger Error]: Không thể đọc file openapi.yaml:', error);
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
