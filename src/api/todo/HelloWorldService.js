import axios from "axios"

class HelloWorldService{
    executeHelloWorldService(){
        //console.log("Executed Sevice")
       return axios.get('http://localhost:8080/helloworld')
    }

    executeHelloWorldBeanService(){
        //console.log("Executed Sevice")
       return axios.get('http://localhost:8080/hello-world-bean')
    }
    executeHelloWorldPathVariable(name){
        //console.log("Executed Sevice")
       return axios.get(`http://localhost:8080/helloworld/pathvariable/${name}`)
    }
}
export default new HelloWorldService()