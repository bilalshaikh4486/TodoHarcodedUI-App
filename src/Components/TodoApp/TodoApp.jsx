import React, { Component } from "react"
import {BrowserRouter as Router,Link,Route,Routes} from 'react-router-dom'
import withNavigation from "./WithNavigation";
import withParams from "./withParams";
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthenticationService from "./AuthenticationService.js";
import AuthenticatedRoute from "./AuthenticatedRoute.jsx"
import HelloWorldService from "../../api/todo/HelloWorldService";
import TodoDataService from "../../api/todo/TodoDataService";
import moment from 'moment';
import { Formik, Form, Field, ErrorMessage } from 'formik'

class TodoApp extends Component{
    render(){
        const LoginComponentWithNavigation = withNavigation(LoginComponent);
        const WelcomeComponentWithParams =  withParams(WelcomeComponent);
        const HeaderComponentWithNavigation = withNavigation(HeaderComponent);
        const TodoComponentWithParamsAndNavigation = withParams(withNavigation(TodoComponent))
        const ListTodosComponentwithNavigation = withNavigation(ListTodosComponent);
        return(
            <div className="TodoApp">
                <Router>
                    <HeaderComponentWithNavigation/>
                    <Routes>
                        <Route path="/" element={<LoginComponentWithNavigation />}/>
                        <Route path="/login" element={<LoginComponentWithNavigation />}/> 
                       {/* <Route path="/" exact element={<LoginComponent/>}/>
                        <Route path="/login" element={<LoginComponent/>}/>  //REACT 5*/} 
                        {/* <AuthenticatedRoute path="/welcome/:name" element={<WelcomeComponentWithParams/>}/> React 5 */}
                        <Route path="/welcome/:name" element={<AuthenticatedRoute><WelcomeComponentWithParams/></AuthenticatedRoute>} />
                        <Route path="*" element={<ErrorComponent/>}/>
                        {/* <AuthenticatedRoute path="/todos" element={<ListTodosComponent/>}/>
                        <AuthenticatedRoute path="logout" element={<LogoutComponent/>}/> React 5*/}
                        <Route path="/todos/:id" element={<AuthenticatedRoute><TodoComponentWithParamsAndNavigation></TodoComponentWithParamsAndNavigation></AuthenticatedRoute>} />
                        <Route path="/todos/" element={<AuthenticatedRoute><ListTodosComponentwithNavigation/></AuthenticatedRoute>} />
                        <Route path="/logout" element={<AuthenticatedRoute><LogoutComponent/></AuthenticatedRoute>} />
                    </Routes>
                    <FooterComponent/>
                </Router>
                {/* {<LoginComponent/>
                <WelcomeCompnent/>} */}
            </div>
        )
    }
}
class TodoComponent extends Component{
    constructor(props){
        super(props)
        this.state={
            id : this.props.params.id,
            description : '',
            targetDate : moment(new Date()).format("YYYY-MM-DD") 
        }
        this.validate= this.validate.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }
    componentDidMount(){
        if(this.state.id === -1){
            return
        }
        let username = AuthenticationService.getLoggedInUsername()
         TodoDataService.retrieveTodo(username, this.state.id)
            .then(response=> this.setState({
                description : response.data.description,
                targetDate : moment(response.data.targetDate).format('YYYY-MM-DD')
            }))
    }

    validate(values){
        let errors={}
        if (!values.description) {
            errors.description = 'Enter a Description'
        } else if (values.description.length < 5) {
            errors.description = 'Enter atleast 5 Characters in Description'
        }

        if (!moment(values.targetDate).isValid()) {
            errors.targetDate = 'Enter a valid Target Date'
        }
        return errors
    }
    onSubmit(values) {
        let username = AuthenticationService.getLoggedInUsername()

        let todo = {
            id: this.state.id,
            description: values.description,
            targetDate: values.targetDate
        }

        if (this.state.id === -1) {
            TodoDataService.createTodo(username, todo)
                .then(() => this.props.navigate('/todos')) //REACT-6
            //this.props.history.push('/todos')
        } else {
            TodoDataService.updateTodo(username, this.state.id, todo)
                .then(() => this.props.navigate('/todos'))//REACT-6
            //this.props.history.push('/todos')
        }

        console.log(values);
    }

