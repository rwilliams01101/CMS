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
        employeeArray.push((res[i].id + ' ' + res[i].firstName + ' ' + res[i].lastName))
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
        name: 'firstName'
      },
      {
        type: 'input',
        message: 'Please enter the employee LAST NAME',
        name: 'lastName'
      },
      {
        type: 'input',
        message: 'SELECT the employee ROLE ID',
        name: 'roleId'
      },
      {
        type: 'input',
        message: "Enter the employee's MANAGER ID",
        name: 'managerId'
      },
    ]
  )
  .then(function({ firstName, lastName, roleId, managerId }){
    connection.query(
      'INSERT INTO employee SET ?',
      {
        firstName: firstName,
        lastName: lastName,
        roleId: roleId,
        managerId: managerId,
      },
      function(err,res) {
        if (err) throw err;
        console.log(res.affectedRows + ' Employee created \n')
        employeeArray.push(JSON.stringify(firstName + ' ' + lastName))
        console.log(employeeArray)

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
    },
    start()
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
  },
    start() 
  )
}

function viewEmployee(){
  // console.log('Viewing all employees \n');
  connection.query(
    'SELECT * FROM employee',
    function(err, response){
      if (err) throw err;
      console.log('\n')
      console.table(response)
      // employeeArray.push(res.firstName)
    },
    start() 

  )
    
}

//                                                     RETURN TO MAIN MENU OR CONTINUE UPDATING EMPLOYEE INFO

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
    // console.log('Updating employee info \n')
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
      name: 'updatedFirstName',
      when: function(answer){
        return answer.updateChoice === 'First Name'
      }
    },
    {
      type: 'input',
      message: 'Enter the updated LAST name',
      name: 'updatedLastName',
      when: function(answer){
        return answer.updateChoice === 'Last Name';
      }
    },
    {
      type: 'input',
      message: 'Enter the update ROLE ID',
      name: 'updatedRoleId',
      when: function(answer){
        return answer.updateChoice === 'Role ID';
      }
    },
    {
      type: 'input',
      message: 'Enter the updated MANAGER ID',
      name: 'updatedManagerId',
      when: function(answer){
        return answer.updateChoice === 'Manager ID';
      }
    },
  ]).then(function(answer){
    console.log(answer)

    switch(answer.updateChoice){

      case 'First Name':
        // console.log('NOW IN FIRST NAME SWITCH CASE')
           connection.query(
          'UPDATE employee SET ? WHERE ?',
          [
            {
              firstName: answer.updatedFirstName,  
            },
            {
              id: employeeArray.indexOf(firstName)
            }
  
          ],
          function(err, res) {
            if (err) throw err;
            // console.log(res.affectedRows + 'Employee FIRST name updated \n')
          },
          returnPrompt()        
        )
        break

      case 'Employee LAST name':
        connection.query(
          'UPDATE employee SET ? WHERE ?',
          {
            lastName: updatedLastName,
          },
          function(err) {if (err) throw err;
            console.log('Updated Employee LAST name \n')
            returnPrompt()          
          }
        )
        break
      
      case 'Employee ROLE ID':
      connection.query(
        'UPDATE employee SET ? WHERE ?',
        {
          roleId: updatedRoleId,
        },
        function(err) {if (err) throw err;
          console.log('Updated Employee ROLE ID \n')
          returnPrompt()        
        }
      )
      break
    
      case 'Employee MANAGER ID':
        connection.query(
          'UPDATE employee SET ? WHERE ?',
          {
            managerId: updatedManagerId,
          },
          function(err) {if (err) throw err;
            console.log('Updated Employee MANAGER ID \n')
            returnPrompt()          
          }
        )
        break

        case 'EXIT EMPLOYEE UPDATE MENU':
          returnPrompt()                
        break      
    }
  })  
}