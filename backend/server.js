import express from "express";
import { PrismaClient } from "@prisma/client";

// @prisma/client is an auto-generated and type-safe database client created for your schema.
//When you run: npx prisma generate
//The Prisma Client is an auto-generated database client (library) that Prisma builds for you, based on your schema.prisma

const app=express();
//new PrismaClient() creates an instance
//you are creating a connection manager to your database.
const prisma = new PrismaClient();

app.use(express.json());
// It tells Express (your web server framework) to use the built-in middleware express.json().
// This middleware automatically parses incoming request bodies that are in JSON format.
// After parsing, it attaches the result to req.body

app.post("/users",async (req,res)=>{
    try{
        const {name,email,phone}=req.body

        if(!name || !email || !phone){
            return res.status(400).json({error:"This is a required feild"})
        }

        const user=await prisma.User.create({
            data:{
                name,
                email,
                phone
            },
        });
        res.status(201).json(user)


    }
    catch(err){
    if (err.code === "P2002") {
        return res.status(409).json({ error: "Email already exists" });
    }
    //P2002 is a Prisma error code ,it means Unique constraint failed on the database.

        console.log(err)
        res.status(500).json({error:"Internal server error"})

    }
})

app.get("/users/:id",async(req,res)=>{
    try{
        const {id}=req.params
        const userId=parseInt(id,10)
        if(isNaN(userId)){
            return res.status(400).json({error:"User Id must be a number"})
        }
        const user=await prisma.User.findUnique({
            where:{user_id:userId}
        })

        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        return res.status(200).json(user);

    }
    catch(err){
        console.log(err)
        return res.status(500).json({error:"Internal server error"})
    }
})
app.post("/groups",async (req,res)=>{
    try{
        const {name,description,created_by}=req.body

        if(!name || !description|| !created_by){
            return res.status(400).json({error:"This is a required feild"})

        }
        const user=await prisma.User.findUnique({
            where:{user_id:created_by}
        })
        if(!user){
            return res.status(404).json({ error: "No such user found" });
        }
        const group=await prisma.Group.create({
            data:{
                name,
                description,
                created_by
            }
        })
    return res.status(201).json(group);
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ error: "Internal server error" });
    }
})

app.post("/groups/:id/members",async(req,res)=>{
    try{
        const {id} = req.params;
        const {user_id}=req.body
        const groupId = parseInt(id, 10);

        if(isNaN(groupId)){
            return res.status(400).json({error:"Invalid group id"})
        }
        if(!user_id){
            return res.status(400).json({error:"User id is required"})
        }

        const group=await prisma.Group.findUnique({
            where:{group_id:groupId}
        })

        if(!group){
            res.status(404).json({error:"No such group exists"})
        }

        const user=await prisma.User.findUnique({
            where:{user_id:user_id}
        })

        if(!user){
            res.status(404).json({error:"No such user exists"})
        }
        const member=await prisma.GroupMember.create({
            data:{
                group_id: groupId,
                user_id: user_id,
            }
        })
        return res.status(201).json(member);


    }
    catch(err){
    if (err.code === "P2002") {
      return res.status(409).json({ error: "User already in this group" });
    }
    console.log(err)
    return res.status(500).json({ error: "Internal server error" });

    }
})

app.post("/expenses", async (req, res) => {
  try {
    const { group_id, paid_by, amount, description } = req.body;

    if (!group_id || !paid_by || !amount) {
      return res.status(400).json({ error: "group_id, paid_by, and amount are required" });
    }

    const group = await prisma.group.findUnique({
      where: { group_id:group_id },
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: paid_by },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const expense = await prisma.expense.create({
      data: {
        group_id,
        paid_by,
        amount,
        description,
      },
    });

    return res.status(201).json(expense);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});