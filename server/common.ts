let cfEnv: any = null;
try {
  const mod = 'cloudflare:workers';
  // @ts-ignore
  const workers = await import(/* webpackIgnore: true */ mod);
  cfEnv = workers.env;
} catch {
  cfEnv = null;
}
export const settings = () => cfEnv || (typeof process !== 'undefined' ? process.env : {});
export const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function trusted(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin}
export async function body(req:Request){if(Number(req.headers.get('content-length')||0)>16000)throw Error('too_large');const raw=await req.text();if(raw.length>16000)throw Error('too_large');return JSON.parse(raw)}
export async function rate(req:Request,scope:string,max=5){const db=settings().DB;if(!db)return false;const id=req.headers.get('oai-authenticated-user-id')||req.headers.get('cf-connecting-ip')||'anonymous';const bucket=Math.floor(Date.now()/60000),key=scope+':'+id+':'+bucket;const r=await db.prepare('INSERT INTO rate_counters (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+120000).first();await db.prepare('DELETE FROM rate_counters WHERE expires < ?').bind(Date.now()-60000).run();return Number(r?.count)<=max}