    render() {

        let { description, targetDate } = this.state
        //let targetDate = this.state.targetDate

        return (
            <div>
                <h1>Todo</h1>
                <div className="container">
                    <Formik
                        initialValues={{ description, targetDate }}
                        onSubmit={this.onSubmit}
                        validateOnChange={false}
                        validateOnBlur={false}
                        validate={this.validate}
                        enableReinitialize={true}
                    >
                        {
                            (props) => (
                                <Form>
                                    <ErrorMessage name="description" component="div"
                                        className="alert alert-warning" />
                                    <ErrorMessage name="targetDate" component="div"
                                        className="alert alert-warning" />
                                    <fieldset className="form-group">
                                        <label>Description</label>
                                        <Field className="form-control" type="text" name="description" />
                                    </fieldset>
                                    <fieldset className="form-group">
                                        <label>Target Date</label>
                                        <Field className="form-control" type="date" name="targetDate" />
                                    </fieldset>
                                    <button className="btn btn-success" type="submit">Save</button>
                                </Form>
                            )
                        }
                    </Formik>

                </div>
            </div>
        )
    }
}

class HeaderComponent extends Component{
    render(){
        const isUserLoggedIn = AuthenticationService.isUserLoggedIn()
        //console.log(isUserLoogedIn);
        return(
           <header>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark">
                    <div><a href="http://www.bilal.com" className="navbar-brand">BilalPage</a></div>
                    <ul className="navbar-nav">
                        {isUserLoggedIn && <li><Link className="nav-link" to="/welcome/bilalblog">Home</Link></li>}
                        {isUserLoggedIn && <li><Link className="nav-link" to="/todos">Todos</Link></li>}
                    </ul>
                    <ul className="navbar-nav navbar-collapse justify-content-end">
                        <li><Link className="nav-link" to="/login">Login</Link></li>
                        {isUserLoggedIn && <li><Link className="nav-link" to="logout" onClick={AuthenticationService.logout}>Logout</Link></li>}
                    </ul>
                </nav>
           </header>
        )
    }
}

class FooterComponent extends Component{
    render(){
        return(
           <footer className="footer">
                <span className="text-muted">All Rights reserved 2023 @BilalCORP</span>
           </footer>
        )
    }
}
class LogoutComponent extends Component{
    render(){
        return(
            <>
                <h1>Your are Logged out</h1>
                <div className="container">Thank you Using this App</div>
            </>
        )
    }
}

class ListTodosComponent extends Component{
    constructor(props){
        super(props)
        this.state={
            todos : [],
            message : null
        }
        this.deleteTodoClicked = this.deleteTodoClicked.bind(this)
        this.updateTodoCllicked = this.updateTodoCllicked.bind(this)
        this.addTodoClicked = this.addTodoClicked.bind(this)
        this.refreshTodos = this.refreshTodos.bind(this)
    }
    componentWillUnmount(){
        console.log("Component will mount")
    }
    shouldComponentUpdate(nextProps, nextState){
        console.log("shouldComponentUpdate");
        console.log(nextProps)
        console.log(nextState)
        return true
    }

    componentDidMount() {
        console.log('componentDidMount')
        this.refreshTodos();
        console.log(this.state)
    }
    refreshTodos(){
        let username = AuthenticationService.getLoggedInUsername()
        TodoDataService.retrieverAlltodos(username)
        .then(
            response=>{
                console.log(response);
                this.setState({todos: response.data})
            }
        )
    }

    deleteTodoClicked(id) {
        let username = AuthenticationService.getLoggedInUsername()
        //console.log(id + " " + username);
        TodoDataService.deleteTodo(username, id)
            .then(
                response => {
                    this.setState({ message: `Delete of todo ${id} Successful` })
                    this.refreshTodos()
                }
            )

    }

    addTodoClicked(id){
        console.log('update'+ id)
        this.props.navigate(`/todos/-1`)
    }

    updateTodoCllicked(id){
        console.log('update'+ id)
        this.props.navigate(`/todos/${id}`)
    }

    render(){
        return(
            <div>
                <h1>List Todos</h1>
                <div className="container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Target Date</th>
                                <th>Is Completed?</th>
                                <th>Update</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.todos.map(
                                    todo =>
                                        <tr key={todo.id}>
                                            <td>{todo.description}</td>
                                            <td>{moment(todo.targetDate).format('YYYY-MM-DD')}</td>
                                            <td>{todo.done.toString()}</td>
                                            <td><button className="btn btn-success" onClick={()=>this.updateTodoCllicked(todo.id)}>Update</button></td>
                                            <td><button className="btn btn-success" onClick={()=>this.deleteTodoClicked(todo.id)}>Delete</button></td>
                                        </tr>
                                )
                            } 
                        </tbody>
                    </table>
                    <div className="row">
                            <button className="btn btn-success" onClick={this.addTodoClicked}>Add</button>
                    </div>
                </div>
            </div>
        )
    }
}

