class AuthenticationService{
    registerSuccessfullLogin(username,password){
        console.log('registerSuccessfullLogin')
        sessionStorage.setItem('authenticatedUser',username);
    }
    logout(){
        sessionStorage.removeItem('authenticatedUser')
    }
    isUserLoggedIn(){
        let user = sessionStorage.getItem('authenticatedUser')
        if(user===null)
            return false
        else
            return true
    }
    getLoggedInUsername(){
        let user = sessionStorage.getItem('authenticatedUser')
        if(user===null)
            return ''
        else
            return user
    }
}
// eslint-disable-next-line
export default new AuthenticationService()