import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** design-lab 根目录：脚本无论从哪调用都用绝对路径。 */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
