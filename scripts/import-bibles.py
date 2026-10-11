from pathlib import Path
import xml.etree.ElementTree as ET,json,hashlib,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'bible-input');dest=Path('public/bible');dest.mkdir(parents=True,exist_ok=True);index={}
for lang,pattern in [('en','*ENG_KJV*'),('ta','*TAM_TAMBSI*')]:
 p=next(root.glob(pattern));tree=ET.parse(p).getroot();books=[];total=0
 for b in tree.findall('BIBLEBOOK'):
  number=int(b.attrib['bnumber']);chapters=[]
  for c in b.findall('CHAPTER'):
   verses=[{'n':int(v.attrib['vnumber']),'text':''.join(v.itertext()).strip()} for v in c.findall('VERS')]
   total+=len(verses);chapters.append({'n':int(c.attrib['cnumber']),'verses':verses})
  obj={'id':number,'name':b.attrib.get('bname',''),'chapters':chapters};(dest/f'{lang}-{number}.json').write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':')))
  books.append({'id':number,'name':obj['name'],'chapters':len(chapters)})
 index[lang]={'name':tree.attrib['biblename'],'books':books,'verses':total,'sourceFile':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()};print(lang,len(books),total)
(dest/'index.json').write_text(json.dumps(index,ensure_ascii=False,separators=(',',':')))
# Daily selection uses exact uploaded text, stable date in Asia/Kolkata.
refs=[(19,23,1),(19,46,10),(43,3,16),(50,4,13),(23,41,10),(20,3,5),(19,118,24),(24,29,11),(40,11,28),(19,121,2),(45,8,28),(62,4,19),(19,100,5),(43,14,27)]
daily=[]
for b,c,v in refs:
 item={'book':b,'chapter':c,'verse':v}
 for lang in ['en','ta']:
  book=json.loads((dest/f'{lang}-{b}.json').read_text());ch=next(x for x in book['chapters'] if x['n']==c);line=next(x for x in ch['verses'] if x['n']==v);item[lang]={'text':line['text'],'reference':f'{book["name"]} {c}:{v}'}
 daily.append(item)
Path('src/daily-verses.json').write_text(json.dumps(daily,ensure_ascii=False,separators=(',',':')))
