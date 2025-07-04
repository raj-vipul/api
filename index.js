const express = require("express")
const users = require("./MOCK_DATA.json")
const app = express();
const PORT = 8000;
const fs = require("fs");  //this is needed to write in file
const { stringify } = require("querystring");


//Middleware (this helps to save post/form data in body)
app.use(express.urlencoded({extended:false}))



//ROUTES


//if you want to return in html/list format then use this

app.get("/users", (req,res)=>{
    const list = `
    <ul>
        ${users.map((user) => `<li> ${user.first_name}</li>`).join("")}
    </ul>    
    `;
    res.send(list);
});


//REST API// 

app.get("/api/users", (req, res) => {
    return res.json(users);
});

//using id for dynamic path parameters
// as /api/users/ :id --here id is variable

//this will return only one user using (id)
app.get("/api/users/:id", (req,res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
});


//here the way to do multiple api calling in same routes--- as you can see patch and delete request are made at same route. 

app
    .route("/api/users/:id")

    // PATCH
    .patch((req,res) => {    
        const id = Number(req.params.id);
    const updatedData = req.body;

    // Find user by ID
    const idx = users.findIndex(user => user.id === id);
    if (idx === -1) {
        return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Update only the provided fields
    users[idx] = { ...users[idx], ...updatedData };

    // Save updated users array to file
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).json({ status: "failed", message: "Could not write file" });
        }

        return res.json({ status: "success", updatedUser: users[idx] });
    });
    })

    //DELETE
    .delete((req,res)=> {
        const id = Number(req.params.id);
        const delUser = users.find(user=>user.id==id);
        const idx= users.findIndex((user)=> user.id === id);

        if(idx==-1){
            return res.status(404).json({status:"error", message:"user not found"})
        }
        //remove user
        users.splice(idx,1);
        //save file
        fs.writeFile("./MOCK_DATA.json",JSON.stringify(users), (err)=>{
            if(err){
                return res.json({status:"failed"})
            }
            return res.json({status:"success", id:delUser.id, first_name: delUser.first_name})
     } );
       

    });


//POST 

app.post("/api/users", (req,res)=> {
    const body = req.body; // all the form/post data are sent in body
    users.push({...body, id : users.length+1});  // this will directly push posted data in file. 
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err)=> {
        return res.json({result:"success", id: users.length})
    });
    
});


app.listen(PORT,()=> console.log(`server started at port ${PORT}`))