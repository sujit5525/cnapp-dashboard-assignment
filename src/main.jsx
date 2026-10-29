import React,{useMemo,useState} from "react";
import ReactDOM from "react-dom/client";
import {Provider,useDispatch,useSelector} from "react-redux";
import {configureStore,createSlice} from "@reduxjs/toolkit";
import {Search,Plus,X,RefreshCw,MoreVertical,Clock3,ChevronDown,Bell,SlidersHorizontal} from "lucide-react";
import "./styles.css";

const initialState={
 categories:[
  {id:"cspm",name:"CSPM Executive Dashboard",widgets:[
   {id:"c1",name:"Cloud Accounts",type:"cloud",text:"Connected (2)",value:"2"},
   {id:"c2",name:"Cloud Account Risk Assessment",type:"risk",text:"Failed (1689)",value:"9659"}
  ]},
  {id:"cwpp",name:"CWPP Dashboard",widgets:[
   {id:"w1",name:"Top 5 Namespace Specific Alerts",type:"empty",text:"No Graph data available!"},
   {id:"w2",name:"Workload Alerts",type:"empty",text:"No Graph data available!"}
  ]},
  {id:"registry",name:"Registry Scan",widgets:[
   {id:"r1",name:"Image Risk Assessment",type:"bar",text:"Total vulnerabilities",value:"1470"},
   {id:"r2",name:"Image Security Issues",type:"bar2",text:"Total images",value:"2"}
  ]}
 ]};

const slice=createSlice({name:"dashboard",initialState,reducers:{
 addWidget:(s,a)=>{const c=s.categories.find(x=>x.id===a.payload.categoryId); if(c)c.widgets.push(a.payload.widget)},
 removeWidget:(s,a)=>{const c=s.categories.find(x=>x.id===a.payload.categoryId); if(c)c.widgets=c.widgets.filter(w=>w.id!==a.payload.widgetId)}
}});
const store=configureStore({reducer:{dashboard:slice.reducer}});
const {addWidget,removeWidget}=slice.actions;

function Donut({kind}){return <div className={"donut "+kind}><div><b>{kind==="cloud"?"2":"9659"}</b><span>Total</span></div></div>}

function Widget({widget,categoryId}) {
 const dispatch=useDispatch();
 return <article className="widget">
  <button className="widget-x" onClick={()=>dispatch(removeWidget({categoryId,widgetId:widget.id}))}><X size={15}/></button>
  <h3>{widget.name}</h3>
  {widget.type==="cloud"&&<div className="chart-row"><Donut kind="cloud"/><div className="legend"><p><i className="blue"/>Connected (2)</p><p><i className="pale"/>Not Connected (2)</p></div></div>}
  {widget.type==="risk"&&<div className="chart-row"><Donut kind="risk"/><div className="legend risk-legend"><p><i className="red"/>Failed (1689)</p><p><i className="yellow"/>Warning (681)</p><p><i className="gray"/>Not available (36)</p><p><i className="green"/>Passed (7253)</p></div></div>}
  {widget.type==="empty"&&<div className="empty-chart"><div className="bars">▥</div><span>{widget.text}</span></div>}
  {(widget.type==="bar"||widget.type==="bar2")&&<div className="bar-content"><div><b>{widget.value}</b> <small>{widget.text}</small></div><div className={"stacked "+widget.type}><span/><span/><span/><span/></div><div className="mini-legend"><span>● Critical</span><span>● High</span><span>● Medium</span><span>● Low</span></div></div>}
 </article>
}

function AddWidgetModal({category,onClose}){
 const dispatch=useDispatch();
 const [active,setActive]=useState("CSPM");
 const [checked,setChecked]=useState({});
 const [name,setName]=useState("");
 const [text,setText]=useState("");
 const tabs=["CSPM","CWPP","Image","Ticket"];
 const available=category.widgets.map(w=>w.name);
 const add=()=>{if(!name.trim())return;dispatch(addWidget({categoryId:category.id,widget:{id:Date.now().toString(),name:name.trim(),type:"text",text:text.trim()||"Random widget content"}}));onClose()};
 return <div className="overlay">
  <aside className="drawer">
   <div className="drawer-head"><span>Add Widget</span><button onClick={onClose}><X/></button></div>
   <div className="drawer-body">
    <p className="drawer-copy">Personalise your dashboard by adding the following widget</p>
    <div className="tabs">{tabs.map(t=><button className={active===t?"active":""} onClick={()=>setActive(t)} key={t}>{t}</button>)}</div>
    <div className="checks">
     {available.map((w,i)=><label key={w}><input type="checkbox" checked={checked[i]||false} onChange={()=>setChecked({...checked,[i]:!checked[i]})}/><span>{w}</span></label>)}
    </div>
    <div className="custom-add">
      <h4>Add custom widget</h4>
      <input placeholder="Widget name" value={name} onChange={e=>setName(e.target.value)}/>
      <textarea placeholder="Widget text" value={text} onChange={e=>setText(e.target.value)}/>
    </div>
   </div>
   <div className="drawer-actions"><button className="cancel" onClick={onClose}>Cancel</button><button className="confirm" onClick={add}>Confirm</button></div>
  </aside>
 </div>
}

function Category({category,onAdd}) {
 return <section className="category">
  <h2>{category.name}</h2>
  <div className="widget-grid">
   {category.widgets.map(w=><Widget key={w.id} widget={w} categoryId={category.id}/>)}
   <button className="add-card" onClick={()=>onAdd(category)}><Plus size={17}/> Add Widget</button>
  </div>
 </section>
}

function App(){
 const categories=useSelector(s=>s.dashboard.categories);
 const [search,setSearch]=useState("");
 const [selected,setSelected]=useState(null);
 const visible=useMemo(()=>categories.map(c=>({...c,widgets:c.widgets.filter(w=>(w.name+" "+w.text).toLowerCase().includes(search.toLowerCase()))})),[categories,search]);
 return <div className="app">
  <header className="top">
   <div className="crumb">Home <b>›</b> <strong>Dashboard V2</strong></div>
   <div className="top-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search anything..."/></div>
   <div className="top-right"><span className="profile">Sujit</span><ChevronDown size={14}/><Bell size={16}/></div>
  </header>
  <main>
   <div className="heading-row"><h1>CNAPP Dashboard</h1><div className="actions">
    <button onClick={()=>setSelected(categories[0])}>Add Widget <Plus size={15}/></button><button><RefreshCw size={15}/></button><button><MoreVertical size={15}/></button><button><Clock3 size={15}/> Last 2 days <ChevronDown size={14}/></button>
   </div></div>
   {visible.map(c=><Category category={c} onAdd={setSelected} key={c.id}/>)}
  </main>
  {selected&&<AddWidgetModal category={selected} onClose={()=>setSelected(null)}/>}
 </div>
}
ReactDOM.createRoot(document.getElementById("root")).render(<Provider store={store}><App/></Provider>);