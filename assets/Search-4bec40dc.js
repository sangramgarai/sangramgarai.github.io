import{r as n,j as a}from"./jsx-runtime-437b9e56.js";import{D as u,ah as m,d as p,ai as g,aj as j,I as r,f,B as i,a5 as C,a4 as B,ak as k,al as I,e as v,X as c,ag as S,am as b}from"./App-6ec6889a.js";import{A as y}from"./ArrowBack-8b59c339.js";function T(){const{appData:l,editAppData:D}=n.useContext(u),[h]=m(),s=p(),[t,x]=n.useState(h.get("q")||""),o=e=>{x(e.target.value)};return a.jsxs(a.Fragment,{children:[a.jsx(g,{position:"sticky",children:a.jsxs(j,{children:[a.jsx(r,{size:"large",edge:"start",color:"inherit",onClick:()=>s(-1),children:a.jsx(y,{})}),a.jsx(r,{size:"large",edge:"start",color:"inherit",onClick:()=>s("/home"),children:a.jsx(f,{})}),a.jsxs(i,{sx:{position:"relative",borderRadius:1.5,width:"100%",backgroundColor:"#ffffff26","&:hover":{backgroundColor:"#ffffff40"},mx:{sm:5,lg:20}},children:[a.jsx(i,{sx:{pl:2,height:"100%",position:"absolute",display:"flex",alignItems:"center",justifyContent:"center"},children:a.jsx(C,{})}),a.jsx(B,{autoFocus:!0,sx:{color:"inherit","& .MuiInputBase-input":{pl:6,pr:1,py:1,width:"100%"},width:"100%"},value:t,placeholder:"Search…",onChange:o})]}),a.jsx(r,{color:"inherit",sx:{ml:1},onClick:()=>{s("/cart")},children:a.jsx(k,{badgeContent:l.uCartItems.length,color:"secondary",children:a.jsx(I,{})})})]})}),t===""?a.jsxs(a.Fragment,{children:[" ",["UGC","CSIR"].map(e=>a.jsx(v,{variant:"outlined",value:e,onClick:o,sx:{m:1,mr:0},children:e},e))," "]}):a.jsx(a.Fragment,{}),a.jsx(c,{container:!0,spacing:2,p:2,columns:{xs:1,sm:3,md:4,lg:5,xl:6},children:S.map((e,d)=>a.jsx(c,{item:!0,xs:1,children:a.jsx(b,{cId:e.id})},d))})]})}export{T as default};
