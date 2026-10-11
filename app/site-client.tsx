'use client';
import {useEffect,useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {App} from '../src/main';
export default function SiteClient(){const[mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<BrowserRouter><App/></BrowserRouter>:<div style={{minHeight:'100vh',background:'#101827',color:'#c9a76a',display:'grid',placeItems:'center',fontFamily:'serif'}}>Anointing Ministries · Loading your worship space…</div>}
