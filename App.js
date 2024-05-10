var mysql = require('mysql');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project1'
});

con.connect(function(err) {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log("connected to database");
});

// Admin Panel Show
// Login    
// Assign Task
// app.get('/', function(req, res) {
//     res.render('Admin');    
// });

app.get('/admin/Login', function(req, res) {
    res.render('AdminLogin');    
});



var adminid;

app.post('/admin/Login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var query = "SELECT * FROM admin WHERE email = '"+email+"' AND password = '"+password+"'";
    con.query(query, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            console.log("User logged in successfully");
            console.log(result[0]);
            adminid = result[0].id;
            res.redirect('/admin/TaskManage'); // Redirect to admin task management page
        } else {
            console.log("Invalid email or password");
            res.redirect('/admin/Login');
        }
    });
});

// app.get('/admin/TaskManage', function(req, res) {
//     res.render('Admin');    
// });

// Assign Task By Admin
app.post('/admin/TaskManage', function(req, res) {
    var userId = req.body.userid;
    var taskName = req.body.task_name;
    var description = req.body.description;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;

    // Assuming you have a 'tasks' table in your database
    var query = "INSERT INTO tasks (user_id, task_name, description, start_date, end_date) VALUES ('"+userId+"', '"+taskName+"', '"+description+"', '"+startDate+"', '"+endDate+"')";
    con.query(query, function(err, result) {
        if (err) {
            console.error("Error adding task: ", err);
            // Handle error appropriately, maybe render an error page
            res.send("Error adding task");
        } else {
            console.log("Task added successfully");
            // Redirect back to the admin task management page after adding the task
            
            res.redirect('/admin/TaskManage');
            // console.log(result);
        }
    });
});


app.get('/admin/update/:id', function(req, res) {
    var id = req.params.id;
    var updateQuery = "SELECT * FROM tasks WHERE task_id = '"+id+"' ";
    con.query(updateQuery, function(err, result) {
        if (err) {
            console.error("Error fetching task details for update: ", err);
            res.send("Error fetching task details for update");
        } else {
            if (result.length > 0) {
                // Extract task details from the result
                var taskDetails = result[0];
                
                // Render the update form with pre-filled data
                res.render('UpdateTask', { task: taskDetails });
            } else {
                res.send("Task not found");
            }
        }
    });
});

app.post('/admin/update/:id', function(req, res) {
    var id = req.params.id;
    var task_name = req.body.task_name;
    var description = req.body.description;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    
    // Construct the update query
    var updateQuery = "UPDATE tasks SET task_name = '"+task_name+"', description = '"+description+"', start_date = '"+start_date+"', end_date = '"+end_date+"' WHERE task_id = '"+id+"'";
    con.query(updateQuery, function(err, result) {
        if (err) {
            console.error("Error updating task:", err);
            res.send("Error updating task");
        } else {
            console.log("Task updated successfully:", result);
            res.redirect('/admin/TaskManage'); // Redirect to task management page
        }
    });
});


var adminname;
app.get('/admin/TaskManage', function(req, res) {
    // Assuming you have a 'tasks' table in your database
    var query = "SELECT tasks.*, users.username FROM tasks INNER JOIN users ON tasks.user_id = users.user_id";
    var queryUsers = "SELECT * FROM users";
    var queryAdmin = "SELECT name FROM admin where id = '"+adminid+"'"

    con.query(query, function(err, result) {
        if (err) {
            console.error("Error fetching tasks: ", err);
            // Handle error appropriately, maybe render an error page
            res.send("Error fetching tasks");
        } else {
            console.log(result);
            console.log("Tasks fetched successfully");
            // Pass the fetched tasks to the EJS template for rendering
            con.query(queryUsers, function(err, users) {
                if (err) {
                    console.error("Error fetching users: ", err);
                    res.send("Error fetching users");
                } else {
                    con.query(queryAdmin, function(err, adminrecord) {
                        if (err) {
                            console.error("Error fetching users: ", err);
                            res.send("Error fetching users");
                        } else {
                             adminname = adminrecord
                            res.render('Admin', { task: result, users: users ,adminname : adminname});
                        }
                    });
                }
            });
            
        }
    });
});

app.get('/admin/delete/:id', function(req, res) {
    var id = req.params.id;
    var deletequery = "DELETE FROM tasks WHERE task_id = '"+id+"' ";
    con.query(deletequery, function(err, result) {
        if (err) throw err;

        console.log(result);
        res.redirect('/admin/TaskManage');
    });
});



app.post('/admin/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var checkQuery = "SELECT * FROM admin WHERE email = '"+email+"'";
    con.query(checkQuery, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            // Email already exists, handle accordingly (e.g., show an error message)
            console.log("Email already exists");
            res.redirect('/'); // Redirect to signup page or show an error message
        } else {
            // Email doesn't exist, proceed with insertion
            var insert = "INSERT INTO admin (name, email, password) VALUES ('"+name+"', '"+email+"', '"+password+"')";
            con.query(insert, function(err, result) {
                if (err) throw err;
                console.log("Admin Added successfully");
                res.redirect('/admin/TaskManage');
            });
        }
    });
});

app.get('/admin/register',function(req,res){
    res.render('AddAdmin' , { adminname : adminname});
})


// User Side 
// 1.Register Signup 
// 2.Login
// 3.Task Table Show
app.get('/user/signup',function(req,res){
    res.render('Register')
})

app.post('/user/signup', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var checkQuery = "SELECT * FROM users WHERE email = '"+email+"'";
    con.query(checkQuery, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            // Email already exists, handle accordingly (e.g., show an error message)
            console.log("Email already exists");
            res.redirect('/'); // Redirect to signup page or show an error message
        } else {
            // Email doesn't exist, proceed with insertion
            var insert = "INSERT INTO users (username, email, password) VALUES ('"+name+"', '"+email+"', '"+password+"')";
            con.query(insert, function(err, result) {
                if (err) throw err;
                console.log("User signed up successfully");
                res.redirect('/user/login');
            });
        }
    });
});



app.get('/user/login',function(req,res){
    res.render('Login')
})
// var datas;
var datas;

app.post('/user/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var query = "SELECT * FROM users WHERE email = '"+email+"' AND password = '"+password+"'";
    con.query(query, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            console.log("User logged in successfully");
            console.log(result[0]);
            datas = result[0].user_id;
            res.redirect('/user/TaskSide');
        } else {
            console.log("Invalid email or password");
            res.redirect('/user/login');
        }
    });
});

app.get('/user/TaskSide',function(req,res){
    // res.render('TaskShowPage',{datas})
    var query = "SELECT * FROM tasks where user_id = '"+datas+"'";
    var queryUsers = "SELECT * FROM users where user_id = '"+datas+"' ";
    con.query(query, function(err, result) {
        if (err) {
            console.error("Error fetching tasks: ", err);
            // Handle error appropriately, maybe render an error page
            res.send("Error fetching tasks");
        } else {
            console.log("Tasks fetched successfully");
            // Pass the fetched tasks to the EJS template for rendering
            console.log(result);
            con.query(queryUsers, function(err, users) {
                if (err) {
                    console.error("Error fetching users: ", err);
                    res.send("Error fetching users");
                } else {
                    console.log(users[0]);
                    res.render('TaskShowPage', { task: result, users : users });
                }
            });
            
        }
    });
  
})

app.listen(4000, function() {
    console.log("Server is running on port 4000");
});
