import fs from 'fs';
import https from 'https';
import path from 'path';

const download = (url: string, dest: string) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  await download('https://placehold.co/192x192/ea580c/ffffff.png?text=BD', path.join(publicDir, 'pwa-192x192.png'));
  await download('https://placehold.co/512x512/ea580c/ffffff.png?text=BD', path.join(publicDir, 'pwa-512x512.png'));
  await download('https://placehold.co/180x180/ea580c/ffffff.png?text=BD', path.join(publicDir, 'apple-touch-icon.png'));
  await download('https://placehold.co/64x64/ea580c/ffffff.png?text=BD', path.join(publicDir, 'favicon.ico'));
  console.log('Downloaded icons');
};

run();
