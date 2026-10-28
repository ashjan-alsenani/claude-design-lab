import{j as o}from"./visuals-C592Vphl.js";import{M as l}from"./Markdown-DrRBtGu-.js";function $(e){if(/\\begin\{/.test(e))return e;const r=[];let n=0,s="";for(let t=0;t<e.length;t++){const i=e[t];i==="{"||i==="("||i==="["?n++:(i==="}"||i===")"||i==="]")&&n--,i==="="&&n===0&&e[t-1]!=="\\"&&e[t-1]!=="<"&&e[t-1]!==">"&&e[t-1]!=="!"?(r.push(s),s=""):s+=i}return r.push(s),r.length<3?e:`\\begin{aligned}${r[0].trim()} &= ${r.slice(1).map(t=>t.trim()).join(" \\\\[4pt] &= ")}\\end{aligned}`}const p=({children:e})=>o.jsx(l,{children:e.replace(/\$\$([\s\S]+?)\$\$/g,(r,n)=>`

$$
${$(n.trim())}
$$

`)});export{p as M};
