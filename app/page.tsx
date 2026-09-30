use client";

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import salesData from "../data/Sheet1.json";
import stockData from "../data/Stock.json";
import cashData from "../data/流水.json";

type Row = Record<string, any>;
const sales = salesData as Row[];
const stock = stockData as Row[];
const cash = cashData as Row[];

const n = (v: any) => Number(v) || 0;
const money = (v: number) => `RM ${v.toLocaleString("en-MY",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const qty = (v: number) => v.toLocaleString("en-MY",{maximumFractionDigits:2});

function Card({label,value,sub,negative=false}:{label:string,value:string,sub?:string,negative?:boolean}) {
  return <div className="card"><span>{label}</span><strong className={negative ? "negative" : ""}>{value}</strong>{sub && <small>{sub}</small>}</div>;
}

export default function Dashboard() {
  const [month,setMonth] = useState("all");
  const [product,setProduct] = useState("all");

  const months = useMemo(() => Array.from(new Set(
    sales.filter(r=>r.Description==="Sales" && r.Date).map(r=>String(r.Date).slice(0,7))
  )).sort(),[]);
  const products = useMemo(() => Array.from(new Set(
    sales.filter(r=>r.Description==="Sales" && r.Product).map(r=>String(r.Product))
  )).sort(),[]);

  const filtered = useMemo(() => sales.filter(r =>
    r.Description==="Sales" &&
    (month==="all" || String(r.Date).startsWith(month)) &&
    (product==="all" || r.Product===product)
  ),[month,product]);

  const metrics = useMemo(() => {
    const revenue=filtered.reduce((a,r)=>a+n(r["Selling Price"]),0);
    const income=filtered.reduce((a,r)=>a+n(r.Income),0);
    const stockCost=filtered.reduce((a,r)=>a+n(r["Total Stock Price"]),0);
    const units=filtered.reduce((a,r)=>a+n(r["Selling Quantity"]),0);
    const discount=filtered.reduce((a,r)=>a+n(r.Discount),0);
    const fees=filtered.reduce((a,r)=>a+n(r["Transaction Fee"])+n(r["Commission Fee"])+n(r["Service Fee"]),0);
    const profit=income-stockCost;
    const ads=sales.filter(r=>
      r.Description==="Ads" && (month==="all" || String(r.Date).startsWith(month))
    ).reduce((a,r)=>a+n(r["Ads Price"]),0);
    return {revenue,income,stockCost,units,discount,fees,profit,ads,margin:revenue?profit/revenue*100:0};
  },[filtered,month]);

  const trend=useMemo(()=>{
    const map:Record<string,any>={};
    filtered.forEach(r=>{
      const m=String(r.Date).slice(0,7);
      map[m]??={month:m,revenue:0,profit:0,units:0};
      map[m].revenue+=n(r["Selling Price"]);
      map[m].profit+=n(r.Income)-n(r["Total Stock Price"]);
      map[m].units+=n(r["Selling Quantity"]);
    });
    return Object.values(map).sort((a,b)=>a.month.localeCompare(b.month));
  },[filtered]);

  const productStats=useMemo(()=>{
    const map:Record<string,any>={};
    filtered.forEach(r=>{
      const p=r.Product||"Unknown";
      map[p]??={product:p,units:0,revenue:0,income:0,cost:0,profit:0};
      map[p].units+=n(r["Selling Quantity"]);
      map[p].revenue+=n(r["Selling Price"]);
      map[p].income+=n(r.Income);
      map[p].cost+=n(r["Total Stock Price"]);
      map[p].profit+=n(r.Income)-n(r["Total Stock Price"]);
    });
    return Object.values(map).sort((a,b)=>b.profit-a.profit);
  },[filtered]);

  const inventory=useMemo(()=>stock.map(r=>({
    ...r,
    value:n(r.Remaning)*n(r["Price per item"])
  })).filter(r=>n(r.Remaning)>0).sort((a,b)=>b.value-a.value),[]);

  const cashSummary=useMemo(()=>{
    const rows=cash as Row[];
    return {
      in:rows.reduce((a,r)=>a+n(r.IN),0),
      out:rows.reduce((a,r)=>a+n(r.OUT),0)
    };
  },[]);

  return <main>
    <header>
      <div>
        <div className="eyebrow">HUSKYBYTE · ACCOUNTING</div>
        <h1>Shoppee Statistic</h1>
        <p>Sales, profitability, advertising, inventory and cash flow.</p>
      </div>
      <div className="filters">
        <select value={month} onChange={e=>setMonth(e.target.value)}>
          <option value="all">All months</option>
          {months.map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={product} onChange={e=>setProduct(e.target.value)}>
          <option value="all">All products</option>
          {products.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>
    </header>

    <section className="cards">
      <Card label="Sales revenue" value={money(metrics.revenue)}/>
      <Card label="Net sales income" value={money(metrics.income)} sub={`Fees ${money(metrics.fees)}`}/>
      <Card label="Profit" value={money(metrics.profit)} negative={metrics.profit<0} sub={`${metrics.margin.toFixed(1)}% margin`}/>
      <Card label="Units sold" value={qty(metrics.units)}/>
      <Card label="Ads spend" value={money(metrics.ads)}/>
      <Card label="Discounts" value={money(metrics.discount)}/>
    </section>

    <section className="grid two">
      <Panel title="Revenue & profit">
        <div className="chart"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="month"/><YAxis/><Tooltip formatter={(v:any)=>money(n(v))}/>
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent)" strokeWidth={3} dot={false}/>
            <Line type="monotone" dataKey="profit" name="Profit" stroke="var(--ink)" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer></div>
      </Panel>
      <Panel title="Units sold">
        <div className="chart"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="units" name="Units" fill="var(--accent)" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer></div>
      </Panel>
    </section>

    <section className="grid two">
      <Panel title="Product performance">
        <Table headers={["Product","Units","Revenue","Profit"]}>
          {productStats.map(r=><tr key={r.product}><td>{r.product}</td><td>{qty(r.units)}</td><td>{money(r.revenue)}</td><td className={r.profit<0?"negative":""}>{money(r.profit)}</td></tr>)}
        </Table>
      </Panel>
      <Panel title="Inventory on hand">
        <Table headers={["Product","Remaining","Unit cost","Stock value"]}>
          {inventory.map(r=><tr key={`${r.Product}-${r["Stock ID"]}`}><td>{r.Product}</td><td>{qty(n(r.Remaning))}</td><td>{money(n(r["Price per item"]))}</td><td>{money(r.value)}</td></tr>)}
        </Table>
      </Panel>
    </section>

    <section className="summary">
      <div><span>Stock cost sold</span><strong>{money(metrics.stockCost)}</strong></div>
      <div><span>Fees</span><strong>{money(metrics.fees)}</strong></div>
      <div><span>Cash IN</span><strong>{money(cashSummary.in)}</strong></div>
      <div><span>Cash OUT</span><strong>{money(cashSummary.out)}</strong></div>
    </section>

    <footer>{filtered.length} sales records · Source: Shoppee Accountant.xlsx</footer>
  </main>;
}

function Panel({title,children}:{title:string,children:React.ReactNode}) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}
function Table({headers,children}:{headers:string[],children:React.ReactNode}) {
  return <div className="tablewrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
