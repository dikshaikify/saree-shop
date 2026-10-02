import express from "express";
import cors from "cors";

const app=express(), PORT=process.env.PORT||5000;
app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173"}));
app.use(express.json());

const categories=["Banarasi","Kanjivaram","Chanderi","Organza","Cotton","Linen","Georgette","Mysore Silk","Paithani","Handloom","Designer","Wedding"];
const fabrics=["Silk","Cotton","Organza","Chanderi","Linen","Georgette"];
const colors=["Red","Blue","Green","Pink","Purple","Black","White","Gold","Orange","Yellow","Maroon","Teal"];
const occasions=["Wedding","Festive","Party","Office","Casual","Reception"];

const sareePhotos=[
  "https://images.unsplash.com/photo-1736374143053-cb070a404533?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621786030484-4c855ecd48d6?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593032457867-611dfc1d89c4?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606166325683-0f722a7d53a6?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544441893-675973e31985?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=85&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=85&w=1000&auto=format&fit=crop"
];
function photo(i,slot=0){ return sareePhotos[(i*3+slot)%sareePhotos.length]; }

const templates=[
 ["Royal Banarasi Zari Saree","Banarasi","Silk"],["Temple Kanjivaram Silk Saree","Kanjivaram","Silk"],
["Chanderi Heritage Weave Saree","Chanderi","Chanderi"],["Pearl Organza Saree","Organza","Organza"],
["Everyday Handloom Cotton Saree","Cotton","Cotton"],["Natural Linen Saree","Linen","Linen"],
["Soft Georgette Drape Saree","Georgette","Georgette"],["Mysore Silk Classic Saree","Mysore Silk","Silk"],
["Royal Paithani Saree","Paithani","Silk"],["Artisan Handloom Saree","Handloom","Cotton"],
["Contemporary Designer Saree","Designer","Georgette"],["Bridal Heritage Saree","Wedding","Silk"]
];
const products=Array.from({length:120},(_,i)=>{
 const t=templates[i%templates.length], color=colors[i%colors.length], occasion=occasions[i%occasions.length];
 const price=2999+((i*1437)%42000), mrp=price+1800+((i*331)%5000);
 return {
 id:`SAR-${String(i+1).padStart(3,"0")}`, name:`${t[0]} — ${color}`, slug:`${t[0]}-${color}-${i+1}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
 category:t[1], fabric:t[2], color, occasion, price, mrp,
 discount:Math.round((1-price/mrp)*100), rating:Number((4.2+(i%8)/10).toFixed(1)),
 reviewCount:24+(i*19)%420, stock:4+(i*11)%50, featured:i<16||i%10===0, bestseller:i%7===0,
 description:`A beautifully finished ${color.toLowerCase()} ${t[1].toLowerCase()} saree with an elegant drape, refined detailing and a timeless Indian silhouette.`,
 images:[photo(i,0),photo(i,1),photo(i,2)]
 };
});

app.get("/api/health",(req,res)=>res.json({success:true,products:products.length}));
app.get("/api/filters",(req,res)=>res.json({success:true,categories,fabrics,colors,occasions}));
app.get("/api/products",(req,res)=>{
 let r=[...products], {search,category,fabric,color,occasion,minPrice,maxPrice,sort="featured",page=1,limit=24}=req.query;
 if(search){let q=String(search).toLowerCase();r=r.filter(p=>[p.name,p.category,p.fabric,p.color,p.occasion].join(" ").toLowerCase().includes(q))}
 if(category)r=r.filter(p=>p.category.toLowerCase()===String(category).toLowerCase());
 if(fabric)r=r.filter(p=>p.fabric.toLowerCase()===String(fabric).toLowerCase());
 if(color)r=r.filter(p=>p.color.toLowerCase()===String(color).toLowerCase());
 if(occasion)r=r.filter(p=>p.occasion.toLowerCase()===String(occasion).toLowerCase());
 if(minPrice)r=r.filter(p=>p.price>=Number(minPrice));
 if(maxPrice)r=r.filter(p=>p.price<=Number(maxPrice));
 if(sort==="price_asc")r.sort((a,b)=>a.price-b.price);
 if(sort==="price_desc")r.sort((a,b)=>b.price-a.price);
 if(sort==="rating")r.sort((a,b)=>b.rating-a.rating);
 if(sort==="newest")r=[...r].reverse();
 const total=r.length, pg=Math.max(1,Number(page)||1), lim=Math.min(48,Math.max(1,Number(limit)||12));
 res.json({success:true,data:r.slice((pg-1)*lim,pg*lim),pagination:{page:pg,limit:lim,total,totalPages:Math.ceil(total/lim)}});
});
app.get("/api/products/:slug",(req,res)=>{
 const p=products.find(x=>x.slug===req.params.slug);
 if(!p)return res.status(404).json({success:false,message:"Product not found"});
 res.json({success:true,data:p});
});
app.listen(PORT,()=>console.log(`SĀRI API http://localhost:${PORT} — ${products.length} products`));