class WelcomeComponent extends Component{
    constructor(props){
        super(props)
        this.retrieveWelcomeMessage = this.retrieveWelcomeMessage.bind(this)
        this.handleSucessfulResponse = this.handleSucessfulResponse.bind(this)
        this.handleError = this.handleError.bind(this);
        this.state={
            welcomeMessage : '',
            errorMessage : '',
        }
    }
    render(){
        return (
            <> 
                <h1>Welcome!!!</h1>
                <div className="container">Welcome!! {this.props.params.name}. You can manage your todo schedule <Link to="/todos">here</Link> </div>  
                <div className="container">
                    Click here to get a Customized welcoome page
                    <button onClick={this.retrieveWelcomeMessage} >Get Welcome Message</button>
                </div>
                 <div className="container">
                    {console.log(this.state)}
                    {this.state.welcomeMessage}
                </div> 
                <div className="container">
                    {this.state.errorMessage}
                </div>
            </>
            )
    }
    retrieveWelcomeMessage(){
        //HelloWorldService.executeHelloWorldService()
        //HelloWorldService.executeHelloWorldBeanService()
        HelloWorldService.executeHelloWorldPathVariable(this.props.params.name)
        .then(response=>this.handleSucessfulResponse(response))
        .catch(error=> this.handleError(error))
    }
    handleSucessfulResponse(response){
        this.setState({welcomeMessage : response.data.message})
        console.log(this.state)
    }
    handleError(error){
        console.log(error.response)
        this.setState({welcomeMessage : error.response.data.message})
    }
}

function ErrorComponent(){
    return <div>Invalid Credentials pls contact support @9874563214789</div>
}

class LoginComponent extends Component{
    constructor(props){
        super(props)
        this.state = {
            username : 'adminuser',
            password : 'dummy',
            hasloginfailed : false,
            showsuccessmsg : false
        }
        this.handleChange = this.handleChange.bind(this)
        this.loginclicked = this.loginclicked.bind(this)
        // this.handleusernameChange =this.handleusernameChange.bind(this)
        // this.handlepasswordChange = this.handlepasswordChange.bind(this)
    }
    handleChange(event){
        //console.log(this.state);
        this.setState({[event.target.name]:event.target.value})
    }
    // handleusernameChange(event){
    //     console.log(event.target.value);
    //     this.setState({username:event.target.value})
    // }
    // handlepasswordChange(event){
    //     console.log(event.target.value);
    //     this.setState({password:event.target.value})
    // }

    loginclicked(){
        //hardcoded pass is dummy and username is adminuser
        if(this.state.username==='adminuser' && this.state.password === 'dummy'){
            AuthenticationService.registerSuccessfullLogin(this.state.username,this.state.password);
            console.log('success')
            this.props.navigate(`/welcome/${this.state.username}`);
            //this.props.history.push("/welcome")
           //this.setState({showsuccessmsg:true})
            //this.setState({hasloginfailed:false})
        }    
        else{
            console.log('Failed')
            this.setState({showsuccessmsg:false})
            this.setState({hasloginfailed:true})
        }
            //console.log('failed')
    }

    render(){
        return(
            <div> 
                <h1>Login</h1>
                    <div className="container">              
                    Username: <input type="text" name="username" value={this.state.username} onChange={this.handleChange}/>
                    Password: <input type="password" name="password" value={this.state.password} onChange={this.handleChange}/>
                    <p>Click on login to submit</p>
                    <div>
                        <button className="button" onClick={this.loginclicked}>Login</button>
                    </div>
                    <div>
                        {this.state.hasloginfailed && <div className="alert alert-warning">InValid Credentials</div>}
                        {this.state.showsuccessmsg && <div>Login Sucessfull</div>}
                        {/* {<ShowinvalidCreds hasloginfailed={this.state.hasloginfailed}/>} */}
                        {/* {<ShowSucceslogin showsuccessmsg={this.state.showsuccessmsg}/>} */}
                    </div>
                </div>
            </div>
        )
    }
}
// function ShowinvalidCreds(props){
//     if(props.hasloginfailed){
//         return <div>InValid Credentials</div>
//     }
//     else{
//         return null
//     }
// }

// function ShowSucceslogin(props){
//     if(props.showsuccessmsg){
//         return <div>Login Sucessfull</div>
//     }
//     else{
//         return null
//     }
// }

export default TodoApp