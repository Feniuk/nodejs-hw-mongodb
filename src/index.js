import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { createFolderIfNotExist } from './utils/createFolderIfNotExist.js';
import { TEMP_UPLOAD_DIR } from './constants/index.js';

const bootstrap = async () => {
  await initMongoConnection();
  await createFolderIfNotExist(TEMP_UPLOAD_DIR);
  setupServer();
};

bootstrap();
