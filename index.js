import express from "express"
import bodyParser from "body-parser";
import pg from "pg"
const app=express()

const PORT=3000
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }));
const db=new pg.Client({
    user:'postgres',
    database:'memomaster',
    host:'localhost',
    password:'redhawk',
    port:5432
})
db.connect();
let lists=[]
async function getResponse(){
    const response=await db.query("SELECT * FROM posts");
    return response.rows
}

app.get("/",async(req,res)=>{
    lists=await getResponse()
    
    res.render("index.ejs",{lists:lists})
})

app.get("/add-post",(req,res)=>{
    res.render("post.ejs")
})
app.post("/add-post",async(req,res)=>{
    let title=req.body.title
    let body=req.body.body
    let date=new Date().toLocaleDateString('en-US');
    try{
        const response=await db.query("INSERT INTO posts (title,body,date) VALUES ($1,$2,$3)",[title,body,date]);
    }catch(err){
        console.log(err);
    }
    res.redirect("/");
})
app.get("/edit-post",async(req,res)=>{
    const id=req.query.editId;
    let post={};
    try{
        const response= await db.query("SELECT * FROM posts WHERE id=$1",[id]);
        post=response.rows[0];
    }
    catch(err){
        console.log(err);
    }
    console.log(post)

    res.render("edit.ejs",{post:post})
})
app.post("/edit-post",async(req,res)=>{
    const id=req.body.editId
    const title=req.body.title
    const body=req.body.content
    try{
        
        const response=await db.query("UPDATE posts SET title=$1,body=$2 WHERE id=$3",[title,body,id])
    }catch(err){
        console.log(err);
    }
    res.redirect("/")
})
app.post("/del-post",async(req,res)=>{
    const id=req.body.postId
    try{
        const response=await db.query("DELETE FROM posts WHERE id=$1",[id]);
    }catch(err){
        console.log(err);
    }
    res.redirect("/")
})
app.listen(PORT,(req,res)=>{
    console.log("App listening at port "+PORT);
})
