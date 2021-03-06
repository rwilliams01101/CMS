var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: process.env.PORT || 3306,

    // Your username
    user: "root",

    // Your password
    password: "TqV9z!0snR",
    database: "cms_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  start();
});

const employeeArray = []

const questions = [
  {
    type: 'list',
    message: 'What would you like to do?',
    choices: 
    [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add Department',
      'Add Role',
      'Add Employee',
      'Update Employee',
      'EXIT'
    ],
    name: 'task'
  },
]

function popData(){
  connection.query(
    'SELECT * FROM employee',
    function(req, res){
      for (var i = 0; i < res.length; i++) {
        employeeArray.push((res[i].id + ' ' + res[i].first_name + ' ' + res[i].last_name))
      }
      // console.log(employeeArray)
    }
  )  
}

//                                                                          START FUNCTION
function start(){
  popData()

  inquirer
  .prompt(questions)
  .then(function(answers){
  
  switch(answers.task){
    case 'View All Departments':
      viewDepartment();
    break

    case 'View All Roles':
      viewRole();
    break

    case 'View All Employees':
      viewEmployee();
    break

    case 'Add Department':
      addDepartment();
    break

    case 'Add Role':
      addRole();
    break

    case 'Add Employee':
      addEmployee();
    break

    case 'Update Employee':
      pickEmployeeToUpdate();
    break

    case 'EXIT':
    process.exit(-1);
  }
})
}


//                                                                          ADD DEPARTMENT
function addDepartment() {
  // console.log('Creating new department')

  inquirer
  .prompt(
    [
      {
        type: 'input',
        message: 'Please enter the ID of the new department',
        name: 'id'
      },
      {
        type: 'input',
        message: 'Enter the name of the new department',
        name: 'name'
      },
    ]
  )
  .then(function({ id, name }){
    connection.query(
      'INSERT INTO department SET ?',
      {
        id: id,
        name: name
      },
      function(err, response) {
        if (err) throw err;
        console.log(response.affectedRows + 'NEW DEPARTMENT \n');

        start()
      }
    )
  },
  )
}

//                                                                            ADD ROLE
function addRole(){
  // console.log('Creating a new role');
  inquirer
  .prompt(
    [
      {
        type: 'input',
        message: 'Please enter ID for the new role',
        name: 'id'
      },
      {
        type: 'input',
        message: 'Enter the TITLE of the new role',
        name: 'title'
      },
      {
        type: 'input',
        message: 'Please enter the SALARY',
        name: 'salary'
      },
      {
        type: 'input',
        message: 'Enter the DEPARTMENT ID',
        name: 'department_id'
      }
    ]
  )
  .then(function({ id, title, salary, department_id }){
    connection.query(
      'INSERT INTO role SET ?',
      {
        id: id,
        title: title,
        salary: salary,
        department_id: department_id,
      },
      function(err, response) {
        if (err) throw err;
        console.log(response.affectedRows + ' NEW ROLE CREATED \n');
        start()
      }
    )
  })
}

//                                                                         ADD EMPLOYEE
function addEmployee(){
  console.log('Creating a new employee');

  inquirer
  .prompt(
    [
      {
        type: 'input',
        message: 'Enter the employee FIRST NAME',
        name: 'first_name'
      },
      {
        type: 'input',
        message: 'Please enter the employee LAST NAME',
        name: 'last_name'
      },
      {
        type: 'input',
        message: 'SELECT the employee ROLE ID',
        name: 'role_id'
      },
      {
        type: 'input',
        message: "Enter the employee's MANAGER ID",
        name: 'manager_id'
      },
    ]
  )
  .then(function({ first_name, last_name, role_id, manager_id }){
    connection.query(
      'INSERT INTO employee SET ?',
      {
        first_name,
        last_name,
        role_id,
        manager_id,
      },
      function(err,res) {
        if (err) throw err;
        console.log(res.affectedRows + ' Employee created \n')
        employeeArray.push(JSON.stringify(first_name + ' ' + last_name))
        console.table(employeeArray)

        start()
      },
    )
  })
}

//                                                                              VIEW TABLES

function viewDepartment(){
  // console.log('Selecting all departments \n');
  connection.query(
    "SELECT * FROM department",
    function(err, response) {
      if (err) throw err;
      console.log('\n')
      console.table(response)     
      mainMenu()
    },
  );
}

