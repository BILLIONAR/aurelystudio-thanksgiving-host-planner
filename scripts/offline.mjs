import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){let out=[];for(const file of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+file.name;if(file.isDirectory())out.push(...await walk(path));else out.push(path);}return out;}
const dir=process.argv[2]||'dist';
const edition=process.argv[3]||'full';
const paths=(await walk(dir)).filter(p=>!p.endsWith('/sw.js')&&!p.endsWith('/qa-runtime.html')&&!p.includes('/_')).sort();
const hash=createHash('sha256');for(const p of paths)hash.update(await readFile(p));
const prefix='aurely-thanksgiving-'+edition+'-';
const name=prefix+hash.digest('hex').slice(0,12);
const urls=['./',...paths.map(p=>'./'+p.slice(dir.length+1))];
const script=`const CACHE=${JSON.stringify(name)};const PREFIX=${JSON.stringify(prefix)};const FILES=${JSON.stringify(urls)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;if(e.request.mode==='navigate'||u.pathname===new URL(self.registration.scope).pathname||u.pathname===new URL('./index.html',self.registration.scope).pathname){e.respondWith(fetch(e.request).catch(()=>caches.match(new URL('./index.html',self.registration.scope))));return;}e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});`;
await writeFile(dir+'/sw.js',script);console.log('Offline shell: '+urls.length+' local files, '+name);
