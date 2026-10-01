import { useState } from 'react';
import { Bot, Play, Square, Activity, TrendingUp, TrendingDown, ShieldCheck, Settings2, Radio, CheckCircle2, AlertTriangle, Clock3, BarChart3, WalletCards, ListChecks, History, Wifi, WifiOff, Brain, Gauge, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type Section = 'overview'|'live'|'strategies'|'orders'|'positions'|'risk'|'exchanges'|'logs'|'settings';

const positions = [
  ['BTC/USDT','LONG','$112,480','+$3,194.20','فعال'],
  ['ETH/USDT','SHORT','$4,315','+$812.40','فعال'],
  ['SOL/USDT','LONG','$238.40','-$102.70','فعال'],
];
const orders = [
  ['BTC/USDT','BUY','0.018 BTC','$112,480','تکمیل شد'],
  ['ETH/USDT','SELL','0.45 ETH','$4,315','تکمیل شد'],
  ['SOL/USDT','BUY','4.2 SOL','$238.40','در انتظار'],
];

const TraderBot = ({ section='overview' }: { section?: Section }) => {
  const [running,setRunning]=useState(true);
  const [paper,setPaper]=useState(true);
  const [auto,setAuto]=useState(false);
  const [market,setMarket]=useState(true);
  const [signal,setSignal]=useState(true);
  const [risk,setRisk]=useState(true);
  const [exchange,setExchange]=useState(false);

  const status = (ok:boolean, text:string) => (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${ok?'bg-emerald-500':'bg-amber-500'}`} />
        <span className="font-medium">{text}</span>
      </div>
      <Badge variant={ok?'default':'secondary'}>{ok?'فعال':'در انتظار'}</Badge>
    </div>
  );

  const overview = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['وضعیت ربات', running?'در حال اجرا':'متوقف', Activity],
          ['سود/زیان امروز','+$1,284.60', TrendingUp],
          ['معاملات امروز','27', BarChart3],
          ['سرمایه درگیر','$18,420', WalletCards],
        ].map(([t,v,I]:any)=>(
          <Card key={t}><CardContent className="p-5"><div className="flex justify-between"><span className="text-sm text-muted-foreground">{t}</span><I className="h-5 w-5 text-primary"/></div><div className="mt-3 text-xl font-bold">{v}</div></CardContent></Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/>کنترل اصلی ربات</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border p-4 flex justify-between items-center"><div><Label>Paper Trading</Label><p className="text-xs text-muted-foreground mt-1">بدون ارسال سفارش واقعی</p></div><Switch checked={paper} onCheckedChange={setPaper}/></div>
              <div className="rounded-xl border p-4 flex justify-between items-center"><div><Label>معامله خودکار</Label><p className="text-xs text-muted-foreground mt-1">ارسال خودکار سفارش</p></div><Switch checked={auto} onCheckedChange={setAuto}/></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">استراتژی فعال</p><b>Smart Money AI</b></div>
              <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">ریسک هر معامله</p><b>1%</b></div>
              <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">حد ضرر</p><b>2%</b></div>
            </div>
            <div className="flex gap-2"><Button variant="outline"><Settings2 className="ml-2 h-4 w-4"/>تنظیمات پیشرفته</Button><Button variant="outline"><ShieldCheck className="ml-2 h-4 w-4"/>مدیریت ریسک</Button></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle>سلامت اجزای ربات</CardTitle></CardHeader><CardContent className="space-y-3">
          {status(market,'داده بازار')}{status(signal,'موتور سیگنال')}{status(risk,'مدیریت ریسک')}{status(exchange,'اتصال صرافی')}
          <p className="text-xs text-muted-foreground"><Clock3 className="inline h-4 w-4 ml-1"/>آخرین بررسی: همین الان</p>
        </CardContent></Card>
      </div>
    </>
  );

  const panel = (title:string, icon:any, children:any) => <Card><CardHeader><CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;

  let content:any=overview;
  if(section==='live') content=panel('مانیتور زنده',<Radio className="h-5 w-5"/>,<div className="grid gap-4 md:grid-cols-2">{status(running,'Engine ربات')}{status(market,'Stream قیمت')}{status(signal,'Signal Engine')}{status(risk,'Risk Engine')}<div className="md:col-span-2 rounded-xl bg-muted/40 p-5"><div className="flex justify-between"><span>BTC/USDT</span><span className="text-emerald-500">+1.82%</span></div><div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 w-3/4 rounded-full bg-emerald-500"/></div></div></div>);
  if(section==='strategies') content=panel('استراتژی‌ها',<Brain className="h-5 w-5"/>,<div className="grid gap-3 md:grid-cols-2">{['Smart Money AI','Trend Following','Breakout','Mean Reversion'].map((x,i)=><div className="rounded-xl border p-4 flex items-center justify-between" key={x}><div><b>{x}</b><p className="text-xs text-muted-foreground mt-1">Win Rate: {68-i*4}% · Risk: 1%</p></div><Switch defaultChecked={i===0}/></div>)}</div>);
  if(section==='orders') content=panel('سفارش‌ها',<ListChecks className="h-5 w-5"/>,<div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b text-right">{['نماد','نوع','حجم','قیمت','وضعیت'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{orders.map(r=><tr className="border-b" key={r[0]+r[1]}>{r.map((x,i)=><td className="p-3" key={i}>{x}</td>)}</tr>)}</tbody></table></div>);
  if(section==='positions') content=panel('موقعیت‌های باز',<WalletCards className="h-5 w-5"/>,<div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b text-right">{['نماد','جهت','ورود','سود/زیان','وضعیت'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{positions.map(r=><tr className="border-b" key={r[0]}>{r.map((x,i)=><td className={`p-3 ${i===3?'font-bold text-emerald-500':''}`} key={i}>{x}</td>)}</tr>)}</tbody></table></div>);
  if(section==='risk') content=panel('مدیریت ریسک',<ShieldCheck className="h-5 w-5"/>,<div className="grid gap-4 md:grid-cols-2">{[['حداکثر ریسک هر معامله','1%'],['حداکثر افت روزانه','5%'],['حداکثر موقعیت همزمان','5'],['حد ضرر پیش‌فرض','2%']].map(([a,b])=><div className="rounded-xl border p-4" key={a}><Label>{a}</Label><Input className="mt-2" defaultValue={b}/></div>)}</div>);
  if(section==='exchanges') content=panel('اتصال صرافی',<Wifi className="h-5 w-5"/>,<div className="space-y-4"><div className="rounded-xl border p-5 flex justify-between items-center"><div><b>Binance</b><p className="text-xs text-muted-foreground mt-1">{exchange?'متصل و آماده':'API متصل نشده است'}</p></div>{exchange?<Wifi className="text-emerald-500"/>:<WifiOff className="text-amber-500"/>}</div><Button onClick={()=>setExchange(!exchange)}>{exchange?'قطع اتصال':'اتصال حساب'}</Button><p className="text-xs text-muted-foreground">برای امنیت، کلید API فقط در محیط امن ذخیره شود.</p></div>);
  if(section==='logs') content=panel('لاگ و رویدادها',<History className="h-5 w-5"/>,<div className="space-y-2">{['Signal Engine: BTC/USDT LONG','Risk Engine: position approved','Market feed: heartbeat OK','Strategy: Smart Money AI updated'].map((x,i)=><div className="rounded-lg bg-muted/40 p-3 text-sm" key={i}><span className="text-emerald-500 ml-2">●</span>{x}</div>)}</div>);
  if(section==='settings') content=panel('تنظیمات ربات',<Settings2 className="h-5 w-5"/>,<div className="grid gap-4 md:grid-cols-2">{[['نام ربات','Smart Trader Bot'],['تایم‌فریم','15m'],['حداکثر سرمایه','25,000 USDT'],['حداقل امتیاز سیگنال','75']].map(([a,b])=><div key={a}><Label>{a}</Label><Input className="mt-2" defaultValue={b}/></div>)}</div>);

  return <div dir="rtl" className="space-y-6 p-1">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center"><Bot className="text-white"/></div><div><h1 className="text-2xl font-bold">ربات تریدر</h1><p className="text-sm text-muted-foreground">مرکز کنترل و مدیریت کامل معاملات خودکار</p></div></div></div>
      <Button variant={running?'destructive':'default'} onClick={()=>setRunning(!running)}>{running?<Square className="ml-2 h-4 w-4"/>:<Play className="ml-2 h-4 w-4"/>}{running?'توقف ربات':'اجرای ربات'}</Button>
    </div>
    {content}
  </div>;
};
export default TraderBot;
