#! /usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';


// data structure to store customers information.
interface customer{
    name:string;
    cardnumber:string;
    pinnum:number;
    balance:number;
}

//to initialize an arary to store customer data.
let customers:customer[]=[];
//for each customer data in the array.
//global veriable to store the current cuustomer (if authenticatd)
let currentcustomer:customer|undefined=undefined;
//function to create a random new debit card number.
const genraterandomcardnum=()=>{
    const carddnumber=`4`+Array.from({length:15},()=>Math.floor(Math.random()*10)).join('');
    return carddnumber;
}
// function to open new account
const opennewaccount=async()=>{
    console.log(chalk.green(`Welom ATM`));
    const answer=await inquirer.prompt([
        {
        type:'input',
        name:'name',
        message:'Enter your name:',
        validate:(input)=>{
            //check if the name is already exist in customers .
        const exsistingcustomer=customers.find((c)=>c.name===input);
        if (exsistingcustomer) {
            return'name already exist chosse new name'
        }
        return true;

        },
    },
    {
        type:'input',
        name:`intialdeposit`,
        message:'Please enter intial deposit amount',

    },
    {
        type:'password',
        name:'pin',
        message:'please create 4 digit pin',
        validate:(input)=>{
            if (/^\d{4}$/.test(input)){
                return true;
            }
            return'4digit pin number';
        },
    },

]);
const newcustomer:customer={
    name:answer.name,
    cardnumber:genraterandomcardnum(),
    pinnum:parseInt(answer.pinnum,10),
    balance:parseFloat(answer.intialdeposit),
};
customers.push(newcustomer);
savecustomerdata(customers)
console.log(`A/c created: ${newcustomer.name}`);
console.log(`your debit card num:${newcustomer.cardnumber}`);
console.log(`your intial bal:${newcustomer.balance.toFixed(2)} pkr`);
currentcustomer=newcustomer;
 atmMenu();
}

// function to save customers data into json format

const savecustomerdata=(data:customer[])=>{
    const jsonData=JSON.stringify(data,null,2);
    fs.writeFileSync('customerdata.json',jsonData,'utf8');
}
//function to retrieve customer data from a JSON file.
const retrievecustomersdata=():customer[]=>{
    try{
        const jsonData=fs.readFileSync('customerdata.json','utf-8');
        return JSON.parse(jsonData);
    } catch (error){
        //if the file dosnt exist or is empty, return an empty array
        return[];
    }
}
// function to authenticate the user
const authonticateuser=async()=>{
    console.log(chalk.green('Welcome to ATM'));
    const answer=await inquirer.prompt([
        {
        type:'input',
        name:'name',
        message:'enter your name',

    },
]);
    const exsistingcustomer=customers.find((c)=>c.name===answer.name);
    if(exsistingcustomer) {
        const pinanswer=await inquirer.prompt([
        {
            type:'password',
            name:'pin',
            message:'Enter your 4 digit PIN',
            validate:(input)=>{
                if(/^\d{4}$/.test(input)){
                    return true;
                }
                return 'Pin must be 4 digit';
        },
    },
]);
    if(exsistingcustomer.pinnum===parseInt(pinanswer.pinnum,10))
      {
        currentcustomer=exsistingcustomer;
        atmMenu();
     }else{
        console.log(chalk.red(`authenticate failed pin incorrect`));
        console.log(`Please write again`);
        main();
    }
  } else{
    console.log(chalk.red(`Autheniticateion failed that you are not an existing customer`));
    console.log('Please open an acccount or try again.');
    main();
  }
}
// atm menu or functionalities
const atmMenu=async()=>{
    if(currentcustomer){
        console.log(`Welcome, ${currentcustomer.name}`);
        console.log(`debtit card Number: ${currentcustomer.cardnumber}`);
        console.log(`Balance: ${currentcustomer.balance.toFixed(2)}`);
        const answer=await inquirer.prompt([
            {
            type:"list",
            name:'choice',
            message:`please slect the options`,
            choices:['withdraw','Deposit amonut','check balance','Exist'],
        },
    ]);
        switch(answer.choice){
            case'withhdraw money':
            withdrawmoney();
            break;
            case 'deposit money':
            depositmoney(); 
            break;
            case 'Check Balance':
            console.log(`your current bal is : $${currentcustomer.balance.toFixed(2)}`);
            atmMenu();// return to the main menuafter checkingthe balance
            break;
            case 'Exist':
            console.log(`thanks for using our ATM `);
            break;
        }
    }
}
//implementation withdraw and deposit functionss here.
const withdrawmoney=async()=>{
    const answer=await inquirer.prompt([
        {
        type:'password',
        name:'pin',
        message:'please enter your pin 4 digit for withdraw',
        validate:(input)=>{
            if (/^\d{4}$/.test(input) && parseInt(input,10)===currentcustomer!.pinnum) {
                return true;
            }
            return 'failed pin in invalid'
        },
        
    },
    {
        type:'input',
        name:'account',
        message:'Enter Withdrawamount',
        validate:(input)=>{
            const amount=parseFloat(input);
            if (isNaN(amount)|| amount<=0|| amount>currentcustomer!.balance){
                return 'invalid amount.enter valid amonut';

            }
            return true;

        },

    },

]);
const withdrawlAmonut=parseFloat(answer.amonut);
currentcustomer!.balance -=withdrawlAmonut;
savecustomerdata(customers);
console.log(`withdrawl successful.New  balance:$${currentcustomer!.balance.toFixed(2)}`);
atmMenu();
}
const depositmoney=async()=>{
    const answer=await inquirer.prompt([
        {
        type:'input',
        name:'amount',
        message:'please enter the deposit amonut',
        validate:(input)=>{
            const amount=parseFloat(input)
            if (isNaN(amount)|| amount<=0) {
                return 'invalid amount pls enter valid amount';
            }
            return true;
        },
    },
]);
const depositAmount= parseFloat(answer.amonut);
currentcustomer!.balance+=depositAmount;
savecustomerdata(customers);
console.log(`Deposit succefully New bal is:$${currentcustomer!.balance.toFixed(2)}`);
atmMenu();
}
//entry point main function
const main=async()=>{
    customers=retrievecustomersdata();// load customers data from the json file
    const answer=await inquirer.prompt([
        {
        type:'list',
        name:'action',
        message:'Welcome to the action what would you like  to do?',
        choices:['open an account','Authenitace as Existing Customer','Exist'],
    },
]);
switch(answer.action){
    case'open an acccount':
    opennewaccount();
    break;
    case'Authenticate  as Existing Customer':
    authonticateuser();
    break;
    case 'Exist':
        console.log(('Existing AtM . Good bye'));
        break;
}
}
export {main}
main();

//console.log(genraterandomcardnum())



//opennewaccount()