function viewRole(){
  // console.log('Selecting all roles \n');
  connection.query(
    'SELECT * FROM role',
    function(err, response) {
      if (err) throw err;
      console.log('\n')
      console.table(response)
      mainMenu() 
    },
  );
}

function viewEmployee(){
  // console.log('Viewing all employees \n');
  connection.query(
    'SELECT * FROM employee',
    function(err, response){
      if (err) throw err;
      console.log('\n')
      console.table(response)
      // employeeArray.push(res.first_name)
      mainMenu() 
    },
  );
}

//                                                     RETURN TO MAIN MENU OR CONTINUE UPDATING EMPLOYEE INFO

function mainMenu(){
  inquirer
  .prompt([
    {
      type: 'confirm',
      message: 'Return to MAIN MENU',
      name: 'returnConfirm'
    }
  ]).then(function({returnConfirm}){
    if (returnConfirm){
      start()
    } else {
      process.exit(-1);
    }
  })
}

function returnPrompt(){
    inquirer
    .prompt([
    {
      type: 'list',
      message: 'RETURN TO MAIN MENU?',
      choices:
      [
        'YES, Go to the MAIN MENU',
        'NO, Take me back to the UPDATE EMPLOYEE MENU'
      ],
      name: 'exitUpdateMenu'
    }
  ])
    .then(function({ exitUpdateMenu }){
      if (exitUpdateMenu === 'YES, I am finished UPDATING employee information'){
        start()
      } else {
        pickEmployeeToUpdate()
      }    
    }
  )
}


//                                                                  UPDATE EMPLOYEE INFORMATION
function pickEmployeeToUpdate(){
  // console.log('Updating employee info \n')
  inquirer
  .prompt([    
    {
      type: 'list',
      message: 'Select an employee to update',
      name: 'employeeToUpdate',
      choices: employeeArray,
    }
  ]).then(function({employee}){
    updateEmployee(employee)
  }

  )
}

function updateEmployee(){
  inquirer
  .prompt([   
    {
      type: 'list',
      message: 'Select what you want to UPDATE',
      name: 'updateChoice',
      choices: [
        'First Name',
        'Last Name',
        'Role ID',
        'Manager ID'
      ]      
    },    
    {
      type: 'input',
      message: 'Enter the updated FIRST name',
      name: 'newFirstName',
      when: function(answer){
        return answer.updateChoice === 'First Name'
      }
    },
    {
      type: 'input',
      message: 'Enter the updated LAST name',
      name: 'newLastName',
      when: function(answer){
        return answer.updateChoice === 'Last Name';
      }
    },
    {
      type: 'input',
      message: 'Enter the update ROLE ID',
      name: 'newRoleID',
      when: function(answer){
        return answer.updateChoice === 'Role ID';
      }
    },
    {
      type: 'input',
      message: 'Enter the updated MANAGER ID',
      name: 'newManagerID',
      when: function(answer){
        return answer.updateChoice === 'Manager ID';
      }
    }
  ]).then(function(answer){

    switch(answer.updateChoice){

      case 'First Name':
        console.log('First Name Updated!')
        mainMenu()
        break

      case 'Last Name':
        console.log('Last Name Updated!')
        mainMenu()
        break
      
      case 'Role ID':
        updateEmployeeRoleQuestion();
      break
    
      case 'Manager ID':
        console.log('Manager ID Updated!')
        mainMenu()
        break

        case 'EXIT EMPLOYEE UPDATE MENU':
          returnPrompt()                
        break      
    }
  })  
}

function updateEmployeeRoleQuestion() {
  inquirer
  .prompt([
{
  type: "input",
  message: "Select which Employee you'd like to make updates to (enter their ID number)",
  name: "id"
},
{
  type: "input",
  message: "Enter the role you'd like the employee to have now (enter the role ID number)",
  name: "role_id"
}
  ])
  .then(function (answers) {
          updateEmployeeRole(connection, answers.role_id, answers.id);
  })
}

function updateEmployeeRole(connection, role_id, id) {
  console.log("Updating employee role...\n");
  var query = connection.query(
    "UPDATE employee SET ? WHERE ?",
    [
      {
        role_id: role_id
      },
      {
        id: id
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " Role Updated!\n");
      mainMenu();
    }
  )
}