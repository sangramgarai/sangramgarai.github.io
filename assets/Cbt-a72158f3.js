import{D as c,N as u,m as i,n as r}from"./App-6ec6889a.js";import{r as s,j as e}from"./jsx-runtime-437b9e56.js";const _=s.lazy(()=>r(()=>import("./ELogin-20777f4f.js"),["assets/ELogin-20777f4f.js","assets/jsx-runtime-437b9e56.js"])),x=s.lazy(()=>r(()=>import("./Instruction-94237d61.js"),["assets/Instruction-94237d61.js","assets/jsx-runtime-437b9e56.js","assets/Instruction-e60895d7.css"])),p=s.lazy(()=>r(()=>import("./Exam-c4e1273a.js"),["assets/Exam-c4e1273a.js","assets/jsx-runtime-437b9e56.js","assets/entry-57b4587a.js","assets/App-6ec6889a.js","assets/App-7fad6038.css","assets/Exam-b8cac28a.css"])),j=s.lazy(()=>r(()=>import("./Result-16f800f7.js"),["assets/Result-16f800f7.js","assets/jsx-runtime-437b9e56.js","assets/App-6ec6889a.js","assets/App-7fad6038.css","assets/Stack-617d5bcc.js","assets/TableRow-a1acaeb2.js"])),E=s.lazy(()=>r(()=>import("./Evaluation-22777c77.js"),["assets/Evaluation-22777c77.js","assets/jsx-runtime-437b9e56.js","assets/entry-57b4587a.js","assets/App-6ec6889a.js","assets/App-7fad6038.css","assets/Stack-617d5bcc.js"]));function f(){const{appData:n,editAppData:d}=s.useContext(c),[t,o]=s.useState(n),a=l=>{o(l)};switch(t.page){case"login":return e.jsx(s.Suspense,{fallback:e.jsx(i,{}),children:e.jsx(_,{i:t,e:a})});case"instruction":return e.jsx(s.Suspense,{fallback:e.jsx(i,{}),children:e.jsx(x,{i:t,e:a})});case"exam":return e.jsx(s.Suspense,{fallback:e.jsx(i,{}),children:e.jsx(p,{i:t,e:a})});case"result":return e.jsx(s.Suspense,{fallback:e.jsx(i,{}),children:e.jsx(j,{i:t,e:a})});case"evaluation":return e.jsx(s.Suspense,{fallback:e.jsx(i,{}),children:e.jsx(E,{i:t,e:a})});default:return e.jsx(u,{to:"/"})}}export{f as default};
