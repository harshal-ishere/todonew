//jshint esversion:6

const express = require("express");  //to aquire the express module we write this!
const mongoose = require("mongoose"); //to aquire the mongoose module we write this!

mongoose.connect("mongodb+srv://harshal011k:b4icunokmidown@cluster0.zb6frrt.mongodb.net/todolistDB"); //this line is use to connect to the mongodb server to the port 27017 and make a new database todolist

const app = express();  //to get the express functions into the app 

app.set('view engine', 'ejs');  //to enable the ejs engine

app.use(express.urlencoded()); //a middleware used to make possible the transfer of the post request data in form to the server.
app.use(express.static("public"));  //to get excess the other files like .css .js as they should be in public folder these files are static here

const itemSchema = {     //a schema is created as it is like the 1st coloumn in the table where the structure of any table is ready.
  name: String  //in schema the column variable is been assigned ta datatype
}; //we can assign as much as column variable we want.

const listSchema = {
  name: String,
  items: [itemSchema]  //here as they have created the schema and assigined a variable the datatype here is been assigned is the itemSchema whole js object in to the array
};

const Item = mongoose.model("Item", itemSchema);  //here as the structure was ready now the structure is been ready it is given a name as it should identify itself among other models

const List = mongoose.model("List", listSchema);

const item0 = new Item({  //now the values are stored in the assigned model as in sense in of the table new data column is been added.
  name: "Buy Food"
});
const item1 = new Item({
  name: "Cook Food"
});
const item2 = new Item({
  name: "Eat Food"
});

//if item0.save() is written then the value is now been saved in the particular model.
let defaultItem = [item0, item1, item2];


app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {

        Item.insertMany(defaultItem)
          .then(function () {
            console.log("added db");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function (req, res) {
  const newitem = req.body.newItem;
  const newlist = req.body.list;

  const item = new Item({
    name: newitem
  });
  if (newlist === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: newlist })
      .then((foundList) => {
        if (foundList) {
          foundList.items.push(item)
          foundList.save()
          res.redirect("/" + newlist)
        }
        else {
          const newList = new List({
            name: newlist,
            items: [item],
          });
          newList.save();
          res.redirect("/" + newlist)
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});


app.post("/delete", (req, res) => {
  let checkedItemId = req.body.checkBox;
  let listName=req.body.listName;
  if(listName="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(()=>{
      console.log("yess");
      res.redirect("/");
    })
    .catch((err)=>{
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(()=>{
      console.log("yess");
      res.redirect("/"+listName);
    })
    .catch((err)=>{
      console.log(err);
    });
  }




  // Item.deleteOne({ _id: checkedItemId })
  //   .then(() => {
  //     console.log("deleted");
  //     res.redirect("/");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});


app.get("/:address", (req, res) => {
  customListName = req.params.address;

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          listName: defaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })

      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
